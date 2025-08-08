let existingbutton = $('#nav-music'); // change if needed
let newbutton = existingbutton.clone();

newbutton.find('.nav-text').html("EngageCX");
newbutton.appendTo($('#nav-buttons'));

// Make sure Font Awesome is loaded in the page
// Then set the background to the Font Awesome icon
newbutton.find('.nav-bg-image')
  .attr("style", "background: none; font-family: 'Font Awesome 6 Free'; font-weight: 400; font-size: 18px; display: flex; align-items: center; justify-content: center;")
  .html('<i class="fa-regular fa-message"></i>');

newbutton.find('a').click(function (e) {
  e.preventDefault();

  $("#nav-buttons li").removeClass("nav-link-current");
  existingbutton.removeClass("nav-link-current");

  newbutton.addClass("nav-link-current");
  $('.navigation-title').html("EngageCX");

  $('#content').html("<iframe src='https://engagecx.clarityvoice.com/' width='100%' height='800px' style='border:none;' allow='clipboard-write; microphone; camera'></iframe>");

  return false;
});

