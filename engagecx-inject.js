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
  'background-image': "url('/portal/img/glyphicons-halflings-white.png')",
  'background-repeat': 'no-repeat',
  'background-position': '-336px -24px',   // <-- START HERE; tweak this
  'background-size': 'auto'                 // keep native pixel-perfect sprite
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
