// --- Clone a tile and make "EngageCX" (appearance unchanged) --- trying the redirect here
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

if (!document.getElementById('engagecx-style')) {
  const style = document.createElement('style');
  style.id = 'engagecx-style';
  style.textContent = `
    #nav-engagecx:not(.nav-link-current) .nav-button.btn { filter: brightness(1.08); }
  `;
  document.head.appendChild(style);
}

// neutralize the anchor
$('#nav-engagecx a').attr('href', '#');

// CLICK -> replace #content with our iframe (only change that matters)
$(document).off('click.engagecx', '#nav-engagecx, #nav-engagecx a')
.on('click.engagecx', '#nav-engagecx, #nav-engagecx a', function (e) {
  e.preventDefault();
  e.stopPropagation();

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

// pick the redirect target (Agent Panel)
const targetHash  = '#/agentConsole/message/index?includeWs=true';
const redirectHash = encodeURIComponent(targetHash);                                // %23/agentConsole/...
const redirectPath = encodeURIComponent('/agentConsole/message/index?includeWs=true'); // /agentConsole/...

// try A first; if it doesn't hop after login, try 1→2→3
const urls = [
  `https://engagecx.clarityvoice.com/#/login?redirect=${redirectHash}&t=${Date.now()}`,   // A
  `https://engagecx.clarityvoice.com/#/login?redirect=${redirectPath}&t=${Date.now()}`,   // B
  `https://engagecx.clarityvoice.com/#/login?redirectTo=${redirectHash}&t=${Date.now()}`, // C
  `https://engagecx.clarityvoice.com/#/login?redirectTo=${redirectPath}&t=${Date.now()}`  // D
];

const url = urls[0]; // try A first

// rebuild the slot to avoid the "home clone" bleed
$('#engagecx-slot').remove();
const $slot = $('<div id="engagecx-slot" style="padding:0;margin:0;"></div>').appendTo('#content');

// create the iframe with the built URL
const $iframe = $('<iframe>', {
  id: 'engagecxFrame',
  src: url,
  allow: 'clipboard-write; microphone; camera',
  style: 'border:none; width:100%; height:calc(100vh - 200px); min-height:800px;'
});

$slot.append($iframe);
