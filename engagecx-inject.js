let existingbutton = $('#nav-music'); // change if needed
let newbutton = existingbutton.clone();

if (!document.querySelector('link[href*="font-awesome"],link[href*="fontawesome"]')) {
  const fa = document.createElement('link');
  fa.rel = 'stylesheet';
  fa.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css';
  document.head.appendChild(fa);
}

// Change the button text
newbutton.find('.nav-bg-image')
  .css({ position: 'relative' })
  .html(
    '<i class="fa-regular fa-message" ' +
    'style="font-size:28px;color:white;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);"></i>'
  );

// Click behavior
newbutton.find('a').click(function (e) {
  e.preventDefault();

  $("#nav-buttons li").removeClass("nav-link-current");
  existingbutton.removeClass("nav-link-current");

  newbutton.addClass("nav-link-current");
  $('.navigation-title').html("EngageCX");

  $('#content').html("<iframe src='https://engagecx.clarityvoice.com/' width='100%' height='800px' style='border:none;' allow='clipboard-write; microphone; camera'></iframe>");

  return false;
});
