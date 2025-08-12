// ===== EngageCX bootstrap (waits for jQuery + nav) =====
;(function () {
  function when(pred, fn) {
    if (pred()) return void fn();
    const obs = new MutationObserver(() => { if (pred()) { obs.disconnect(); fn(); } });
    obs.observe(document.documentElement, { childList: true, subtree: true });
    const iv = setInterval(() => { if (pred()) { clearInterval(iv); fn(); } }, 300);
  }

  function start() {
    let $template = $('#nav-music');
    if (!$template.length) $template = $('#nav-buttons').children('li').first();
    if (!$template.length) return;

    //-------------------------------------------------------------------------------
  // keep the cover sized/placed
function positionLogoutCover() {
  const $slot  = $('#engagecx-slot');
  const $cover = $('#engagecx-logout-cover');
  if (!$slot.length || !$cover.length) return;

  $slot.css({ position: 'relative', overflowX: 'auto' });
  $cover.css({
    top:   LOGOUT_TOP_PX + 'px',
    right: LOGOUT_RIGHT_PX + 'px',
    width: LOGOUT_WIDTH_PX + 'px',
    height: LOGOUT_HEIGHT_PX + 'px'
  });
}

// create (if needed) + make it invisible but click-blocking, then position it
function ensureLogoutCover() {
  let $cover = $('#engagecx-logout-cover');
  if (!$cover.length) {
    $cover = $('<div id="engagecx-logout-cover"></div>').appendTo('#engagecx-slot');
  }
  $cover
    .text('').attr('title','')
    .css({
      position: 'absolute',
      zIndex: 50,
      background: 'transparent',
      borderRadius: '6px',
      pointerEvents: 'auto',  // eat clicks so Logout can’t be clicked
      cursor: 'default',
      userSelect: 'none'
    })
    .off('click mousedown mouseup')
    .on('click mousedown mouseup', e => { e.preventDefault(); e.stopPropagation(); });

  positionLogoutCover();
}


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
    if ($after.length) $new.insertAfter($after); else $new.appendTo($('#nav-buttons'));

    function nextLoginUrl() {
      return 'https://engagecx.clarityvoice.com/#/login?t=' + Date.now() +
             '&r=' + Math.random().toString(36).slice(2);
    }
    const targetUrl  = 'https://engagecx.clarityvoice.com/#/agentConsole/message?includeWs=true&isTicket=true&topLayout=true';
    const controlUrl = 'https://engagecx.clarityvoice.com/#/admin/widget/dashboard?noLayout=false';

    // --- layout helpers ---
    function nudgeIframe() {
      const $f = $('#engagecxFrame');
      if (!$f.length) return;
      const el = $f[0];
      const origW = el.style.width || '100%';
      const pulses = [0, 150, 400, 900, 1600];
      pulses.forEach(ms => {
        setTimeout(() => {
          $f.css('width', '99.6%');
          void el.offsetWidth;
          $f.css('width', origW);
          window.dispatchEvent(new Event('resize'));
        }, ms);
      });
    }

    // expand/scroll-right toggle
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
    }

    $(document).off('click.engagecx', '#nav-engagecx, #nav-engagecx a')
    .on('click.engagecx', '#nav-engagecx, #nav-engagecx a', function (e) {
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
            <button id="engagecx-refresh"   class="btn btn-small" style="padding:6px 10px;cursor:pointer;"
              title="Click to refresh session or login/logout.">
              Refresh / Log out
            </button>
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
        positionLogoutCover();    // keep cover aligned after route changes
      });

      $slot.append($bar, $iframe);
      applyExpandState();
      ensureLogoutCover();        // create + position the cover
    });

    // Go to Agents Panel
    $(document).off('click.engagecx-go-agent')
    .on('click.engagecx-go-agent', '#engagecx-go-agent', function (e) {
      e.preventDefault();
      $('#engagecxFrame').attr('src', targetUrl);
      nudgeIframe();
      applyExpandState();
      positionLogoutCover();
    });

    // Go to Control Panel
    $(document).off('click.engagecx-go-control')
    .on('click.engagecx-go-control', '#engagecx-go-control', function (e) {
      e.preventDefault();
      $('#engagecxFrame').attr('src', controlUrl);
      nudgeIframe();
      applyExpandState();
      positionLogoutCover();
    });

    // Refresh Session
    $(document).off('click.engagecx-refresh')
    .on('click.engagecx-refresh', '#engagecx-refresh', function (e) {
      e.preventDefault();
      try {
        window.open(
          'https://engagecx.clarityvoice.com/#/logout?t=' + Date.now(),
          'EngageCXLogout',
          'width=900,height=700,noopener,noreferrer'
        );
      } catch {}
      $('#engagecxFrame').attr('src', nextLoginUrl());
      nudgeIframe();
      applyExpandState();
      positionLogoutCover();
    });

    // expand/scroll-right toggle handler
    $(document).off('click.engagecx-expand')
    .on('click.engagecx-expand', '#engagecx-expand', function (e) {
      e.preventDefault();
      isExpanded = !isExpanded;
      applyExpandState();
      positionLogoutCover();
    });

    // keep cover aligned on window resizes
    $(window).off('resize.engagecx-cover').on('resize.engagecx-cover', positionLogoutCover);
  }

  (function waitForJQ() {
    const jq = window.jQuery || window.$;
    if (!jq || !jq.fn || !jq.fn.jquery) return void setTimeout(waitForJQ, 300);
    when(
      () => jq('#nav-buttons').length && (jq('#nav-music').length || jq('#nav-buttons').children('li').length),
      start
    );
  })();
})();
