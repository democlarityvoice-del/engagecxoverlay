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

// Icon mask + visual match
newbutton.find('.nav-bg-image').css({
  // use the SVG as a mask so only the icon shape shows
  '-webkit-mask-image': "url('https://raw.githubusercontent.com/democlarityvoice-del/engagecxicon/main/message-regular-full.svg?v=3')",
  'mask-image':         "url('https://raw.githubusercontent.com/democlarityvoice-del/engagecxicon/main/message-regular-full.svg?v=3')",
  '-webkit-mask-repeat': 'no-repeat',
  'mask-repeat':         'no-repeat',
  '-webkit-mask-position':'center 48%',   // tiny upward nudge
  'mask-position':       'center 48%',
  '-webkit-mask-size':   '71% 71%',
  'mask-size':           '71% 71%',
  'background-color':    'rgba(255,255,255,0.92)'
});

// one-time style: slight lift when not active
if (!document.getElementById('engagecx-style')) {
  const style = document.createElement('style');
  style.id = 'engagecx-style';
  style.textContent = `
    #nav-engagecx:not(.nav-link-current) .nav-button.btn { filter: brightness(1.08); }
  `;
  document.head.appendChild(style);
}
newbutton.find('a').on('click', function (e) {
  e.preventDefault();

  // nav highlight
  $("#nav-buttons li").removeClass("nav-link-current");
  newbutton.addClass("nav-link-current");
  $('.navigation-title').text("EngageCX");

  // build the iframe safely
  const src = 'https://engagecx.clarityvoice.com/#/agentConsole/message'
            + '?includeWs=true'
            + '&autoLogon=true'
            + '&company=Demo%20Tenant'
            + '&userId=201'
            + '&topLayout=false'
            + '&navigationStyle=none'
            + '&showAgentProfile=false';

  // don't blow away other scripts; use a dedicated slot
  let slot = $('#engagecx-slot');
  if (!slot.length) {
    slot = $('<div id="engagecx-slot"></div>').appendTo('#content');
  }

  const $iframe = $('<iframe>', {
    id: 'engagecxFrame',
    src,
    width: '100%',
    height: 800,
    allow: 'clipboard-write; microphone; camera',
    style: 'border:none'
  });

  slot.empty().append($iframe);

  // optional: clear the blue loader once the portal heartbeat says OK
  $iframe.on('load', async () => {
    try {
      const r = await fetch('/portal/home/checkSession', { credentials: 'include', cache: 'no-store' });
      if (r.ok) $('#flashContainer .flashMsgContainer.loader-flash').css('display','none');
    } catch (_) {}
  });

  return false;
});



