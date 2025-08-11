// ===== EngageCX bootstrap (waits for jQuery + nav) =====
// Removed hide profile; ticket side panel via isTicket=true; Refresh = popup + immediate iframe login
;(function () {
  function when(pred, fn) {
    if (pred()) return void fn();
    const obs = new MutationObserver(() => { if (pred()) { obs.disconnect(); fn(); } });
    obs.observe(document.documentElement, { childList: true, subtree: true });
    const iv = setInterval(() => { if (pred()) { clearInterval(iv); fn(); } }, 300);
  }

  function start() {
    // Template nav item (prefer #nav-music; fallback to first li)
    let $template = $('#nav-music');
    if (!$template.length) $template = $('#nav-buttons').children('li').first();
    if (!$template.length) return; // nav not mounted yet (when() will call start again)

    // Build EngageCX nav tile
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

    // URLs + helpers
    function nextLoginUrl() {
      return 'https://engagecx.clarityvoice.com/#/login?t=' + Date.now() +
             '&r=' + Math.random().toString(36).slice(2);
    }
    const targetUrl  = 'https://engagecx.clarityvoice.com/#/agentConsole/message?includeWs=true&isTicket=true&topLayout=true';
    const controlUrl = 'https://engagecx.clarityvoice.com/#/admin/widget/dashboard?noLayout=false';

    // >>> NEW: resize nudge helper (inside start so handlers can call it)
    function nudgeIframe() {
      const $f = $('#engagecxFrame');
      if (!$f.length) return;
      const prev = $f[0].style.width || '100%';
      $f.css('width', '99.6%');
      requestAnimationFrame(() => { $f.css('width', prev); });
    }
    // <<< NEW

    // Click the EngageCX nav: build toolbar + iframe
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
          <div style="display:flex;align-items:center;gap:8px;">
            <button id="engagecx-go-agent" class="btn btn-small" style="padding:6px 10px;cursor:pointer;">Go to Agents Panel</button>
            <button id="engagecx-go-control" class="btn btn-small" style="padding:6px 10px;cursor:pointer;">Go to Control Panel</button>
            <button id="engagecx-refresh" class="btn btn-small" style="padding:6px 10px;cursor:pointer;">Refresh Session</button>
          </div>
        </div>
      `);

      const $iframe = $('<iframe>', {
        id: 'engagecxFrame',
        src: nextLoginUrl(), // fresh login page on first open
        style: 'border:none; width:100%; height:calc(100vh - 240px); min-height:800px; overflow:auto;',
        scrolling: 'yes'
      });

      // >>> NEW: kick on load + first mount
      $iframe.on('load', nudgeIframe);
      $slot.append($bar, $iframe);
      nudgeIframe();
      // <<< NEW
    });

    // Go to Agents Panel
    $(document).off('click.engagecx-go-agent')
    .on('click.engagecx-go-agent', '#engagecx-go-agent', function (e) {
      e.preventDefault();
      $('#engagecxFrame').attr('src', targetUrl);
      nudgeIframe(); // NEW
    });

    // Go to Control Panel
    $(document).off('click.engagecx-go-control')
    .on('click.engagecx-go-control', '#engagecx-go-control', function (e) {
      e.preventDefault();
      $('#engagecxFrame').attr('src', controlUrl);
      nudgeIframe(); // NEW
    });

    // Refresh Session — popup (best-effort) + immediate iframe login (buttons never disabled)
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

      const freshLogin = nextLoginUrl();
      $('#engagecxFrame').attr('src', freshLogin);
      nudgeIframe(); // NEW
    });
  } // <--- END start()

  // Bootstrap: wait for jQuery, then wait for nav, then run start()
  (function waitForJQ() {
    const jq = window.jQuery || window.$;
    if (!jq || !jq.fn || !jq.fn.jquery) return void setTimeout(waitForJQ, 300);
    when(
      () => jq('#nav-buttons').length && (jq('#nav-music').length || jq('#nav-buttons').children('li').length),
      start
    );
  })();
})(); // <--- END IIFE
