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

    // NEW: expand/scroll-right toggle
    let isExpanded = false;
    const EXPAND_PX = 420; // extra width to reveal right rail
    function applyExpandState() {
      const $slot = $('#engagecx-slot');
      const $f = $('#engagecxFrame');
      if (!$slot.length || !$f.length) return;
      // allow horizontal panning of the whole iframe
      $slot.css({ position: 'relative', overflowX: 'auto' });
      if (isExpanded) {
        $f.css('width', `calc(100% + ${EXPAND_PX}px)`);
        // jump view to the right so the rail is visible immediately
        requestAnimationFrame(() => { $slot[0].scrollLeft = $slot[0].scrollWidth; });
      } else {
        $f.css('width', '100%');
        requestAnimationFrame(() => { $slot[0].scrollLeft = 0; });
      }
      nudgeIframe(); // also kick the inner layout
      // update button label if present
      $('#engagecx-expand').text(isExpanded ? 'Reset Width' : 'Expand / Scroll Right');
    }
    // ----------------------

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
          <div style="font-size:13px;color:#444;">
            Click <strong>Refresh Session</strong> anytime to clear the current session and return to the login page.
          </div>
          <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
            <button id="engagecx-go-agent"  class="btn btn-small" style="padding:6px 10px;cursor:pointer;">Go to Agents Panel</button>
            <button id="engagecx-go-control" class="btn btn-small" style="padding:6px 10px;cursor:pointer;">Go to Control Panel</button>
            <button id="engagecx-refresh"   class="btn btn-small" style="padding:6px 10px;cursor:pointer;">Refresh Session</button>
            <!-- NEW -->
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
        applyExpandState(); // keep current expanded state across loads
      });

      $slot.append($bar, $iframe);
      applyExpandState();  // set up scroll container + initial width
    });

    // toolbar actions
    $(document).off('click.engagecx-go-agent')
    .on('click.engagecx-go-agent', '#engagecx-go-agent', function (e) {
      e.preventDefault();
      $('#engagecxFrame').attr('src', targetUrl);
      nudgeIframe();
      applyExpandState();
    });

    $(document).off('click.engagecx-go-control')
    .on('click.engagecx-go-control', '#engagecx-go-control', function (e) {
      e.preventDefault();
      $('#engagecxFrame').attr('src', controlUrl);
      nudgeIframe();
      applyExpandState();
    });

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
    });

    // NEW: expand/scroll-right toggle handler
    $(document).off('click.engagecx-expand')
    .on('click.engagecx-expand', '#engagecx-expand', function (e) {
      e.preventDefault();
      isExpanded = !isExpanded;
      applyExpandState();
    });
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
