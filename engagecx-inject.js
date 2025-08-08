// If it's already there, don't add a second one
if ($('#nav-engagecx').length) {
  $('#nav-engagecx a').trigger('click');
  return;
}

// Clone an existing tile and make it ours
let existingbutton = $('#nav-music');        // base to clone
let newbutton = existingbutton.clone();

newbutton.attr('id', 'nav-engagecx');        // new unique id
newbutton.find('a').attr('id', 'nav-engagecx-link'); // avoid dup anchor ids
newbutton.find('.nav-text').html('EngageCX');

// Place it after Call History if present, else at end
const after = $('#nav-callhistory');
if (after.length) {
  newbutton.insertAfter(after);
} else {
  newbutton.appendTo($('#nav-buttons'));
}

// Icon & style to match native tiles
newbutton.find('.nav-bg-image').css({
  '-webkit-mask-image': "url('https://raw.githubusercontent.com/democlarityvoice-del/engagecxicon/main/message-regular-full.svg?v=3')",
  'mask-image':         "url('https://raw.githubusercontent.com/democlarityvoice-del/engagecxicon/main/message-regular-full.svg?v=3')",
  '-webkit-mask-repeat':'no-repeat',
  'mask-repeat':        'no-repeat',
  '-webkit-mask-position':'center 48%',
  'mask-position':      'center 48%',
  '-webkit-mask-size':  '71% 71%',
  'mask-size':          '71% 71%',
  'background-color':   'rgba(255,255,255,0.92)'
});

if (!document.getElementById('engagecx-style')) {
  const style = document.createElement('style');
  style.id = 'engagecx-style';
  style.textContent = `
    /* Lighten the EngageCX tile ONLY when it's not active */
    #nav-engagecx:not(.nav-link-current) .nav-button.btn { filter: brightness(1.08); }
  `;
  document.head.appendChild(style);
}

// Click -> load login INSIDE iframe (known-good) with 800px height
newbutton.find('a').on('click', function (e) {
  e.preventDefault();

  $("#nav-buttons li").removeClass("nav-link-current");
  newbutton.addClass("nav-link-current");
  $('.navigation-title').html("EngageCX");

  $('#content').html(`
    <iframe
      id="engagecx-frame"
      src="https://engagecx.clarityvoice.com/#/login"
      style="border:none; width:100%; height:800px;"
      allow="geolocation; microphone; camera; clipboard-write; autoplay; encrypted-media; fullscreen; picture-in-picture; screen-wake-lock"
      allowfullscreen
    ></iframe>
  `);

  return false;
});
