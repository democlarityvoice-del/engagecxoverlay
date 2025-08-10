// --- Clone a tile and make "EngageCX" (appearance unchanged) ---  another try
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

// Icon mask + visual match (unchanged)
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

// one-time style (unchanged)
if (!document.getElementById('engagecx-style')) {
  const style = document.createElement('style');
  style.id = 'engagecx-style';
  style.textContent = `
    #nav-engagecx:not(.nav-link-current) .nav-button.btn { filter: brightness(1.08); }
  `;
  document.head.appendChild(style);
}

// click handler (same structure/appearance as before)
$('#nav-engagecx-link')
  .attr('href', '#') // keep portal from navigating
  .off('click')
  .on('click', function (e) {
    e.preventDefault();
    e.stopPropagation();

    // nav highlight + title (unchanged)
    $("#nav-buttons li").removeClass("nav-link-current");
    $("#nav-engagecx").addClass("nav-link-current");
    $('.navigation-title').text("EngageCX");

    // slot handling (unchanged)
    let slot = $('#engagecx-slot');
    if (!slot.length) slot = $('<div id="engagecx-slot"></div>').appendTo('#content');
    else slot.empty();

    // ----- ONLY CHANGE STARTS HERE: build login + redirect to Agent Panel -----
    const targetHash   = '#/agentConsole/message/index?includeWs=true';
    const redirectHash = encodeURIComponent(targetHash);
    const redirectPath = encodeURIComponent('/agentConsole/message/index?includeWs=true');

    // Try A first; if it doesn't hop after login, switch to [1], [2], or [3]
    const urls = [
      `https://engagecx.clarityvoice.com/#/login?redirect=${redirectHash}&t=${Date.now()}`,   // A (hash)
      `https://engagecx.clarityvoice.com/#/login?redirect=${redirectPath}&t=${Date.now()}`,   // B (path)
      `https://engagecx.clarityvoice.com/#/login?redirectTo=${redirectHash}&t=${Date.now()}`, // C (alt param)
      `https://engagecx.clarityvoice.com/#/login?redirectTo=${redirectPath}&t=${Date.now()}`  // D (alt + path)
    ];
    const url = urls[0]; // try A first
    // ----- ONLY CHANGE ENDS HERE -----

    // iframe (unchanged)
    $('#engagecxFrame').remove();
    const $iframe = $('<iframe>', {
      id: 'engagecxFrame',
      src: url,
      allow: 'clipboard-write; microphone; camera',
      style: 'border:none; width:100%; height:calc(100vh - 200px); min-height:800px;'
    });

    slot.append($iframe);
  });
