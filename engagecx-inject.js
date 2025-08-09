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
// prevent double-binding if script re-runs
$('#nav-engagecx-link')
  .attr('href', '#') // don't let the portal router navigate
  .off('click')
  .on('click', async function (e) {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation(); // <- this is the key

    // nav highlight
    $("#nav-buttons li").removeClass("nav-link-current");
    $("#nav-engagecx").addClass("nav-link-current");
    $('.navigation-title').text("EngageCX");

    const company = encodeURIComponent('Demo Tenant');
    const userId  = encodeURIComponent('DemoSite');
    const src =
      'https://engagecx.clarityvoice.com/#/agentConsole/message'
      + '?includeWs=true&autoLogon=true'
      + `&company=${company}&userId=${userId}`
      + '&topLayout=false&navigationStyle=none&showAgentProfile=false';

    let slot = $('#engagecx-slot');
    if (!slot.length) slot = $('<div id="engagecx-slot"></div>').appendTo('#content');

    $('#engagecxFrame').remove();
    const $iframe = $('<iframe>', {
      id: 'engagecxFrame', src, width: '100%', height: 800,
      allow: 'clipboard-write; microphone; camera', style: 'border:none'
    });

    slot.empty().append($iframe);

    // optional: hide the blue loader after heartbeat
    $iframe.on('load', async () => {
      try {
        const r = await fetch('/portal/home/checkSession', { credentials:'include', cache:'no-store' });
        if (r.ok) $('#flashContainer .flashMsgContainer.loader-flash').css('display','none');
      } catch {}
    });

    return false;
  });




