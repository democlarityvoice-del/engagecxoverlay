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

newbutton.find('.nav-bg-image').css({
  '-webkit-mask-image': "url('https://raw.githubusercontent.com/democlarityvoice-del/engagecxicon/main/message-regular-full.svg?v=3')",
  'mask-image':         "url('https://raw.githubusercontent.com/democlarityvoice-del/engagecxicon/main/message-regular-full.svg?v=3')",
  '-webkit-mask-repeat': 'no-repeat',
  'mask-repeat':         'no-repeat',
  '-webkit-mask-position':'center 48%',
  'mask-position':       'center 48%',
  '-webkit-mask-size':   '71% 71%',
  'mask-size':           '71% 71%',
  'background-color':    'rgba(255,255,255,0.92)'
});

if (!document.getElementById('engagecx-style')) {
  const style = document.createElement('style');
  style.id = 'engagecx-style';
  style.textContent = `
    #nav-engagecx:not(.nav-link-current) .nav-button.btn {
      filter: brightness(1.08);
    }
  `;
  document.head.appendChild(style);
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
