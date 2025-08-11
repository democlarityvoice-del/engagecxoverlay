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

// CLICK → load login page in iframe + toolbar button to go to Agents Panel
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

  // Toolbar + iframe
  const loginUrl  = 'https://engagecx.clarityvoice.com/#/login?t=' + Date.now();

  const $bar = $(`
    <div style="display:flex;align-items:center;gap:8px;
         padding:10px 12px;border-bottom:1px solid #e5e7eb;background:#fafafa;">
      <span style="font-size:13px;color:#444">After logging in, click:</span>
      <button id="engagecx-go-agent" class="btn btn-small" style="padding:6px 10px;cursor:pointer;">
        Go to Agents Panel
      </button>
    </div>
  `);

  const $iframe = $('<iframe>', {
    id: 'engagecxFrame',
    src: loginUrl,
    style: 'border:none; width:100%; height:calc(100vh - 240px); min-height:800px;'
  });

  $slot.append($bar, $iframe);

  // Button → swap iframe src to agents panel with token injection
  $(document).off('click.engagecx-go').on('click.engagecx-go', '#engagecx-go-agent', function (e) {
    e.preventDefault();

    const token = localStorage.getItem("ns_t"); // from portal
    if (!token) {
      alert("No active EngageCX session found. Please log in again.");
      return;
    }

    const targetUrl = `https://engagecx.clarityvoice.com/?token=${encodeURIComponent(token)}#/agentConsole/message/index?includeWs=true`;
    $('#engagecxFrame').attr('src', targetUrl);
  });
});

// ==============================
// Agent Panel token injector
// ==============================
(function() {
  const urlParams = new URLSearchParams(window.location.search);
  const tokenFromPortal = urlParams.get("token");

  if (tokenFromPortal) {
    const existingToken = localStorage.getItem("ns_t");

    // Only update if missing or different
    if (!existingToken || existingToken !== tokenFromPortal) {
      localStorage.setItem("ns_t", tokenFromPortal);
      console.log(
        "Session token injected from portal:",
        tokenFromPortal.substring(0, 20) + "..."
      );
    } else {
      console.log("Existing token matches portal token. No overwrite needed.");
    }

    // 🔒 Remove token from the URL (no history entry)
    window.history.replaceState({}, document.title, window.location.pathname + window.location.hash);
  }
})();
