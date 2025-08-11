// --- Clone a tile and make "EngageCX" --- duke nukem HATES COOKIES and loves reports
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

  const loginUrl       = 'https://engagecx.clarityvoice.com/#/login?t=' + Date.now();
  const targetAgents   = 'https://engagecx.clarityvoice.com/#/agentConsole/message/index?includeWs=true';
  const targetControl  = 'https://engagecx.clarityvoice.com/#/admin/widget/dashboard';

  // Toolbar with updated instructions + both buttons
  const $bar = $(`
    <div style="display:flex;flex-direction:column;gap:6px;
         padding:10px 12px;border-bottom:1px solid #e5e7eb;background:#fafafa;">
      <div style="font-size:13px;color:#444;">
        <strong>Step 1:</strong> Click "Refresh Session" to open a logout popup.<br>
        <strong>Step 2:</strong> In the popup, click Log Out, then close the popup.<br>
        <strong>Step 3:</strong> Use the buttons below to go to Agents Panel or Control Panel.
      </div>
      <div style="display:flex;align-items:center;gap:8px;">
        <button id="engagecx-go-agent" class="btn btn-small" style="padding:6px 10px;cursor:pointer;">
          Go to Agents Panel
        </button>
        <button id="engagecx-go-control" class="btn btn-small" style="padding:6px 10px;cursor:pointer;">
          Go to Control Panel
        </button>
        <button id="engagecx-refresh" class="btn btn-small" style="padding:6px 10px;cursor:pointer;">
          Refresh Session
        </button>
      </div>
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
    $('#engagecxFrame').attr('src', targetAgents);
  });

  // Go to Control Panel
  $(document).off('click.engagecx-go-control').on('click.engagecx-go-control', '#engagecx-go-control', function (e) {
    e.preventDefault();
    $('#engagecxFrame').attr('src', targetControl);
  });

  // Refresh Session → open popup to log out, then allow re-login
  $(document).off('click.engagecx-refresh')
  .on('click.engagecx-refresh', '#engagecx-refresh', function (e) {
    e.preventDefault();

    const logoutUrl = 'https://engagecx.clarityvoice.com/#/logout?t=' + Date.now();
    const freshLoginUrl  = 'https://engagecx.clarityvoice.com/#/login?t=' + Date.now();

    $('#engagecx-go-agent, #engagecx-go-control').prop('disabled', true);

    const popup = window.open(
      logoutUrl,
      'EngageCXLogout',
      'width=1024,height=768,noopener,noreferrer'
    );

    const popupTimer = setInterval(() => {
      if (popup.closed) {
        clearInterval(popupTimer);
        // Always re-enable buttons so they can choose either panel
        $('#engagecxFrame').attr('src', freshLoginUrl);
        $('#engagecx-go-agent, #engagecx-go-control').prop('disabled', false);
      }
    }, 500);
  });
});
