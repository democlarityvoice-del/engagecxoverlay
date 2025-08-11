// --- Clone a tile and make "EngageCX" ---  force log out NUKE EDITION, die die
// --- Clone a tile and make "EngageCX" (appearance unchanged) ---
let existingbutton = $('#nav-music'); // base to clone
let newbutton = existingbutton.clone();

newbutton.attr('id', 'nav-engagecx');
newbutton.find('a').attr('id', 'nav-engagecx-link');
newbutton.find('.nav-text').html("EngageCX");

// place after Call History if present
const after = $('#nav-callhistory');
if (after.length) {
  newbutton.insertAfter(after);
} else {
  newbutton.appendTo($('#nav-buttons'));
}

// Icon mask
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

$('#nav-engagecx a').attr('href', '#');

// CLICK → load login page in iframe + toolbar buttons
$(document).off('click.engagecx', '#nav-engagecx, #nav-engagecx a')
.on('click.engagecx', '#nav-engagecx, #nav-engagecx a', function (e) {
  e.preventDefault();
  e.stopPropagation();

  $("#nav-buttons li").removeClass("nav-link-current");
  $("#nav-engagecx").addClass("nav-link-current");
  $('.navigation-title').text("EngageCX");

  const $content = $('#content');
  $content.empty();

  let $slot = $('#engagecx-slot');
  if (!$slot.length) {
    $slot = $('<div id="engagecx-slot"></div>').appendTo('#content');
  } else {
    $slot.empty();
  }

  const loginUrl  = 'https://engagecx.clarityvoice.com/#/login?t=' + Date.now();
  const targetUrl = 'https://engagecx.clarityvoice.com/#/agentConsole/message/index?includeWs=true';

  // Toolbar with two buttons
  const $bar = $(`
    <div style="display:flex;align-items:center;gap:8px;
         padding:10px 12px;border-bottom:1px solid #e5e7eb;background:#fafafa;">
      <span style="font-size:13px;color:#444">After logging in, click:</span>
      <button id="engagecx-go-agent" class="btn btn-small" style="padding:6px 10px;cursor:pointer;">
        Go to Agents Panel
      </button>
      <button id="engagecx-refresh" class="btn btn-small" style="padding:6px 10px;cursor:pointer;">
        Refresh Session
      </button>
    </div>
  `);

  const $iframe = $('<iframe>', {
    id: 'engagecxFrame',
    src: loginUrl,
    style: 'border:none; width:100%; height:calc(100vh - 240px); min-height:800px;'
  });

  $slot.append($bar, $iframe);

  // Go to Agents Panel
  $(document).off('click.engagecx-go').on('click.engagecx-go', '#engagecx-go-agent', function (e) {
    e.preventDefault();
    $('#engagecxFrame').attr('src', targetUrl);
  });
}); // ✅ Close EngageCX main click handler here

// Refresh Session → Nuke cookies via popup, then reload login
$(document).off('click.engagecx-refresh')
.on('click.engagecx-refresh', '#engagecx-refresh', function (e) {
    e.preventDefault();

    $('#engagecx-go-agent').prop('disabled', true).text('Refreshing...');

    // Step 1: Open EngageCX popup on same domain so we can clear cookies
    const popup = window.open(
        'https://engagecx.clarityvoice.com/#/login',
        'EngageCXNuke',
        'width=800,height=600,noopener'
    );

    // Step 2: Inject nuke script after popup loads
    const injectNuke = setInterval(() => {
        try {
            if (popup && popup.document && popup.document.readyState === 'complete') {
                popup.document.body.innerHTML = `<p style="font-family:sans-serif;padding:20px;">
                    Clearing EngageCX session... please wait...
                </p>`;
                popup.eval(`
                    document.cookie.split(';').forEach(function(c) {
                        document.cookie = c.replace(/^ +/, '')
                            .replace(/=.*/, '=;expires=' + new Date(0).toUTCString() + ';path=/');
                    });
                    location.href = '/#/login';
                `);
                clearInterval(injectNuke);
            }
        } catch (err) {
            // Ignore cross-domain errors until it’s fully loaded
        }
    }, 300);

    // Step 3: When popup closes, reload iframe with clean login
    const watchClose = setInterval(() => {
        if (!popup || popup.closed) {
            clearInterval(watchClose);
            $('#engagecxFrame').attr('src', 'https://engagecx.clarityvoice.com/#/login?t=' + Date.now());
            $('#engagecx-go-agent').prop('disabled', false).text('Go to Agents Panel');
        }
    }, 500);
});
