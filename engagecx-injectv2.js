// --- Clone a tile and make "EngageCX" ---  force log out NUKE EDITION
// --- Clone a tile and make "EngageCX" (appearance unchanged) ---
let existingbutton = $('#nav-music'); // base to clone
let newbutton = existingbutton.clone();

newbutton.attr('id', 'nav-engagecx');
newbutton.find('a').attr('id', 'nav-engagecx-link');
newbutton.find('.nav-text').html("EngageCX");

// place after Call History if present
const after = $('#nav-callhistory');
if (after.length) {
  newbutton.insertAfter(after);
} else {
  newbutton.appendTo($('#nav-buttons'));
}

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

// CLICK → load login page in iframe + toolbar buttons
$(document).off('click.engagecx', '#nav-engagecx, #nav-engagecx a')
.on('click.engagecx', '#nav-engagecx, #nav-engagecx a', function (e) {
  e.preventDefault();
  e.stopPropagation();

  $("#nav-buttons li").removeClass("nav-link-current");
  $("#nav-engagecx").addClass("nav-link-current");
  $('.navigation-title').text("EngageCX");

  const $content = $('#content');
  $content.empty();

  let $slot = $('#engagecx-slot');
  if (!$slot.length) {
    $slot = $('<div id="engagecx-slot"></div>').appendTo('#content');
  } else {
    $slot.empty();
  }

  const loginUrl  = 'https://engagecx.clarityvoice.com/#/login?t=' + Date.now();
  const targetUrl = 'https://engagecx.clarityvoice.com/#/agentConsole/message/index?includeWs=true';

  // Toolbar with two buttons
  const $bar = $(`
    <div style="display:flex;align-items:center;gap:8px;
         padding:10px 12px;border-bottom:1px solid #e5e7eb;background:#fafafa;">
      <span style="font-size:13px;color:#444">After logging in, click:</span>
      <button id="engagecx-go-agent" class="btn btn-small" style="padding:6px 10px;cursor:pointer;">
        Go to Agents Panel
      </button>
      <button id="engagecx-refresh" class="btn btn-small" style="padding:6px 10px;cursor:pointer;">
        Refresh Session
      </button>
    </div>
  `);

  const $iframe = $('<iframe>', {
    id: 'engagecxFrame',
    src: loginUrl,
    style: 'border:none; width:100%; height:calc(100vh - 240px); min-height:800px;'
  });

  $slot.append($bar, $iframe);

  // Go to Agents Panel
  $(document).off('click.engagecx-go').on('click.engagecx-go', '#engagecx-go-agent', function (e) {
    e.preventDefault();
    $('#engagecxFrame').attr('src', targetUrl);
  });
}); // ✅ Close EngageCX main click handler here

// Refresh Session → force real cookie kill + reload login page
$(document).off('click.engagecx-refresh')
.on('click.engagecx-refresh', '#engagecx-refresh', function (e) {
    e.preventDefault();

    const loginUrl = 'https://engagecx.clarityvoice.com/#/login?t=' + Date.now();
    const logoutUrl = 'https://engagecx.clarityvoice.com/logout'; // not hash route

    $('#engagecx-go-agent').prop('disabled', true).text('Refreshing...');

    // Open a small popup to the real domain so user agent clears cookies
    const popup = window.open(
        logoutUrl,
        'EngageCXLogout',
        'width=400,height=300,noopener'
    );

    // Safety: force close popup after 2s in case logout is instant
    const killTimer = setTimeout(() => {
        try { popup.close(); } catch (err) {}
        $('#engagecxFrame').attr('src', loginUrl);
        $('#engagecx-go-agent').prop('disabled', false).text('Go to Agents Panel');
    }, 2000);

    // If popup is closed early by the user, reload immediately
    const watcher = setInterval(() => {
        if (popup.closed) {
            clearTimeout(killTimer);
            clearInterval(watcher);
            $('#engagecxFrame').attr('src', loginUrl);
            $('#engagecx-go-agent').prop('disabled', false).text('Go to Agents Panel');
        }
    }, 300);
});
