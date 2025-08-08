let existingbutton = $('#nav-music'); // base to clone
let newbutton = existingbutton.clone();

newbutton.attr('id', 'nav-engagecx');                    // new unique id
newbutton.find('a').attr('id', 'nav-engagecx-link');     // avoid dup anchor ids

newbutton.find('.nav-text').html("EngageCX");

// place it immediately after Call History if present; else append at end
const after = $('#nav-callhistory');
if (after.length) {
  newbutton.insertAfter(after);
} else {
  newbutton.appendTo($('#nav-buttons'));
}


// Reset background style and inject icon
newbutton.find('.nav-bg-image').css({
  // use the SVG as a mask so only the icon shape shows
  '-webkit-mask-image': "url('https://raw.githubusercontent.com/democlarityvoice-del/engagecxicon/main/message-regular-full.svg?v=3')",
  'mask-image':        "url('https://raw.githubusercontent.com/democlarityvoice-del/engagecxicon/main/message-regular-full.svg?v=3')",
  '-webkit-mask-repeat': 'no-repeat',
  'mask-repeat':         'no-repeat',
  '-webkit-mask-position':'center 48%',   // was center
  'mask-position':       'center 48%',   // tiny upward nudge
  '-webkit-mask-size':   '62% 62%',      // was 55–60%
  'mask-size':           '62% 62%',
  'background-color':    'rgba(255,255,255,0.92)'
});


newbutton.find('a').click(function (e) {
  e.preventDefault();

  $("#nav-buttons li").removeClass("nav-link-current");
  existingbutton.removeClass("nav-link-current");

  newbutton.addClass("nav-link-current");
  $('.navigation-title').html("EngageCX");

  $('#content').html("<iframe src='https://engagecx.clarityvoice.com/' width='100%' height='800px' style='border:none;' allow='clipboard-write; microphone; camera'></iframe>");

  return false;
});
