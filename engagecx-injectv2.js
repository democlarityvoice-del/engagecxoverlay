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

  // session flag: show ECX button in this tab after first use
  try { window.ecxNavPinned = sessionStorage.getItem('ecxPinned') === 'true'; } catch { window.ecxNavPinned = false; }

  const ECX_ORIGIN = 'https://engagecx.clarityvoice.com';
  const ECX_IFRAME_ALLOW = [
    'camera ' + ECX_ORIGIN,
    'microphone ' + ECX_ORIGIN,
    'clipboard-write ' + ECX_ORIGIN,
    'autoplay ' + ECX_ORIGIN,
    'encrypted-media ' + ECX_ORIGIN,
    'picture-in-picture ' + ECX_ORIGIN,
    'screen-wake-lock ' + ECX_ORIGIN,
    'display-capture ' + ECX_ORIGIN
  ].join('; ');

  // ---------- state ----------
  var ecxFrame  = null;      // persistent iframe element
  var ecxParkEl = null;      // hidden parking spot for the iframe

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

  // ---------- styles (Inventory-style tabs; active tab = black text) ----------
  function injectCssOnce() {
    if (document.getElementById('ecx-css')) return;
    var css = [
      '#engagecx-wrap{background:#fff}',
      '/* Tabs bar styled like Inventory; namespaced to #ecx-tabs */',
      '#ecx-tabs{display:flex;gap:18px;margin:0;padding:12px 12px 0;border-bottom:1px solid #d1d5db;background:#f7f7f7}',
      '#ecx-tabs a{color:#1372cc;text-decoration:none;padding:7px 12px;display:inline-block;border:1px solid transparent;border-bottom:0;border-radius:6px 6px 0 0;margin-right:12px}',
      '#ecx-tabs a:hover{text-decoration:underline}',
      '#ecx-tabs a.active{color:#000;background:#fff;border-color:#d1d5db #d1d5db #fff;font-weight:600;text-decoration:none}',
      '#engagecx-slot{position:relative;overflow:auto}',
      '#engagecxFrame{border:none;width:100%;height:calc(100vh - 240px);min-height:800px}'
    ].join('\n');
    var s = document.createElement('style');
    s.id = 'ecx-css';
    s.textContent = css;
    document.head.appendChild(s);
  }

  // ---------- build the EngageCX page (only when requested) ----------
  function buildEcxPage() {
    injectCssOnce();
    var $ = jq(); if (!$) return;
    var $content = $('#content');
    if (!$content.length) return;

    // shell
    var $wrap = $('#engagecx-wrap');
    if (!$wrap.length) {
      $wrap = $(
        '<div id="engagecx-wrap">' +
          '<div id="ecx-tabs" class="ecx-tabs">' +
            '<a href="#" id="ecx-tab-control" data-tab="control" class="active">Control Panel</a>' +
            '<a href="#" id="ecx-tab-agent"   data-tab="agent">Agents Panel</a>' +
          '</div>' +
          '<div id="engagecx-slot"></div>' +
        '</div>'
      );
      $content.empty().append($wrap);
    } else {
      $content.empty().append($wrap); // re-attach if user navigated away and back
    }

    // persistent iframe
    var $slot = $('#engagecx-slot');
    if (!ecxFrame) {
      ecxFrame = document.createElement('iframe');
      ecxFrame.id = 'engagecxFrame';
      ecxFrame.title = 'EngageCX';
      ecxFrame.src = ECX_CONTROL; // default tab
      ecxFrame.setAttribute('allow', ECX_IFRAME_ALLOW);
      ecxFrame.setAttribute('allowfullscreen', '');
      $slot[0].appendChild(ecxFrame);

      // after the first real load, pin the nav for this session
      ecxFrame.addEventListener('load', function () {
        if (!window.ecxNavPinned) {
          window.ecxNavPinned = true;
          try { sessionStorage.setItem('ecxPinned','true'); } catch {}
        }
      }, { once: true });
    } else {
      unparkEcxIframe($slot[0]); // move the existing one back in
    }

    // tab behavior (toggle active class + swap src)
    $(document)
      .off('click.ecxTabs')
      .on('click.ecxTabs', '#ecx-tabs a', function (e) {
        e.preventDefault();
        var tab = $(this).data('tab');
        $('#ecx-tabs a').removeClass('active');
        $(this).addClass('active');
        ecxFrame.src = (tab === 'agent') ? ECX_AGENT : ECX_CONTROL;
        setTimeout(function(){ try { ecxFrame.contentWindow && ecxFrame.contentWindow.focus(); } catch(e){} }, 50);
      });
  }

  // ---------- optional left-nav entry (created only after “View in portal”) ----------
  function ensureNavButton() {
    var $ = jq(); if (!$) return;
    var $buttons = $('#nav-buttons'); if (!$buttons.length) return;

    var $existing = $('#nav-engagecx');
    if (!$existing.length) {
      // clone an existing nav li so structure/classes stay intact
      var $template = $('#nav-callhistory');
      if (!$template.length) $template = $buttons.children('li').first();
      if (!$template.length) return;

      var baseDisplay = '';
      try { baseDisplay = getComputedStyle($template[0]).display; } catch {}
      var $new = $template.clone();
      $new.attr('id', 'nav-engagecx');

      // anchor + label
      var $a = $new.find('a').first();
      $a.attr('id', 'nav-engagecx-link').attr('href', '#').attr('aria-label', 'EngageCX');
      $new.find('.nav-text').text('EngageCX');

      // icon (mask)
      var $icon = $new.find('.nav-bg-image');
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
      var $after = $('#nav-callhistory');
      if ($after.length) $new.insertAfter($after); else $buttons.append($new);

      // normalize display so it doesn't wrap a new row
      if (baseDisplay) $new[0].style.display = baseDisplay;

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
      $existing.css('display',''); // clear inline display if portal hid it
      $existing.removeClass('hidden');
    }
  }

  // ---------- Apps menu (source of truth to launch) ----------
  function injectAppsMenu() {
    var $ = jq(); if (!$) return;
    var $menu = $('#app-menu-list');
    if (!$menu.length || $menu.find('li.engagecx-menu').length) return;

    var $item = $(
      '<li class="dropdown-submenu engagecx-menu" id="engagecx-submenu">' +
        '<a tabindex="-1" href="#">EngageCX</a>' +
        '<ul class="dropdown-menu" style="top:0;left:100%;margin-top:0;margin-left:0;display:none;">' +
          '<li><a href="#" id="engagecx-open-window" target="_blank" rel="noopener noreferrer">Open in Window</a></li>' +
          '<li><a href="#" id="engagecx-view-portal">View in Portal</a></li>' +
        '</ul>' +
      '</li>'
    );

    // insert between neighbors if present; else append
    var $videoAnywhere = $menu.find('a:contains("Clarity Video Anywhere")').closest('li');
    var $smart = $menu.find('a:contains("SMARTanalytics")').closest('li');
    if ($videoAnywhere.length && $smart.length) $smart.before($item); else $menu.append($item);

    // hover flyout
    $item.hover(
      function () { $(this).find('.dropdown-menu').first().stop(true, true).fadeIn(150); },
      function () { $(this).find('.dropdown-menu').first().stop(true, true).fadeOut(150); }
    );

    // Open in window → always go to login
    $(document).off('click.ecxOpenWin').on('click.ecxOpenWin', '#engagecx-open-window', function (e) {
      e.preventDefault();
      try { window.open(ECX_LOGIN, '_blank', 'noopener,noreferrer'); } catch (err) { window.location.href = ECX_LOGIN; }
    });

    // View in portal → create nav + show tabs page (no SSO)
    $(document).off('click.ecxViewPortal').on('click.ecxViewPortal', '#engagecx-view-portal', function (e) {
      e.preventDefault();

      // ✅ Persist the “I chose EngageCX” state for this tab/session
      window.ecxNavPinned = true;
      try { sessionStorage.setItem('ecxPinned','true'); } catch {}

      ensureNavButton();               // add it now (if missing)
      $('#nav-engagecx').find('a').trigger('click'); // switch to our page
    });
  }

  // Park iframe before portal navigates away via other left-nav items
  document.addEventListener('click', function(ev){
    var a = ev.target && ev.target.closest ? ev.target.closest('#nav-buttons a') : null;
    if (a && !a.closest('#nav-engagecx')) {
      parkEcxIframe();
    }
  }, true); // capture phase so we run before the portal handler

  // ---------- boot once Apps menu exists (no auto page render) ----------
  when(function(){ return jq() && jq()('#app-menu-list').length; }, injectAppsMenu);

  // If user had previously pinned ECX in *this tab*, restore the button right away
  when(function(){ return jq() && jq()('#nav-buttons').length && window.ecxNavPinned; }, function(){
    ensureNavButton();
  });

  /* --- ECX nav button persistence + top-row placement hotfix --- */
  (function () {
    function keepButton() {
      if (!window.ecxNavPinned) return;

      var nav = document.getElementById('nav-buttons');
      if (!nav) return;

      var li = document.getElementById('nav-engagecx');

      // If the portal nuked the button, recreate it
      if (!li) {
        if (typeof ensureNavButton === 'function') ensureNavButton();
        li = document.getElementById('nav-engagecx');
        if (!li) return; // nothing to do until nav exists
      }

      // Make sure it’s visible + on the same row as Call History
      var ref = document.getElementById('nav-callhistory') || nav.querySelector('li');
      if (ref && li.previousElementSibling !== ref) ref.after(li);

      // Match the row’s display so it doesn’t wrap to the next line
      try { li.style.display = getComputedStyle(ref).display; } catch (e) {}

      // Undo portal hiding tricks
      li.classList.remove('hidden');
      if (li.style.display === 'none') {
        try { li.style.display = getComputedStyle(ref).display; } catch (e2) { li.style.display = ''; }
      }
    }

    // Re-assert on any DOM churn and on a slow heartbeat (belt + suspenders)
    try { new MutationObserver(keepButton).observe(document.body, { childList: true, subtree: true }); } catch (e) {}
    setInterval(keepButton, 1200);
    keepButton(); // run once at load, too
  })();

})();
