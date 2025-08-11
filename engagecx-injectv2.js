// --- Clone a tile and make "EngageCX" (appearance unchanged) ---  pop out successful, this refreshes and checks for it. 
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
$(document).off('click.engagecx', '#nav-engagecx, #nav-engagecx a').on('click.engagecx', '#nav-engagecx, #nav-engagecx a', function (e) {
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

  // Toolbar with two buttons + status placeholder
  const $bar = $(`
    <div style="display:flex;align-items:center;gap:8px;
         padding:10px 12px;border-bottom:1px solid #e5e7eb;background:#fafafa;flex-wrap:wrap;">
      <span style="font-size:13px;color:#444">After logging in, click:</span>
      <div id="engagecx-status" style="font-size:12px;color:#28a745;display:none;"></div>
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

  // Refresh Session → centered popup login, background check for authentication
  $(document).off('click.engagecx-refresh').on('click.engagecx-refresh', '#engagecx-refresh', function (e) {
    e.preventDefault();

    const loginUrlExplicit = 'https://engagecx.clarityvoice.com/#/login?t=' + Date.now();
    const targetUrl = 'https://engagecx.clarityvoice.com/#/agentConsole/message/index?includeWs=true';

    $('#engagecx-go-agent').prop('disabled', true).text('Waiting for Login...');

    // Calculate centered popup position
    const width = 1024, height = 768;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    // Open centered login popup
    const popup = window.open(
      loginUrlExplicit,
      'EngageCXLogin',
      `width=${width},height=${height},left=${left},top=${top},noopener,noreferrer`
    );

    // Background check for login status
    const checkAuth = setInterval(() => {
      fetch(targetUrl, { credentials: 'include' })
        .then(res => {
          if (res.ok) {
            clearInterval(checkAuth);

            // Show "login detected" message
            $('#engagecx-status').text('Login detected, switching to panel…').fadeIn();

            // Switch iframe to Agent Panel
            $('#engagecxFrame').attr('src', targetUrl);
            $('#engagecx-go-agent').prop('disabled', false).text('Go to Agents Panel');

            // Close popup if still open
            if (!popup.closed) popup.close();

            // Hide status after a short delay
            setTimeout(() => {
              $('#engagecx-status').fadeOut();
            }, 3000);
          }
        })
        .catch(() => { /* ignore errors until authenticated */ });
    }, 1500);
  });
});
