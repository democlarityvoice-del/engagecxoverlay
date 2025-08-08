let existingbutton = $('#nav-music'); // change if needed
let newbutton = existingbutton.clone();

newbutton.find('.nav-text').html("EngageCX");
newbutton.appendTo($('#nav-buttons'));

// Reset background style and inject icon
newbutton.find('.nav-bg-image')
  .attr("style", "position: relative; background-position: 0; background-size: cover; background-repeat: no-repeat;")
  .html('<i class="fa-regular fa-message" style="font-size:28px;color:white;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);"></i>');

newbutton.find('a').click(function (e) {
  e.preventDefault();

  $("#nav-buttons li").removeClass("nav-link-current");
  existingbutton.removeClass("nav-link-current");

  newbutton.addClass("nav-link-current");
  $('.navigation-title').html("EngageCX");

  $('#content').html("<iframe src='https://engagecx.clarityvoice.com/' width='100%' height='800px' style='border:none;' allow='clipboard-write; microphone; camera'></iframe>");

  return false;
});
