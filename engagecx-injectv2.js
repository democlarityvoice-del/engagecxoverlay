// --- Clone a tile and make "EngageCX" (appearance unchanged) ---  restore original code other than bottom- which totally sucks and breaks it
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

// Icon mask + visual match
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
    #nav-engagecx:not(.nav-link-current) .nav-button.btn { filter: brightness(1.08); }
  `;
  document.head.appendChild(style);
}

// neutralize the anchor
$('#nav-engagecx a').attr('href', '#');

// CLICK -> render EngageCX into the real content host
$(document)
  .off('click.engagecx', '#nav-engagecx, #nav-engagecx a')
  .on('click.engagecx', '#nav-engagecx, #nav-engagecx a', function (e) {
    e.preventDefault();
    e.stopPropagation();

    $("#nav-buttons li").removeClass("nav-link-current");
    $("#nav-engagecx").addClass("nav-link-current");
    $('.navigation-title').text("EngageCX");

    // find the real host (portal varies by page)
    let $host = $('#content');
    if (!$host.length) $host = $('#main-content');              // common alt
    if (!$host.length) $host = $('.page-container, .wrapper').first(); // last resort

    if (!$host.length) {
      console.warn('[EngageCX] No content host found; aborting to avoid appending at <body> end.');
      return; // don't create a fake #content at the bottom
    }

    // clear and build a fresh slot
    $host.empty();
    const $slot = $('<div id="engagecx-slot" style="padding:0;margin:0;display:block;"></div>');
    $host.append($slot);

    // size the iframe to the visible area
    const iframeStyle = 'border:none;width:100%;height:calc(100vh - 200px);min-height:800px;display:block;';

    // ==== choose where to go (redirect-to-Agent-Panel after login) ====
    const targetHash   = '#/agentConsole/message/index?includeWs=true';
    const redirectHash = encodeURIComponent(targetHash);
    const url = `https://engagecx.clarityvoice.com/#/login?redirect=${redirectHash}&t=${Date.now()}`;

    const $iframe = $('<iframe>', {
      id: 'engagecxFrame',
      src: url,
      allow: 'clipboard-write; microphone; camera',
      style: iframeStyle
    });

    $slot.append($iframe);
    window.scrollTo(0, 0); // make sure user sees the panel
  });


$slot.append($iframe);

});
