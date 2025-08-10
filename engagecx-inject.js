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
  // use the SVG as a mask so only the icon shape shows
  '-webkit-mask-image': "url('https://raw.githubusercontent.com/democlarityvoice-del/engagecxicon/main/message-regular-full.svg?v=3')",
  'mask-image':         "url('https://raw.githubusercontent.com/democlarityvoice-del/engagecxicon/main/message-regular-full.svg?v=3')",
  '-webkit-mask-repeat': 'no-repeat',
  'mask-repeat':         'no-repeat',
  '-webkit-mask-position':'center 48%',   // tiny upward nudge
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

  let slot = $('#engagecx-slot');
  if (!slot.length) slot = $('<div id="engagecx-slot"></div>').appendTo('#content');

  $('#engagecxFrame').remove();
  const $iframe = $('<iframe>', {
    id: 'engagecxFrame',
    src: 'https://clarityvoice.com,   // use example.com for sanity
    width: '100%',
    height: 800,
    title: 'EngageCX Test',
    style: 'border:none'
  });

  slot.empty().append($iframe);
});


    return false;
  });




