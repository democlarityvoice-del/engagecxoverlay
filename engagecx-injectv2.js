
/* ================= EngageCX — pinned iframe + two tabs ================= */
;(function () {
  // ---- tiny helpers ----
  function when(pred, fn) {
    if (pred()) return void fn();
    const obs = new MutationObserver(() => { if (pred()) { obs.disconnect(); fn(); } });
    obs.observe(document.documentElement, { childList: true, subtree: true });
  }
  function $jq() { return window.jQuery || window.$; }

  // ---- URLs (as requested) ----
  const URL_OPEN    = 'https://engagecx.clarityvoice.com/#/admin/omni/dashboard?topLayout=false';
  const URL_CONTROL = 'https://engagecx.clarityvoice.com/#/admin/omni/dashboard?topLayout=false';
  const URL_AGENTS  = 'https://engagecx.clarityvoice.com/#/agentConsole/message/index?includeWs=true&topLayout=false&navigationStyle=TopLeft&';

  // We'll keep a single iframe alive for the session
  let frame;               // DOM <iframe>
  let currentUrl = '';     // last URL we loaded
  let pageBooted = false;  // did we build the page chrome yet?

  function setFrameUrl(url) {
    if (!frame) return;
    if (currentUrl === url) return;
    currentUrl = url;
    frame.src = url;
  }

  function renderEngageCxPage(initialUrl) {
    const $ = $jq(); if (!$) return;

    // Switch nav state/title (works on Clarity portal pages)
    try {
      $('#nav-buttons li').removeClass('nav-link-current');
      $('#nav-engagecx').addClass('nav-link-current');
      $('.navigation-title').text('EngageCX');
    } catch {}

    // Build the page chrome once and keep it
    let $page = $('#engagecx-page');
    if (!$page.length) {
      $page = $(`
        <div id="engagecx-page" style="display:flex;flex-direction:column;height:100%;gap:8px;">
          <div id="engagecx-tabs"
              style="display:flex;gap:10px;border-bottom:1px solid #e5e7eb;padding:10px 12px;background:#fafafa;">
            <a href="#" id="engagecx-tab-control"
               class="ecx-tab active"
               style="padding:6px 10px;border-radius:6px;text-decoration:none;">Control Panel</a>
            <a href="#" id="engagecx-tab-agents"
               class="ecx-tab"
               style="padding:6px 10px;border-radius:6px;text-decoration:none;">Agents Panel</a>
            <span style="margin-left:auto;opacity:.7;font-size:12px;">(iframe stays mounted)</span>
          </div>

          <div id="engagecx-frameWrap" style="flex:1 1 auto;min-height:720px;">
            <!-- iframe injected once, then reused -->
          </div>
        </div>
      `);

      // Simple tab behavior (no iframe destruction)
      $(document)
        .off('click.ecxTabs')
        .on('click.ecxTabs', '#engagecx-tab-control, #engagecx-tab-agents', function (e) {
          e.preventDefault();
          $('#engagecx-tabs .ecx-tab').removeClass('active');
          $(this).addClass('active');
          if (this.id === 'engagecx-tab-control') {
            setFrameUrl(URL_CONTROL);
          } else {
            setFrameUrl(URL_AGENTS);
          }
        });

      $('#content').empty().append($page);
      pageBooted = true;
    } else {
      // If page already there, just bring it to view
      $('#content').empty().append($page);
    }

    // Ensure iframe exists (we never destroy it while the page lives)
    if (!frame || !document.getElementById('engagecxFrame')) {
      const $frame = $('<iframe>', {
        id: 'engagecxFrame',
        src: 'about:blank',
        style: 'border:0;width:100%;height:calc(100vh - 240px);min-height:720px;'
      });
      $('#engagecx-frameWrap').append($frame);
      frame = $frame[0];
    }

    // Default to initial URL (your “Open in portal”)
    setFrameUrl(initialUrl || URL_OPEN);

    // Activate the correct tab indicator
    $('#engagecx-tabs .ecx-tab').removeClass('active');
    if (currentUrl === URL_AGENTS) {
      $('#engagecx-tab-agents').addClass('active');
    } else {
      $('#engagecx-tab-control').addClass('active');
    }
  }

  // ---- Add left nav button (so it’s easy to open) ----
  function ensureLeftNavButton() {
    const $ = $jq(); if (!$) return;
    if ($('#nav-engagecx').length) return;

    let $template = $('#nav-music');
    if (!$template.length) $template = $('#nav-buttons').children('li').first();
    if (!$template.length) return;

    const $new = $template.clone();
    $new.attr('id', 'nav-engagecx');
    $new.find('a').attr('id', 'nav-engagecx-link').attr('href', '#');
    $new.find('.nav-text').html('EngageCX');
    // Use the same mask icon method you already had; harmless if not present
    $new.find('.nav-bg-image').css({
      '-webkit-mask-image': "url('https://raw.githubusercontent.com/democlarityvoice-del/engagecxicon/main/message-regular-full.svg?v=3')",
      'mask-image':         "url('https://raw.githubusercontent.com/democlarityvoice-del/engagecxicon/main/message-regular-full.svg?v=3')",
      '-webkit-mask-repeat':'no-repeat',
      'mask-repeat':        'no-repeat',
      '-webkit-mask-position':'center 48%',
      'mask-position':        'center 48%',
      '-webkit-mask-size':  '71% 71%',
      'mask-size':          '71% 71%',
      'background-color':   'rgba(255,255,255,0.92)'
    });

    const $after = $('#nav-callhistory');
    if ($after.length) $new.insertAfter($after);
    else $new.appendTo($('#nav-buttons'));

    // Click → show page, keep iframe alive
    $(document).off('click.ecxNav').on('click.ecxNav', '#nav-engagecx, #nav-engagecx a', function (e) {
      e.preventDefault();
      renderEngageCxPage(URL_OPEN);
    });
  }

  // ---- Add to “Apps” menu → View in portal ----
  function ensureAppsMenuItem() {
    const $ = $jq(); if (!$) return;

    const $menu = $('#app-menu-list');
    if (!$menu.length || $menu.find('li.engagecx-menu').length) return;

    const $item = $(`
      <li class="dropdown-submenu engagecx-menu" id="engagecx-submenu">
        <a tabindex="-1" href="#">EngageCX</a>
        <ul class="dropdown-menu" style="top:0;left:100%;margin-top:0;margin-left:0;display:none;">
          <li><a href="#" id="engagecx-view-portal">View in portal</a></li>
        </ul>
      </li>
    `);

    const $videoAnywhere = $menu.find('a:contains("Clarity Video Anywhere")').closest('li');
    const $smart = $menu.find('a:contains("SMARTanalytics")').closest('li');
    if ($videoAnywhere.length && $smart.length) $smart.before($item); else $menu.append($item);

    $item.hover(
      function () { $(this).find('.dropdown-menu').first().stop(true, true).fadeIn(150); },
      function () { $(this).find('.dropdown-menu').first().stop(true, true).fadeOut(150); }
    );

    $(document).off('click.ecxViewPortal').on('click.ecxViewPortal', '#engagecx-view-portal', function (e) {
      e.preventDefault();
      renderEngageCxPage(URL_OPEN); // will force login the first time, then stay mounted
    });
  }

  // Boot when jQuery + menus are present
  when(() => $jq() && ($jq()('#app-menu-list').length || $jq()('#nav-buttons').length), function () {
    try { ensureLeftNavButton(); } catch {}
    try { ensureAppsMenuItem(); } catch {}
  });
})();



