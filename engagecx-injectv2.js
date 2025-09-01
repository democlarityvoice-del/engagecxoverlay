// ===================== EngageCX Apps → Tabs + Persistent Iframe (no SSO) =====================
;(function () {
  // ---------- tiny utilities ----------
  function jq() { return window.jQuery || window.$; }
  function when(pred, fn) {
    if (pred()) return void fn();
    const obs = new MutationObserver(() => { if (pred()) { obs.disconnect(); fn(); } });
    obs.observe(document.documentElement, { childList: true, subtree: true });
    const iv = setInterval(() => { if (pred()) { clearInterval(iv); fn(); } }, 300);
  }

  // ---------- constants ----------
  const ECX_LOGIN   = 'https://engagecx.clarityvoice.com/#/login';
  const ECX_CONTROL = 'https://engagecx.clarityvoice.com/#/admin/omni/dashboard?topLayout=false';
  const ECX_AGENT   = 'https://engagecx.clarityvoice.com/#/agentConsole/message/index?includeWs=true&topLayout=false&navigationStyle=TopLeft';


// At top (initial state):
window.ecxNavPinned = sessionStorage.getItem('ecxPinned') === 'true';



 // once user chooses View in portal, keep ECX in nav
  let navObserver  = null;   // MutationObserver for nav rebuilds


  const ECX_ORIGIN = 'https://engagecx.clarityvoice.com';
  const ECX_IFRAME_ALLOW = [
    `camera ${ECX_ORIGIN}`,
    `microphone ${ECX_ORIGIN}`,
    `clipboard-write ${ECX_ORIGIN}`,
    `autoplay ${ECX_ORIGIN}`,
    `encrypted-media ${ECX_ORIGIN}`,
    `picture-in-picture ${ECX_ORIGIN}`,
    `screen-wake-lock ${ECX_ORIGIN}`,
    `display-capture ${ECX_ORIGIN}`
  ].join('; ');

  // ---------- state ----------
  let ecxBooted = false;     // <— missing before
  let ecxFrame  = null;      // <— missing before
  let ecxParkEl = null;      // hidden parking spot for the iframe

  function ensureEcxPark() {
    if (!ecxParkEl) {
      ecxParkEl = document.createElement('div');
      ecxParkEl.id = 'ecx-park';
      ecxParkEl.style.display = 'none';
      document.body.appendChild(ecxParkEl);
    }
  }
  function parkEcxIframe() {                // move (don’t clone) the iframe out of #content
    if (ecxFrame && ecxFrame.parentNode) {
      ensureEcxPark();
      ecxParkEl.appendChild(ecxFrame);
    }
  }
  function unparkEcxIframe(targetEl) {      // move it back when we show EngageCX again
    if (ecxFrame && targetEl && ecxFrame.parentNode !== targetEl) {
      targetEl.appendChild(ecxFrame);
    }
  }

  // --- keep EngageCX nav button present across nav rebuilds ---
function startNavWatcher() {
  if (navObserver) return; // only one
  navObserver = new MutationObserver(() => {
    if (!window.ecxNavPinned) return;
    const nav = document.querySelector('#nav-buttons');
    if (nav && !document.getElementById('nav-engagecx')) {
      // nav got rebuilt and our item disappeared → re-add it
      ensureNavButton();
    }
  });
  // portal may replace large chunks; watch broadly
  navObserver.observe(document.body, { childList: true, subtree: true });
}

function stopNavWatcher() {
  navObserver?.disconnect();
  navObserver = null;
}

let navKeeper = null;

function startNavKeeper() {
  if (navKeeper) return;
  navKeeper = setInterval(() => {
    if (!window.ecxNavPinned) return;

    // Re-add button if nuked
    if (!document.getElementById('nav-engagecx')) {
      ensureNavButton();
    }

    // Re-start the MutationObserver if it died
    if (!navObserver) {
      startNavWatcher();
    }
  }, 750);
}


  // ---------- styles (Inventory-style tabs; active tab = black text) ----------
  function injectCssOnce() {
    if (document.getElementById('ecx-css')) return;
    const css = `
      #engagecx-wrap{background:#fff}
      /* Tabs bar styled like Inventory; namespaced to #ecx-tabs */
      #ecx-tabs{display:flex;gap:18px;margin:0;padding:12px 12px 0;border-bottom:1px solid #d1d5db;background:#f7f7f7}
      #ecx-tabs a{
        color:#1372cc; text-decoration:none; padding:7px 12px; display:inline-block;
        border:1px solid transparent; border-bottom:0; border-radius:6px 6px 0 0;
        margin-right:12px;
      }
      #ecx-tabs a:hover{text-decoration:underline}
      #ecx-tabs a.active{
        color:#000; background:#fff; border-color:#d1d5db #d1d5db #fff; font-weight:600; text-decoration:none
      }
      #engagecx-slot{position:relative;overflow:auto}
      #engagecxFrame{border:none;width:100%;height:calc(100vh - 240px);min-height:800px}

    
      
    `;
    const s = document.createElement('style');
    s.id = 'ecx-css';
    s.textContent = css;
    document.head.appendChild(s);
  }

  // ---------- build the EngageCX page (only when requested) ----------
  function buildEcxPage() {
    injectCssOnce();
    const $ = jq(); if (!$) return;
    const $content = $('#content');
    if (!$content.length) return;

    // shell
    let $wrap = $('#engagecx-wrap');
    if (!$wrap.length) {
      $wrap = $(`
        <div id="engagecx-wrap">
          <div id="ecx-tabs" class="ecx-tabs">
            <a href="#" id="ecx-tab-control" data-tab="control" class="active">Control Panel</a>
            <a href="#" id="ecx-tab-agent"   data-tab="agent">Agents Panel</a>
          </div>
          <div id="engagecx-slot"></div>
        </div>
      `);
      $content.empty().append($wrap);
    } else {
      $content.empty().append($wrap); // re-attach if user navigated away and back
    }

    // persistent iframe
    const $slot = $('#engagecx-slot');
    if (!ecxFrame) {
      ecxFrame = document.createElement('iframe');
      ecxFrame.id = 'engagecxFrame';
      ecxFrame.title = 'EngageCX';
      ecxFrame.src = ECX_CONTROL; // default tab
      ecxFrame.setAttribute('allow', ECX_IFRAME_ALLOW);
      ecxFrame.setAttribute('allowfullscreen', '');
      $slot[0].appendChild(ecxFrame);
    } else {
      unparkEcxIframe($slot[0]); // move the existing one back in
    }


  // Pin the nav only after ECX has actually loaded once
  ecxFrame.addEventListener('load', () => {
    if (!window.ecxNavPinned) {
      window.ecxNavPinned = true;
      sessionStorage.setItem('ecxPinned','true');
    }
  }, { once: true });


    // tab behavior (toggle active class + swap src)
    $(document)
      .off('click.ecxTabs')
      .on('click.ecxTabs', '#ecx-tabs a', function (e) {
        e.preventDefault();
        const tab = $(this).data('tab');
        $('#ecx-tabs a').removeClass('active');
        $(this).addClass('active');
        ecxFrame.src = (tab === 'agent') ? ECX_AGENT : ECX_CONTROL;

        // (optional) help device prompts by focusing the frame
        setTimeout(()=>{ try { ecxFrame.contentWindow?.focus(); } catch {} }, 50);
      });
  }

  // ---------- optional left-nav entry (created only after “View in portal”) ----------
function ensureNavButton() {
  const $ = jq(); if (!$) return;
  const $buttons = $('#nav-buttons'); if (!$buttons.length) return;

  if (!$('#nav-engagecx').length) {
    // clone an existing nav li so structure/classes stay intact
    let $template = $('#nav-callhistory');
    if (!$template.length) $template = $('#nav-buttons').children('li').first();
    if (!$template.length) return;

    const baseDisplay = getComputedStyle($template[0]).display; // e.g., "flex" or "block"

    const $new = $template.clone();
    $new.attr('id', 'nav-engagecx').addClass('engagecx-persist');
    $new[0].style.display = baseDisplay; // match the row’s item display


    // label
    $new.find('.nav-text').text('EngageCX');

    // ICON: DO NOT remove classes; just apply the mask + color
    const $icon = $new.find('.nav-bg-image');
    $icon.css({
      '-webkit-mask-image': "url('https://raw.githubusercontent.com/democlarityvoice-del/engagecxicon/main/message-regular-full.svg?v=3')",
      'mask-image':         "url('https://raw.githubusercontent.com/democlarityvoice-del/engagecxicon/main/message-regular-full.svg?v=3')",
      '-webkit-mask-repeat':'no-repeat',
      'mask-repeat':        'no-repeat',
      '-webkit-mask-position':'center 48%',
      'mask-position':      'center 48%',
      '-webkit-mask-size':  '71% 71%',
      'mask-size':          '71% 71%',
      'background-color':   'rgba(255,255,255,0.92)'
    });

    // place it in the same row (right after Call History if present)
    const $after = $('#nav-callhistory');
    if ($after.length) $new.insertAfter($after); else $buttons.append($new);

    // NEW: observer to keep it visible
    (function keepVisible(li, baseDisplay){
      const obs = new MutationObserver(() => {
        if (li.style && li.style.display === 'none') li.style.display = baseDisplay || '';
        if (li.classList && li.classList.contains('hidden')) li.classList.remove('hidden');
      });
      obs.observe(li, { attributes:true, attributeFilter:['style','class'] });
    })($new[0], baseDisplay);

    // click handler to show EngageCX view
    $(document).off('click.engagecx', '#nav-engagecx, #nav-engagecx a')
      .on('click.engagecx', '#nav-engagecx, #nav-engagecx a', function (e) {
        e.preventDefault();
        $('#nav-buttons li').removeClass('nav-link-current');
        $('#nav-engagecx').addClass('nav-link-current');
        $('.navigation-title').text('EngageCX');
        buildEcxPage();
      });
  } else {
    // if it exists but the portal hid it, unhide and persist
    $('#nav-engagecx').addClass('engagecx-persist').css('display',''); // clear inline display if portal hid i
  }
}




  // ---------- Apps menu (source of truth to launch) ----------
  function injectAppsMenu() {
    const $ = jq(); if (!$) return;
    const $menu = $('#app-menu-list');
    if (!$menu.length || $menu.find('li.engagecx-menu').length) return;

    const $item = $(`
      <li class="dropdown-submenu engagecx-menu" id="engagecx-submenu">
        <a tabindex="-1" href="#">EngageCX</a>
        <ul class="dropdown-menu" style="top:0;left:100%;margin-top:0;margin-left:0;display:none;">
          <li><a href="#" id="engagecx-open-window" target="_blank" rel="noopener noreferrer">Open in Window</a></li>
          <li><a href="#" id="engagecx-view-portal">View in Portal</a></li>
        </ul>
      </li>
    `);

    // insert between neighbors if present; else append
    const $videoAnywhere = $menu.find('a:contains("Clarity Video Anywhere")').closest('li');
    const $smart = $menu.find('a:contains("SMARTanalytics")').closest('li');
    if ($videoAnywhere.length && $smart.length) $smart.before($item); else $menu.append($item);

    // hover flyout
    $item.hover(
      function () { $(this).find('.dropdown-menu').first().stop(true, true).fadeIn(150); },
      function () { $(this).find('.dropdown-menu').first().stop(true, true).fadeOut(150); }
    );

    // Open in window → always go to login
    $(document).off('click.ecxOpenWin').on('click.ecxOpenWin', '#engagecx-open-window', function (e) {
      e.preventDefault();
      try { window.open(ECX_LOGIN, '_blank', 'noopener,noreferrer'); } catch { window.location.href = ECX_LOGIN; }
    });

    // View in portal → create nav + show tabs page (no SSO)
    $(document).off('click.ecxViewPortal').on('click.ecxViewPortal', '#engagecx-view-portal', function (e) {
      e.preventDefault();
      window.ecxNavPinned = true;       // mark as pinned so the watcher keeps it around
     ensureNavButton();         // add it now (if missing)
     startNavWatcher();         // keep it present through future nav rebuilds
     startNavKeeper();          // << THIS is what was missing
     $('#nav-engagecx').find('a').trigger('click');
    });

  }

  // Park iframe before portal navigates away via other left-nav items
  document.addEventListener('click', function(ev){
    const a = ev.target.closest && ev.target.closest('#nav-buttons a');
    if (a && !a.closest('#nav-engagecx')) {
      parkEcxIframe(); // <— fixed name
    }
  }, true); // capture phase so we run before the portal handler

// ---------- boot once Apps menu exists (no auto page render) ----------
when(() => jq() && jq()('#app-menu-list').length, injectAppsMenu);

when(() => jq() && jq()('#nav-buttons').length && window.ecxNavPinned, () => {
  ensureNavButton();
  startNavWatcher();
  startNavKeeper();
});


// Backstop: if DOM gets rebuilt and our button disappears, restore it + watcher
setInterval(() => {
  if (window.ecxNavPinned &&
      !document.getElementById('nav-engagecx') &&
      document.getElementById('nav-buttons')) {
    ensureNavButton();
    startNavWatcher();
  }
}, 2500);
})();


