

;(function () {
  function jq() { return window.jQuery || window.$; }
  function when(pred, fn) {
    if (pred()) return void fn();
    const obs = new MutationObserver(() => { if (pred()) { obs.disconnect(); fn(); } });
    obs.observe(document.documentElement, { childList: true, subtree: true });
    const iv = setInterval(() => { if (pred()) { clearInterval(iv); fn(); } }, 300);
  }

  const ECX_LOGIN   = 'https://engagecx.clarityvoice.com/#/login';
  const ECX_CONTROL = 'https://engagecx.clarityvoice.com/#/admin/omni/dashboard?topLayout=false';
  const ECX_AGENT   = 'https://engagecx.clarityvoice.com/#/agentConsole/message/index?includeWs=true&topLayout=false&navigationStyle=TopLeft';
  const ECX_ORIGIN = 'https://engagecx.clarityvoice.com';
  const ECX_IFRAME_ALLOW = [
    `camera ${ECX_ORIGIN}`,
    `microphone ${ECX_ORIGIN}`,
    `clipboard-write ${ECX_ORIGIN}`,
    `autoplay ${ECX_ORIGIN}`,
    `encrypted-media ${ECX_ORIGIN}`,
    `fullscreen ${ECX_ORIGIN}`,
    `picture-in-picture ${ECX_ORIGIN}`,
    `screen-wake-lock ${ECX_ORIGIN}`,
    `display-capture ${ECX_ORIGIN}`
  ].join('; ');

  let ecxNavPinned = false;
  let navObserver  = null;
  let ecxFrame     = null;
  let ecxParkEl    = null;
  let navKeeper    = null;

  function ensureEcxPark() {
    if (!ecxParkEl) {
      ecxParkEl = document.createElement('div');
      ecxParkEl.id = 'ecx-park';
      ecxParkEl.style.display = 'none';
      document.body.appendChild(ecxParkEl);
    }
  }

  function parkEcxIframe() {
    if (ecxFrame && ecxFrame.parentNode) {
      ensureEcxPark();
      ecxParkEl.appendChild(ecxFrame);
    }
  }

  function unparkEcxIframe(targetEl) {
    if (ecxFrame && targetEl && ecxFrame.parentNode !== targetEl) {
      targetEl.appendChild(ecxFrame);
    }
  }

  function startNavWatcher() {
    if (navObserver) return;
    navObserver = new MutationObserver(() => {
      if (!ecxNavPinned) return;
      const nav = document.querySelector('#nav-buttons');
      if (nav && !document.getElementById('nav-engagecx')) {
        ensureNavButton();
      }
    });
    navObserver.observe(document.body, { childList: true, subtree: true });
  }

  function stopNavWatcher() {
    navObserver?.disconnect();
    navObserver = null;
  }

  function startNavKeeper() {
    if (navKeeper) return;
    navKeeper = setInterval(() => {
      if (!ecxNavPinned) return;
      const nav = document.querySelector('#nav-buttons');
      if (nav && !document.getElementById('nav-engagecx')) {
        ensureNavButton();
      }
    }, 750);
  }

  function stopNavKeeper() {
    if (navKeeper) { clearInterval(navKeeper); navKeeper = null; }
  }

  function injectCssOnce() {
    if (document.getElementById('ecx-css')) return;
    const css = `
      #engagecx-wrap{background:#fff}
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
      #nav-engagecx{ display:list-item !important; }
    `;
    const s = document.createElement('style');
    s.id = 'ecx-css';
    s.textContent = css;
    document.head.appendChild(s);
  }

  function buildEcxPage() {
    injectCssOnce();
    const $ = jq(); if (!$) return;
    const $content = $('#content');
    if (!$content.length) return;

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
      $content.empty().append($wrap);
    }

    const $slot = $('#engagecx-slot');
    if (!ecxFrame) {
      ecxFrame = document.createElement('iframe');
      ecxFrame.id = 'engagecxFrame';
      ecxFrame.title = 'EngageCX';
      ecxFrame.src = ECX_CONTROL;
      ecxFrame.setAttribute('allow', ECX_IFRAME_ALLOW);
      ecxFrame.setAttribute('allowfullscreen', '');
      $slot[0].appendChild(ecxFrame);
    } else {
      unparkEcxIframe($slot[0]);
    }

    $(document)
      .off('click.ecxTabs')
      .on('click.ecxTabs', '#ecx-tabs a', function (e) {
        e.preventDefault();
        const tab = $(this).data('tab');
        $('#ecx-tabs a').removeClass('active');
        $(this).addClass('active');
        ecxFrame.src = (tab === 'agent') ? ECX_AGENT : ECX_CONTROL;
        setTimeout(()=>{ try { ecxFrame.contentWindow?.focus(); } catch {} }, 50);
      });
  }

  function ensureNavButton() {
    const $ = jq(); if (!$) return;
    if ($('#nav-engagecx').length) return;

    let $template = $('#nav-callhistory');
    if (!$template.length) $template = $('#nav-buttons').children('li').first();
    if (!$template.length) return;

    const $new = $template.clone();
    $new.attr('id', 'nav-engagecx');
    $new.attr('style', 'display:list-item');
    $new.find('a').attr('id', 'nav-engagecx-link').attr('href', '#');
    $new.find('.nav-text').text('EngageCX');
    $new.find('.nav-bg-image').removeAttr('style');

    const $after = $('#nav-callhistory');
    if ($after.length) $new.insertAfter($after); else $new.appendTo($('#nav-buttons'));

    $(document).off('click.ecxNav', '#nav-engagecx, #nav-engagecx a')
      .on('click.ecxNav', '#nav-engagecx, #nav-engagecx a', function (e) {
        e.preventDefault();
        $('#nav-buttons li').removeClass('nav-link-current');
        $('#nav-engagecx').addClass('nav-link-current');
        $('.navigation-title').text('EngageCX');
        buildEcxPage();
      });
  }

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

    const $videoAnywhere = $menu.find('a:contains("Clarity Video Anywhere")').closest('li');
    const $smart = $menu.find('a:contains("SMARTanalytics")').closest('li');
    if ($videoAnywhere.length && $smart.length) $smart.before($item); else $menu.append($item);

    $item.hover(
      function () { $(this).find('.dropdown-menu').first().stop(true, true).fadeIn(150); },
      function () { $(this).find('.dropdown-menu').first().stop(true, true).fadeOut(150); }
    );

    $(document).off('click.ecxOpenWin').on('click.ecxOpenWin', '#engagecx-open-window', function (e) {
      e.preventDefault();
      try { window.open(ECX_LOGIN, '_blank', 'noopener,noreferrer'); } catch { window.location.href = ECX_LOGIN; }
    });

    $(document).off('click.ecxViewPortal').on('click.ecxViewPortal', '#engagecx-view-portal', function (e) {
      e.preventDefault();
      ecxNavPinned = true;
      ensureNavButton();
      startNavWatcher();
      startNavKeeper();
      $('#nav-engagecx').find('a').trigger('click');
    });
  }

  document.addEventListener('click', function(ev){
    const a = ev.target.closest && ev.target.closest('#nav-buttons a');
    if (a && !a.closest('#nav-engagecx')) {
      parkEcxIframe();
    }
  }, true);

  when(() => jq() && jq()('#app-menu-list').length, injectAppsMenu);
})();

