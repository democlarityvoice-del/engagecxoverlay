// --- Clone a tile and make "EngageCX" (appearance unchanged) ---  working version with iframe swap at the bottom for redirect attempt
// --- Clone a tile and make "EngageCX" (appearance unchanged) ---
let existingbutton = $('#nav-music'); // base to clone
let newbutton = existingbutton.clone();

newbutton.attr('id', 'nav-engagecx');                    // unique id
newbutton.find('a').attr('id', 'nav-engagecx-link');     // avoid dup anchor ids
newbutton.find('.nav-text').html("EngageCX");

// place it immediately after Call History if present; else append at end
const after = $('#nav-callhistory');
if (after.length) {
  newbutton.insertAfter(after);
} else {
  newbutton.appendTo($('#nav-buttons'));
}

// Icon mask + visual match
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

// ensure the tile is in the DOM first
if (!document.getElementById('nav-engagecx')) {
  // ... your clone/insert code above ...
}

// Always neutralize the anchor if it exists
$('#nav-engagecx a').attr('href', '#');

// Delegated handler: survives DOM replacements
$(document).off('click.engagecx', '#nav-engagecx, #nav-engagecx a').on('click.engagecx', '#nav-engagecx, #nav-engagecx a', function (e) {
  e.preventDefault();
  e.stopPropagation();
  e.stopImmediatePropagation();

  console.log('[EngageCX test] click handled');

  $("#nav-buttons li").removeClass("nav-link-current");
  $("#nav-engagecx").addClass("nav-link-current");
  $('.navigation-title').text("EngageCX");

  // >>> one surgical change: clear content before injecting <<<
  const $content = $('#content');
  $content.empty(); // <- this prevents the home screen from bleeding through

  // build a fresh slot + iframe
  let $slot = $('#engagecx-slot');
  if (!$slot.length) {
    $slot = $('<div id="engagecx-slot"></div>').appendTo('#content');
  } else {
    $slot.empty();
  }

 // ---- build the iframe pointed at login; on 2nd load, hop to Agent Panel ----
const targetHash = '#/agentConsole/message/index?includeWs=true';
const loginUrl   = 'https://engagecx.clarityvoice.com/#/login?t=' + Date.now();
const targetUrl  = 'https://engagecx.clarityvoice.com/' + targetHash;

// --- Build a tiny toolbar + iframe pointed at login ---
const targetHash = '#/agentConsole/message/index?includeWs=true';
const loginUrl   = 'https://engagecx.clarityvoice.com/#/login?t=' + Date.now();
const targetUrl  = 'https://engagecx.clarityvoice.com/' + targetHash;

// toolbar
const $bar = $(`
  <div id="engagecx-toolbar" style="display:flex;align-items:center;gap:8px;
       padding:10px 12px;border-bottom:1px solid #e5e7eb;background:#fafafa;">
    <span style="font-size:13px;color:#444">EngageCX loaded. After you log in, click:</span>
    <button id="engagecx-go-agent" class="btn btn-small" style="padding:6px 10px;cursor:pointer;">
      Go to Agents Panel
    </button>
  </div>
`);

const $iframe = $('<iframe>', {
  id: 'engagecxFrame',
  src: loginUrl,
  allow: 'clipboard-write; microphone; camera',
  style: 'border:none; width:100%; height:calc(100vh - 240px); min-height:800px;' // 240 = iframe height minus toolbar
});

$slot.append($bar, $iframe);

// click => swap to agents panel
$(document).off('click.engagecx-go').on('click.engagecx-go', '#engagecx-go-agent', function (e) {
  e.preventDefault();
  $('#engagecxFrame').attr('src', targetUrl);
});
