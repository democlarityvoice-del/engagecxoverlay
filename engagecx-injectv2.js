// ===================== EngageCX Apps → Auto-Login → Inject Nav + Iframe =====================
;(function () {
  // ---------- tiny utilities ----------
  function when(pred, fn) {
    if (pred()) return void fn();
    const obs = new MutationObserver(() => { if (pred()) { obs.disconnect(); fn(); } });
    obs.observe(document.documentElement, { childList: true, subtree: true });
    const iv = setInterval(() => { if (pred()) { clearInterval(iv); fn(); } }, 300);
  }
  function jq() { return window.jQuery || window.$; }

  // ---------- derive portal user + domain safely ----------
 function getPortalIdentity($) {
  const norm = s => (s || '').replace(/\s+/g,' ').trim();
  const vis  = el => {
    if (!el) return false;
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return r.width > 0 && r.height > 0 &&
           cs.display !== 'none' && cs.visibility !== 'hidden' &&
           parseFloat(cs.opacity || '1') > 0.01;
  };

  // 1) If truly masquerading, the banner is ground truth
  const masq = Array.from(document.querySelectorAll('body *'))
    .find(el => vis(el) && /Masquerading as/i.test(norm(el.textContent)));
  if (masq) {
    const t = norm(masq.textContent);
    const m = t.match(/\(([0-9]+)\)\s*of\s+([a-z0-9._-]+)/i) ||
              t.match(/Masquerading as\s+([a-z0-9._-]+)@([a-z0-9._-]+)/i);
    if (m) return { user: m[1], domain: m[2].toLowerCase() };
  }

  // 2) Header username chip “… (token)” → user
  const headerRoot =
    document.querySelector('#nav-user-dropdown') ||
    document.querySelector('header, #header, .navbar, .topbar') ||
    document.body;

  const chip = Array.from(headerRoot.querySelectorAll('a,span,div,button,li'))
    .filter(el => vis(el) && /\([a-z0-9._-]{2,30}\)/i.test(norm(el.textContent)))
    .map(el => {
      const t = norm(el.textContent);
      const m = t.match(/\(([a-z0-9._-]{2,30})\)/i);
      const r = el.getBoundingClientRect();
      const fs = parseFloat(getComputedStyle(el).fontSize) || 0;
      return m ? { user: m[1], score: r.right + fs - r.top } : null;
    })
    .filter(Boolean)
    .sort((a,b) => b.score - a.score)[0];

  let user = chip ? chip.user : '';
  let domain = '';

  // 3) Resolve domain only for THIS user via ns-<DOMAIN>-<USER> cookie
  if (user) {
    const names = document.cookie.split(';').map(s => s.trim().split('=')[0]);
    const re = /^ns-([A-Z0-9-]+)-([A-Za-z0-9._-]+)$/i;
    const hit = names
      .map(n => n.match(re))
      .filter(Boolean)
      .map(m => ({ domain: m[1].toLowerCase(), user: m[2] }))
      .find(c => c.user.toLowerCase() === user.toLowerCase());
    if (hit) domain = hit.domain;
  }

  // 4) Last-resort domain (globals can be stale, but better than empty)
  if (!domain) {
    const g = String(window.current_domain || window.sub_domain || '').toLowerCase();
    if (g) domain = g;
  }

  return { user, domain };
}

  // ---------- dynamic login URL (filled after n8n validation) ----------
  function nextLoginUrl() {
    // prefer the autologin URL set by the n8n handshake
    if (window.engageCxLoginUrl) return window.engageCxLoginUrl;
    return 'https://engagecx.clarityvoice.com/#/login';
  }

  // ---------- one-time EngageCX nav + page bootstrapping (runs only after validation) ----------
  window.startEngageCx = function startEngageCx() {
    const $ = jq(); if (!$ || !$.fn || !$.fn.jquery) return;

    // 1) Add nav button once
    if (!$('#nav-engagecx').length) {
      // use an existing nav li as a template
      let $template = $('#nav-music');
      if (!$template.length) $template = $('#nav-buttons').children('li').first();
      if (!$template.length) return;

      const $new = $template.clone();
      $new.attr('id', 'nav-engagecx');
      $new.find('a').attr('id', 'nav-engagecx-link').attr('href', '#');
      $new.find('.nav-text').html('EngageCX');
      $new.find('.nav-bg-image').css({
        '-webkit-mask-image': "url('https://raw.githubusercontent.com/democlarityvoice-del/engagecxicon/main/message-regular-full.svg?v=3')",
        'mask-image':         "url('https://raw.githubusercontent.com/democlarityvoice-del/engagecxicon/main/message-regular-full.svg?v=3')",
        '-webkit-mask-repeat': 'no-repeat',
        'mask-repeat':         'no-repeat',
        '-webkit-mask-position':'center 48%',
        'mask-position':       'center 48%',
        '-webkit-mask-size':   '71% 71%',
        'mask-size':           '71% 71%',
        'background-color':    'rgba(255,255,255,0.92)'
      });

      const $after = $('#nav-callhistory');
      if ($after.length) $new.insertAfter($after);
      else $new.appendTo($('#nav-buttons'));
    }

    // 2) Wire the EngageCX page with toolbar + iframe (id-namespaced to avoid collisions)
    (function wirePageOnce() {
      const $ = jq(); if (!$) return;

      // layout helpers + scroll sync (namespaced)
      let _lock = false;
      function updateTopScroll() {
        const $slot  = $('#engagecx-slot');
        const $track = $('#engagecx-scrolltop .track');
        const $top   = $('#engagecx-scrolltop');
        if (!$slot.length || !$track.length || !$top.length) return;
        $track.css('minWidth', ($slot[0].scrollWidth || 0) + 1);
        $top[0].scrollLeft = $slot[0].scrollLeft;
      }
      function setupTopScroll() {
        const $slot = $('#engagecx-slot'); if (!$slot.length) return;
        let $top = $('#engagecx-scrolltop');
        if (!$top.length) {
          $top = $('<div id="engagecx-scrolltop"><div class="track"></div></div>')
            .css({height:'16px', overflowX:'scroll', overflowY:'hidden', position:'sticky', top:0, zIndex:30, background:'#fafafa', width:'100%'});
          $top.insertBefore($slot);
          $top.find('.track').css({display:'block', height:'1px'});
        }
        $top.off('scroll.ecxSync').on('scroll.ecxSync', function () {
          if (_lock) return; _lock = true; $slot.scrollLeft(this.scrollLeft); _lock = false;
        });
        $slot.off('scroll.ecxSyncTop').on('scroll.ecxSyncTop', function () {
          if (_lock) return; _lock = true; $top.scrollLeft($slot.scrollLeft()); _lock = false;
        });
        updateTopScroll();
      }
      function updateRightScroll() {
        const $slot = $('#engagecx-slot'), $track = $('#engagecx-scrollright .vtrack');
        if ($slot.length && $track.length) {
          $track.height($slot[0].scrollWidth || 0);
          $('#engagecx-scrollright').height($slot.innerHeight() || 0);
        }
      }
      function setupRightScroll() {
        const $slot = $('#engagecx-slot'); if (!$slot.length) return;
        let $right = $('#engagecx-scrollright');
        if (!$right.length) {
          $right = $('<div id="engagecx-scrollright"><div class="vtrack"></div></div>')
            .css({width:'16px', overflowY:'auto', overflowX:'hidden', position:'sticky', top:0, alignSelf:'flex-end', zIndex:30, background:'#fafafa'});
          $slot.append($right);
        }
        $right.find('.vtrack').css({display:'block', width:'1px'});
        $right.off('scroll.ecxSync').on('scroll.ecxSync', function () {
          if (_lock) return; _lock = true; $slot.scrollLeft(this.scrollTop); _lock = false;
        });
        $slot.off('scroll.ecxSyncRight').on('scroll.ecxSyncRight', function () {
          if (_lock) return; _lock = true; $right.scrollTop($slot.scrollLeft()); _lock = false;
        });
        updateRightScroll();
      }

      function nudgeIframe() {
        const $f = $('#engagecxFrame'); if (!$f.length) return;
        const el = $f[0];
        const origW = el.style.width || '100%';
        [0, 150, 400, 900, 1600].forEach(ms => {
          setTimeout(() => { $f.css('width', '99.6%'); void el.offsetWidth; $f.css('width', origW); window.dispatchEvent(new Event('resize')); }, ms);
        });
      }

      let isExpanded = false;
      const EXPAND_PX = 420;
      function applyExpandState() {
        const $slot = $('#engagecx-slot');
        const $f = $('#engagecxFrame');
        if (!$slot.length || !$f.length) return;
        $slot.css({ position: 'relative', overflowX: 'auto' });
        if (isExpanded) {
          $f.css('width', `calc(100% + ${EXPAND_PX}px)`);
          requestAnimationFrame(() => { $slot[0].scrollLeft = $slot[0].scrollWidth; });
        } else {
          $f.css('width', '100%');
          requestAnimationFrame(() => { $slot[0].scrollLeft = 0; });
        }
        nudgeIframe();
        $('#engagecx-expand').text(isExpanded ? 'Reset Width' : 'Expand / Scroll Right');
        updateTopScroll(); updateRightScroll();
      }

      // main click → render page
      $(document).off('click.ecxNav', '#nav-engagecx, #nav-engagecx a')
      .on('click.ecxNav', '#nav-engagecx, #nav-engagecx a', function (e) {
        e.preventDefault(); e.stopPropagation();

        $('#nav-buttons li').removeClass('nav-link-current');
        $('#nav-engagecx').addClass('nav-link-current');
        $('.navigation-title').text('EngageCX');

        const $content = $('#content').empty();
        let $slot = $('#engagecx-slot');
        if (!$slot.length) $slot = $('<div id="engagecx-slot"></div>').appendTo('#content');
        else $slot.empty();

        const $bar = $(`
          <div style="display:flex;flex-direction:column;gap:6px;
               padding:10px 12px;border-bottom:1px solid #e5e7eb;background:#fafafa;">
            <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
              <button id="engagecx-go-agent"  class="btn btn-small" style="padding:6px 10px;cursor:pointer;">Go to Agents Panel</button>
              <button id="engagecx-go-control" class="btn btn-small" style="padding:6px 10px;cursor:pointer;">Go to Control Panel</button>
              <button id="engagecx-refresh"   class="btn btn-small" style="padding:6px 10px;cursor:pointer;" title="Click to refresh session or login/logout.">Refresh / Log out</button>
              <button id="engagecx-expand"    class="btn btn-small" style="padding:6px 10px;cursor:pointer;">Expand / Scroll Right</button>
            </div>
          </div>
        `);

        const $iframe = $('<iframe>', {
          id: 'engagecxFrame',
          src: nextLoginUrl(),
          style: 'border:none; width:100%; height:calc(100vh - 240px); min-height:800px; overflow:auto;',
          scrolling: 'yes'
        });

        $iframe.on('load', function () {
          nudgeIframe();
          applyExpandState();
          updateTopScroll();
          updateRightScroll();
        });

        $slot.append($bar, $iframe);
        setupTopScroll();
        setupRightScroll();
        applyExpandState();
      });

      // route helpers & controls
      const targetUrl  = 'https://engagecx.clarityvoice.com/#/agentConsole/message?includeWs=true&isTicket=true&topLayout=true';
      const controlUrl = 'https://engagecx.clarityvoice.com/#/admin/widget/dashboard?noLayout=false';

      $(document).off('click.ecxGoAgent')
      .on('click.ecxGoAgent', '#engagecx-go-agent', function (e) {
        e.preventDefault();
        $('#engagecxFrame').attr('src', targetUrl);
        nudgeIframe(); applyExpandState(); updateTopScroll(); updateRightScroll();
      });

      $(document).off('click.ecxGoControl')
      .on('click.ecxGoControl', '#engagecx-go-control', function (e) {
        e.preventDefault();
        $('#engagecxFrame').attr('src', controlUrl);
        nudgeIframe(); applyExpandState(); updateTopScroll(); updateRightScroll();
      });

      $(document).off('click.ecxRefresh')
      .on('click.ecxRefresh', '#engagecx-refresh', function (e) {
        e.preventDefault();
        try { window.open('https://engagecx.clarityvoice.com/#/logout?t=' + Date.now(), 'EngageCXLogout', 'width=900,height=700,noopener,noreferrer'); } catch {}
        $('#engagecxFrame').attr('src', nextLoginUrl());
        nudgeIframe(); applyExpandState(); updateTopScroll(); updateRightScroll();
      });

      $(document).off('click.ecxExpand')
      .on('click.ecxExpand', '#engagecx-expand', function (e) {
        e.preventDefault();
        isExpanded = !isExpanded;
        applyExpandState(); updateTopScroll(); updateRightScroll();
      });

      $(window).off('resize.ecxScrolls')
        .on('resize.ecxScrolls', function () { updateTopScroll(); updateRightScroll(); });
    })();

    // 3) After wiring, simulate click to land the user in the view
    $('#nav-engagecx').find('a').trigger('click');
  };

  // ---------- Inject the Apps → EngageCX submenu (source of truth for launch) ----------
  function injectAppsMenu() {
    const $ = jq(); if (!$) return;

    const $menu = $('#app-menu-list');
    if (!$menu.length || $menu.find('li.engagecx-menu').length) return;

    const $item = $(`
      <li class="dropdown-submenu engagecx-menu" id="engagecx-submenu">
        <a tabindex="-1" href="#">EngageCX</a>
        <ul class="dropdown-menu" style="top:0;left:100%;margin-top:0;margin-left:0;display:none;">
          <li><a href="#" id="engagecx-open-window" target="_blank" rel="noopener noreferrer">Open in window</a></li>
          <li><a href="#" id="engagecx-view-portal">View in portal</a></li>
        </ul>
      </li>
    `);

    // insert between “Clarity Video Anywhere” and “SMARTanalytics” if both exist
    const $videoAnywhere = $menu.find('a:contains("Clarity Video Anywhere")').closest('li');
    const $smart = $menu.find('a:contains("SMARTanalytics")').closest('li');
    if ($videoAnywhere.length && $smart.length) $smart.before($item); else $menu.append($item);

    // hover for flyout
    $item.hover(
      function () { $(this).find('.dropdown-menu').first().stop(true, true).fadeIn(150); },
      function () { $(this).find('.dropdown-menu').first().stop(true, true).fadeOut(150); }
    );

    // Open in window: if we already have an autologin URL, use it; else fall back to login
    $(document).off('click.ecxOpenWin').on('click.ecxOpenWin', '#engagecx-open-window', function (e) {
      e.preventDefault();
      const url = nextLoginUrl();
      try { window.open(url, '_blank', 'noopener,noreferrer'); } catch { window.location.href = url; }
    });

    // View in portal: handshake with n8n → inject nav → autologin iframe
    // View in portal: handshake with n8n → inject nav → autologin iframe
$(document).off('click.ecxViewPortal').on('click.ecxViewPortal', '#engagecx-view-portal', async function (e) {
  e.preventDefault();

  const { user, domain } = getPortalIdentity(jQuery);
  if (!user || !domain) {
    alert('Unable to determine your portal user or domain. Please refresh and try again.');
    return;
  }

  let data;
  try {
    const res = await fetch('https://n8n.clarityvoice.click/webhook/engagecx-login-validation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-client-id': 'portal-auto-login-client',
        'x-client-secret': 'clarity-ecx-authtoken-2025'
      },
      body: JSON.stringify({ user, domain })  // if your n8n expects portalUser/portalDomain, rename here
    });
    data = await res.json().catch(() => ({}));
    if (!res.ok || data.ok === false) {
      throw new Error(data.error || ('HTTP ' + res.status));
    }
  } catch (err) {
    console.error('[EngageCX] n8n validation failed:', err);
    alert('Sorry—could not validate your EngageCX access right now.');
    return;
  }

  // Prefer a prebuilt URL from n8n; otherwise build it from company + userId
  window.engageCxLoginUrl = data.iframeUrl || (
    'https://engagecx.clarityvoice.com/#/agentConsole/message'
    + '?includeWs=true&autoLogon=true'
    + `&company=${encodeURIComponent(data.company)}`
    + `&userId=${encodeURIComponent(data.userId)}`
    + '&topLayout=false&navigationStyle=TopLeft'
  );

  // Inject the nav + render the page
  window.startEngageCx();
});
  }

  // ---------- boot when jQuery + Apps menu exist ----------
  when(() => jq() && jq()('#app-menu-list').length, injectAppsMenu);
})();

