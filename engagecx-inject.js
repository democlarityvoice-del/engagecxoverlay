let existingbutton = $('#nav-music'); // Change selector to an existing nav item ID
let newbutton = existingbutton.clone();

// Change the visible text
newbutton.find('.nav-text').html("EngageCX");

// Add the cloned button to the nav
newbutton.appendTo($('#nav-buttons'));

// Update the background image/style if needed
newbutton.find('.nav-bg-image').attr("style", "background-position: 0; background-image: url('/path/to/icon.png');");

// Click handler
newbutton.find('a').click(function (e) {
  e.preventDefault();

  // Remove current active state from all buttons
  $("#nav-buttons li").removeClass("nav-link-current");
  existingbutton.removeClass("nav-link-current");

  // Set active state for this new button
  newbutton.addClass("nav-link-current");

  // Update page title
  $('.navigation-title').html("EngageCX");

  // Inject EngageCX iframe
  $('#content').html("<iframe src='https://engagecx.clarityvoice.com/' width='100%' height='800px' style='border:none;' allow='clipboard-write; microphone; camera'></iframe>");

  return false;
});
