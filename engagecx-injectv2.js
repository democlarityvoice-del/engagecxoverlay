// ===== EngageCX bootstrap (waits for jQuery + nav) ===== this version should actually run everything. the duke is unamused
// Removed hide profile, added ticket side panel
;(function () {
  function when(pred, fn) {
    if (pred()) return void fn();
    const obs = new MutationObserver(() => {
      if (pred()) { obs.disconnect(); fn(); }
    });
    obs.observe(document.documentElement, { childList: true, subtree: true });
    const iv = setInterval(() => { if (pred()) { clearInterval(iv); fn(); } }, 300);
  }

  function start() {
    // --- Clone a tile and make "EngageCX" ---
    let existingbutton = $('#nav-music');
    let newbutton = existingbutton.clone();

    newbutton.attr('id', 'nav-engagecx');
    newbutton.find('a').attr('id', 'nav-engagecx-link');
    newbutton.find('.nav-text').html("EngageCX");

    const after = $('#nav-callhistory');
    if (after.length) newbutton.insertAfter(after);
    else newbutton.appendTo($('#nav-buttons'));

    // Icon mask
    newbutton.find('.nav-bg-image').css({
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

    $('#nav-engagecx a').attr('href', '#');

    // Keep these URLs in scope for the handlers below
    const loginUrl   = 'https://engagecx.clarityvoice.com/#/login?t=' + Date.now();
    const targetUrl  = 'https://engagecx.clarityvoice.com/#/agentConsole/message?includeWs=true&isTicket=true&topLayout=true';
    const controlUrl = 'https://engagecx.clarityvoice.com/#/admin/widget/dashboard?noLayout=false';

    // Build panel on click
    $(document).off('click.engagecx', '#nav-engagecx, #nav-engagecx a')
    .on('click.engagecx', '#nav-engagecx, #nav-engagecx a', function (e) {
      e.preventDefault();
      e.stopPropagation();

      $("#nav-buttons li").removeClass("nav-link-current");
      $("#nav-engagecx").addClass("nav-link-current");
      $('.navigation-title').text("EngageCX");

      const $content = $('#content').empty();
      let $slot = $('#engagecx-slot');
      if (!$slot.length) $slot = $('<div id="engagecx-slot"></div>').appendTo('#content');
      else $slot.empty();

      const $bar = $(`
        <div style="display:flex;flex-direction:column;gap:6px;
             padding:10px 12px;border-bottom:1px solid #e5e7eb;background:#fafafa;">
          <div style="font-size:13px;color:#444;">
            <strong>Step 1:</strong> Click "Refresh Session" to open a logout popup.<br>
            <strong>Step 2:</strong> In the popup, click Log Out, then close the popup.<br>
            <strong>Step 3:</strong> Use "Go to Agents Panel" or "Go to Control Panel" as needed.
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
        src: loginUrl,
        style: 'border:none; width:100%; height:calc(100vh - 240px); min-height:800px; overflow:auto;',
        scrolling: 'yes'
      });

      $slot.append($bar, $iframe);
    });

    // Go to Agents Panel
    $(document).off('click.engagecx-go-agent')
    .on('click.engagecx-go-agent', '#engagecx-go-agent', function (e) {
      e.preventDefault();
      $('#engagecxFrame').attr('src', targetUrl);
    });

    // Go to Control Panel
    $(document).off('click.engagecx-go-control')
    .on('click.engagecx-go-control', '#engagecx-go-control', function (e) {
      e.preventDefault();
      $('#engagecxFrame').attr('src', controlUrl);
    });

    // Refresh Session → do logout INSIDE the iframe, then go to fresh login (no popup, never disable buttons)
$(document).off('click.engagecx-refresh')
.on('click.engagecx-refresh', '#engagecx-refresh', function (e) {
  e.preventDefault();

  // fresh login URL generator (avoid cache/stale redirects)
  function nextLoginUrl() {
    return 'https://engagecx.clarityvoice.com/#/login?t=' + Date.now() +
           '&r=' + Math.random().toString(36).slice(2);
  }
  const logoutUrl = 'https://engagecx.clarityvoice.com/#/logout?t=' + Date.now();
  const $frame = $('#engagecxFrame');
  if (!$frame.length) return;

  // After the logout page finishes loading in the iframe, go to login.
  $frame.off('load.engagecx-logout').on('load.engagecx-logout', function onLogoutLoad () {
    $frame.off('load.engagecx-logout');        // run only once
    $frame.attr('src', nextLoginUrl());         // now show the login screen
    setTimeout(() => this.focus?.(), 50);
  });

  // Kick off logout inside the iframe
  $frame.attr('src', logoutUrl);

  // Safety fallback: if the logout page never fires 'load' (rare), force login after 6s
  setTimeout(function () {
    const current = $frame.attr('src') || '';
    if (current.indexOf('/#/logout') !== -1) {
      $frame.off('load.engagecx-logout');
      $frame.attr('src', nextLoginUrl());
    }
  }, 6000);
});
