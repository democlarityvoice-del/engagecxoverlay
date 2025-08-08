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

// one-time style: slight lift when not active
if (!document.getElementById('engagecx-style')) {
  const style = document.createElement('style');
  style.id = 'engagecx-style';
  style.textContent = `
    #nav-engagecx:not(.nav-link-current) .nav-button.btn { filter: brightness(1.08); }
  `;
  document.head.appendChild(style);
}

// --- Click handler (robust) ---
// neutralize the anchor so portal router can’t hijack it
const $a = newbutton.find('a');
$a.attr('href', '#');
$a.removeAttr('target');
$a.off('click'); // clear any accidental prior binding

// capture-phase listener beats document/body handlers
const anchor = $a.get(0);
anchor.addEventListener('click', function (e) {
  e.preventDefault();
  e.stopPropagation();
  if (e.stopImmediatePropagation) e.stopImmediatePropagation();

  // set active state
  $("#nav-buttons li").removeClass("nav-link-current");
  newbutton.addClass("nav-link-current");
  $('.navigation-title').html("EngageCX");

  // known-good: login inside fixed-height iframe
  $('#content').html(`
    <iframe
      id="engagecx-frame"
      src="https://engagecx.clarityvoice.com/#/login"
      style="border:none; width:100%; height:800px;"
      allow="geolocation; microphone; camera; clipboard-write; autoplay; encrypted-media; fullscreen; picture-in-picture; screen-wake-lock"
      allowfullscreen
    ></iframe>
  `);

  return false; // belt-and-suspenders
}, true); // <-- capture
