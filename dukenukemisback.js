// --- EngageCX: insert nav tile + working panel (shell route; right rail visible) --- that right rail is the worst

// Insert the EngageCX nav button once DOM is ready.
// If #nav-music doesn't exist, clone the first nav tile.
$(function () {
  const $nav = $('#nav-buttons');
  if (!$nav.length) { console.warn('EngageCX: #nav-buttons not found'); return; }
  if (!$('#nav-engagecx').length) {
    let $template = $('#nav-music');
    if (!$template.length) $template = $nav.children('li').first();
    if (!$template.length) { console.warn('EngageCX: no nav tiles to clone'); return; }

    const $new = $template.clone();
    $new.attr('id', 'nav-engagecx');
    $new.find('a').attr('id', 'nav-engagecx-link').attr('href', '#');
    $new.find('.nav-text').text('EngageCX');

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
    if ($after.length) $new.insertAfter($after); else $new.appendTo($nav);
  }
});

// Click handler builds toolbar + iframe. No globals; no polling.
$(document)
  .off('click.engagecx', '#nav-engagecx, #nav-engagecx a')
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

    // Force desktop layout so the right rail renders
    $slot.css({ minWidth: '1280px' });

    // ✅ Use shell (no /index) + topLayout=true so the right-side ticket/history rail shows
    const loginUrl   = 'https://engagecx.clarityvoice.com/#/login?t=' + Date.now();
    const agentUrl   = 'https://engagecx.clarityvoice.com/#/agentConsole/message?includeWs=true&topLayout=true&navigationStyle=Left&showAgentProfile=false';
    const controlUrl = 'https://engagecx.clarityvoice.com/#/admin/widget/dashboard?noLayout=false';

    // Toolbar
    const $bar = $(`
      <div style="display:flex;flex-direction:column;gap:6px;
           padding:10px 12px;border-bottom:1px solid #e5e7eb;background:#fafafa;">
        <div style="font-size:13px;color:#444;">
          <strong>Step 1:</strong> Click "Refresh Session" to open login/logout in a popup.<br>
          <strong>Step 2:</strong> Close the popup when done.<br>
          <strong>Step 3:</strong> Use "Go to Agents Panel" or "Go to Control Panel".
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

    // Panel switches
    $(document).off('click.engagecx-go-agent')
      .on('click.engagecx-go-agent', '#engagecx-go-agent', function (e) {
        e.preventDefault();
        $('#engagecxFrame').attr('src', agentUrl);
      });

    $(document).off('click.engagecx-go-control')
      .on('click.engagecx-go-control', '#engagecx-go-control', function (e) {
        e.preventDefault();
        $('#engagecxFrame').attr('src', controlUrl);
      });

    // Non-blocking refresh (no disabled buttons; no #/logout 404s)
    $(document).off('click.engagecx-refresh')
      .on('click.engagecx-refresh', '#engagecx-refresh', function (e) {
        e.preventDefault();
        const popupUrl = 'https://engagecx.clarityvoice.com/#/login?t=' + Date.now();
        const popup = window.open(popupUrl, 'EngageCXSessionFix', 'width=1024,height=768,noopener,noreferrer');
        const timer = setInterval(() => {
          if (popup && popup.closed) {
            clearInterval(timer);
            const freshLogin = 'https://engagecx.clarityvoice.com/#/login?t=' + Date.now();
            $('#engagecxFrame').attr('src', freshLogin);
          }
        }, 800);
      });

    // Best-effort: hide agent profile if accessible (ignore cross-origin)
    $('#engagecxFrame').on('load', function () {
      try {
        const doc = document.getElementById('engagecxFrame').contentWindow.document;
        const el = doc.querySelector('.agent-profile, .profile-wrap, [class*="agentProfile"]');
        if (el) el.style.display = 'none';
      } catch {}
    });
  });
