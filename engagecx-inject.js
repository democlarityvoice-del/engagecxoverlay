// --- Clone a tile and make "EngageCX" (appearance unchanged) ---
let existingbutton = $('#nav-music'); // base to clone
let newbutton = existingbutton.clone();

newbutton.attr('id', 'nav-engagecx');                    // unique id
newbutton.find('a').attr('id', 'nav-engagecx-link');     // avoid dup anchor ids
newbutton.find('.nav-text').html("EngageCX");

// place it immediately after Call History if present; else append at end
const after = $('#nav-callhistory');
if (after.length) {
  newbutton.insertAfter(after);
} else {
  newbutton.appendTo($('#nav-buttons'));
}

// --- Clone a tile and make "EngageCX" (appearance unchanged) ---
let existingbutton = $('#nav-music');
let newbutton = existingbutton.clone();

newbutton.attr('id', 'nav-engagecx');
newbutton.find('a').attr('id', 'nav-engagecx-link');
newbutton.find('.nav-text').html("EngageCX");

const after = $('#nav-callhistory');
if (after.length) newbutton.insertAfter(after);
else newbutton.appendTo($('#nav-buttons'));

// icon mask
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

// one-time CSS for the host + iframe
if (!document.getElementById('engagecx-css')) {
  const css = document.createElement('style');
  css.id = 'engagecx-css';
  css.textContent = `
    #engagecx-slot { padding:0; margin:0; }
    #engagecxFrame { display:block; width:100%; height:calc(100vh - 220px); border:0; }
  `;
  document.head.appendChild(css);
}

// neutralize router
$('#nav-engagecx a').attr('href', '#');

// helper: mount iframe, replacing portal content
function mountEngageCx(url) {
  const $content = $('#content');

  // stash original children once so we can restore later if needed
  if (!$content.data('orig')) {
    // detach keeps events in case you want to put it back
    $content.data('orig', $content.children().detach());
  }

  $content.empty();                            // <- remove dashboard blocks
  const $slot = $('<div id="engagecx-slot"></div>');
  const $iframe = $('<iframe>', {
    id: 'engagecxFrame',
    src: url,                                  // sanity check URL
    title: 'EngageCX',
  });
  $slot.append($iframe);
  $content.append($slot);

  // kill the blue loader if it’s up
  $('#flashContainer .flashMsgContainer.loader-flash').css('display','none');

  window.scrollTo(0,0);
}

// optional: restore when clicking any other tile
$(document).off('click.engagecx-exit')
  .on('click.engagecx-exit', '#nav-buttons li:not(#nav-engagecx)', function(){
    const $content = $('#content');
    const $orig = $content.data('orig');
    if ($orig) {
      $('#engagecx-slot').remove();
      $content.append($orig);
      $content.removeData('orig');
    }
  });

// delegated click for our tile
$(document)
  .off('click.engagecx', '#nav-engagecx, #nav-engagecx a')
  .on('click.engagecx', '#nav-engagecx, #nav-engagecx a', function (e) {
    e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();

    $("#nav-buttons li").removeClass("nav-link-current");
    $("#nav-engagecx").addClass("nav-link-current");
    $('.navigation-title').text("EngageCX");

    // SANITY CHECK: use a site that allows iframing
    // swap to engagecx URL later
    mountEngageCx('https://example.com');
  });

console.log('[EngageCX] wired');
