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
  '-webkit-mask-position':
