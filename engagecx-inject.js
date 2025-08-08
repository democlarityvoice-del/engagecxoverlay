let existingbutton = $('#nav-music'); 
let newbutton = existingbutton.clone();

newbutton.attr('id', 'nav-engagecx');
newbutton.find('a').attr('id', 'nav-engagecx-link');
newbutton.find('.nav-text').html("EngageCX");

const after = $('#nav-callhistory');
if (after.length) {
  newbutton.insertAfter(after);
} else {
  newbutton.appendTo($('#nav-buttons'));
}
newbutton.find('a').on('click', function (e) {
  e.preventDefault();
  $("#nav-buttons li").removeClass("nav-link-current");
  newbutton.addClass("nav-link-current");
  $('.navigation-title').html("EngageCX");

  $('#content').html(`
    <iframe
      src="https://engagecx.clarityvoice.com/#/login"
      style="border:none; width:100%; height:800px;"
      allow="geolocation; microphone; camera; clipboard-write; autoplay; encrypted-media; fullscreen; picture-in-picture; screen-wake-lock"
      allowfullscreen
    ></iframe>
  `);
});

