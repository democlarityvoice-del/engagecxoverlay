// --- Clone a tile and make "EngageCX" --- RESTORE ORIGINAL VERSION- quick add for the right side menu
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

$(document).off('click.engagecx', '#nav-engagecx, #nav-engagecx a')
.on('click.engagecx', '#nav-engagecx, #nav-engagecx a', function (e) {
  e.preventDefault();
  e.stopPropagation();

  $("#nav-buttons li").removeClass("nav-link-current");
  $("#nav-engagecx").addClass("nav-link-current");
  $('.navigation-title').text("EngageCX");

  const $content = $('#content').empty();
  let $slot = $('#engagecx-slot');
  if (!$slot.length) {
    $slot = $('<div id="engagecx-slot"></div>').appendTo('#content');
  } else {
    $slot.empty();
  }

const loginUrl   = 'https://engagecx.clarityvoice.com/#/login?t=' + Date.now();
const targetUrl  = 'https://engagecx.clarityvoice.com/#/agentConsole/message?includeWs=true&topLayout=true&navigationStyle=Left&showAgentProfile=false&isTicket=true';
const controlUrl = 'https://engagecx.clarityvoice.com/#/admin/widget/dashboard?noLayout=false';



  // Toolbar
  const $bar = $(`
    <div style="display:flex;flex-direction:column;gap:6px;
         padding:10px 12px;border-bottom:1px solid #e5e7eb;background:#fafafa;">
      <div style="font-size:13px;color:#444;">
        <strong>Step 1:</strong> Click "Refresh Session" to open a logout popup.<br>
        <strong>Step 2:</strong> In the popup, click Log Out, then close the popup.<br>
        <strong>Step 3:</strong> Use "Go to Agents Panel" or "Go to Control Panel" as needed.
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
    style: 'border:none; width:100%; height:calc(100vh - 240px); min-height:800px; overflow:auto;',
    scrolling: 'yes'
  });

  $slot.append($bar, $iframe);

  // Utility: Hide Agent Profile icon inside iframe
  function hideProfileIcon() {
    try {
      const iframeDoc = document.getElementById('engagecxFrame').contentWindow.document;
      const profileEl = iframeDoc.querySelector('.agent-profile, .profile-wrap, [class*="agentProfile"]');
      if (profileEl) {
        profileEl.style.display = 'none';
      }
    } catch (err) {
      console.warn("Could not hide profile icon yet:", err);
    }
  }

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

  // Refresh Session → logout popup, then reload login in iframe
  $(document).off('click.engagecx-refresh')
  .on('click.engagecx-refresh', '#engagecx-refresh', function (e) {
    e.preventDefault();

    const logoutUrl = 'https://engagecx.clarityvoice.com/#/logout?t=' + Date.now();

    $('#engagecx-go-agent, #engagecx-go-control')
      .prop('disabled', true)
      .text('Waiting for Logout...');

    const popup = window.open(
      logoutUrl,
      'EngageCXLogout',
      'width=1024,height=768,noopener,noreferrer'
    );

    const popupTimer = setInterval(() => {
      if (popup.closed) {
        clearInterval(popupTimer);
        $('#engagecxFrame').attr('src', loginUrl);
        $('#engagecx-go-agent').prop('disabled', false).text('Go to Agents Panel');
        $('#engagecx-go-control').prop('disabled', false).text('Go to Control Panel');
      }
    }, 1000);
  });

  // Watch iframe loads to hide profile icon
  $('#engagecxFrame').on('load', function () {
    setTimeout(hideProfileIcon, 800); // wait a bit for DOM to be ready
  });

});
