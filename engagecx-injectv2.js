// --- Clone a tile and make "EngageCX" (appearance unchanged) --- last run broke it, so trying one more time to inject 
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
$(document).off('click.engagecx', '#nav-engagecx, #nav-engagecx a').on('click.engagecx', '#nav-engagecx, #nav-engagecx a', function (e) {
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

// build URLs
const targetHash   = '#/agentConsole/message/index?includeWs=true';
const redirectHash = encodeURIComponent(targetHash);
const loginUrl     = `https://engagecx.clarityvoice.com/#/login?redirect=${redirectHash}&t=${Date.now()}`;
const directUrl    = `https://engagecx.clarityvoice.com/${targetHash}`;

// create iframe with login first
const $iframe = $('<iframe>', {
  id: 'engagecxFrame',
  src: loginUrl,
  style: 'border:none; width:100%; height:calc(100vh - 200px); min-height:800px;'
});

$slot.append($iframe);

// if login page is frame-blocked, swap to direct route
let swapped = false;
const swapToDirect = () => {
  if (swapped) return;
  swapped = true;
  $('#engagecxFrame').attr('src', directUrl);
};

// if the login page actually loads, this fires quickly
$iframe.on('load', () => {
  // do nothing — it loaded
});

// but if it’s blocked, the load event may never fire.
// give it ~1200ms; if still no load, fall back.
setTimeout(swapToDirect, 1200);


