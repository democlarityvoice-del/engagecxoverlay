let existingbutton = $('#nav-music'); // change if needed
let newbutton = existingbutton.clone();

newbutton.find('.nav-text').html("EngageCX");
newbutton.appendTo($('#nav-buttons'));

// Reset background style and inject icon
newbutton.find('.nav-bg-image').css({
  'background-image': "url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/svgs/regular/message.svg')",
  'background-repeat': 'no-repeat',
  'background-position': 'center',
  'background-size': '60%'
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
