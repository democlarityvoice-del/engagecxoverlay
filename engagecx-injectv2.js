// ===== EngageCX bootstrap (waits for jQuery + nav) =====
;(function () {
  function when(pred, fn) {
    if (pred()) return void fn();
    const obs = new MutationObserver(() => { if (pred()) { obs.disconnect(); fn(); } });
    obs.observe(document.documentElement, { childList: true, subtree: true });
    const iv = setInterval(() => { if (pred()) { clearInterval(iv); fn(); } }, 300);
  }

  function start() {
    let $template = $('#nav-music');
    if (!$template.length) $template = $('#nav-buttons').children('li').first();
    if (!$template.length) return;

    // Top scrollbar helpers
    function updateTopScroll() {
      const $slot = $('#engagecx-slot');
      const $track = $('#engagecx-scrolltop .track');
      if ($slot.length && $track.length) {
        $track.width($slot[0].scrollWidth || 0);
      }
    }
    // === Top & Right scrollbars (sync with #engagecx-slot) ===
let _lock = false;

function updateTopScroll() {
  const $slot = $('#engagecx-slot'), $track = $('#engagecx-scrolltop .track');
  if ($slot.length && $track.length) $track.width($slot[0].scrollWidth || 0);
}
function setupTopScroll() {
  const $slot = $('#engagecx-slot'); if (!$slot.length) return;
  let $top = $('#engagecx-scrolltop');
  if (!$top.length) {
    $top = $('<div id="engagecx-scrolltop"><div class="track"></div></div>')
      .css({height:'16px',overflowX:'auto',overflowY:'hidden',position:'sticky',top:0,zIndex:30,background:'#fafafa',width:'100%'});
    const $first = $slot.children().first(); ($first.length ? $top.insertAfter($first) : $slot.prepend($top));
    $top.find('.track').css({display:'block',height:'1px'});
  }
  $top.off('scroll.sync').on('scroll.sync', function(){
    if (_lock) return; _lock = true; $slot.scrollLeft(this.scrollLeft); _lock = false;
  });
  $slot.off('scroll.syncTop').on('scroll.syncTop', function(){
    if (_lock) return; _lock = true; $top.scrollLeft(this.scrollLeft); _lock = false;
  });
  updateTopScroll();
}

function updateRightScroll() {
  const $slot = $('#engagecx-slot'), $track = $('#engagecx-scrollright .vtrack');
  if ($slot.length && $track.length) {
    $track.height($slot[0].scrollWidth || 0);                 // map vertical to horizontal
    $('#engagecx-scrollright').height($slot.innerHeight()||0); // match visible height
  }
}
function setupRightScroll() {
  const $slot = $('#engagecx-slot'); if (!$slot.length) return;
  let $right = $('#engagecx-scrollright');
  if (!$right.length) {
    $right = $('<div id="engagecx-scrollright"><div class="vtrack"></div></div>')
      .css({width:'16px',overflowY:'auto',overflowX:'hidden',position:'sticky',top:0,alignSelf:'flex-end',zIndex:30,background:'#fafafa'});
    // place as last child so it sits on the right side of slot
    $slot.append($right);
  }
  $right.find('.vtrack').css({display:'block',width:'1px'});
  $right.off('scroll.sync').on('scroll.sync', function(){
    if (_lock) return; _lock = true; $slot.scrollLeft(this.scrollTop); _lock = false;
  });
  $slot.off('scroll.syncRight').on('scroll.syncRight', function(){
    if (_lock) return; _lock = true; $right.scrollTop($slot.scrollLeft()); _lock = false;
  });
  updateRightScroll();
}

    //-------------------------------------------------------------------------------

    const $new = $template.clone();
    $new.attr('id', 'nav-engagecx');
    $new.find('a').attr('id', 'nav-engagecx-link').attr('href', '#');
    $new.find('.nav-text').html('EngageCX');
    $new.find('.nav-bg-image').css({
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

    const $after = $('#nav-callhistory');
    if ($after.length) $new.insertAfter($after); else $new.appendTo($('#nav-buttons'));

    function nextLoginUrl() {
      return 'https://engagecx.clarityvoice.com/#/login?t=' + Date.now() +
             '&r=' + Math.random().toString(36).slice(2);
    }
    const targetUrl  = 'https://engagecx.clarityvoice.com/#/agentConsole/message?includeWs=true&isTicket=true&topLayout=true';
    const controlUrl = 'https://engagecx.clarityvoice.com/#/admin/widget/dashboard?noLayout=false';

    // --- layout helpers ---
    function nudgeIframe() {
      const $f = $('#engagecxFrame');
      if (!$f.length) return;
      const el = $f[0];
      const origW = el.style.width || '100%';
      const pulses = [0, 150, 400, 900, 1600];
      pulses.forEach(ms => {
        setTimeout(() => {
          $f.css('width', '99.6%');
          void el.offsetWidth;
          $f.css('width', origW);
          window.dispatchEvent(new Event('resize'));
        }, ms);
      });
    }

    // expand/scroll-right toggle
    let isExpanded = false;
    const EXPAND_PX = 420;
    function applyExpandState() {
      const $slot = $('#engagecx-slot');
      const $f = $('#engagecxFrame');
      if (!$slot.length || !$f.length) return;
      $slot.css({ position: 'relative', overflowX: 'auto' });
      if (isExpanded) {
        $f.css('width', `calc(100% + ${EXPAND_PX}px)`);
        requestAnimationFrame(() => { $slot[0].scrollLeft = $slot[0].scrollWidth; });
      } else {
        $f.css('width', '100%');
        requestAnimationFrame(() => { $slot[0].scrollLeft = 0; });
      }
      nudgeIframe();
      $('#engagecx-expand').text(isExpanded ? 'Reset Width' : 'Expand / Scroll Right');
      updateTopScroll();
    }

    $(document).off('click.engagecx', '#nav-engagecx, #nav-engagecx a')
    .on('click.engagecx', '#nav-engagecx, #nav-engagecx a', function (e) {
      e.preventDefault(); e.stopPropagation();

      $('#nav-buttons li').removeClass('nav-link-current');
      $('#nav-engagecx').addClass('nav-link-current');
      $('.navigation-title').text('EngageCX');

      const $content = $('#content').empty();
      let $slot = $('#engagecx-slot');
      if (!$slot.length) $slot = $('<div id="engagecx-slot"></div>').appendTo('#content');
      else $slot.empty();

      const $bar = $(`
        <div style="display:flex;flex-direction:column;gap:6px;
             padding:10px 12px;border-bottom:1px solid #e5e7eb;background:#fafafa;">
          <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
            <button id="engagecx-go-agent"  class="btn btn-small" style="padding:6px 10px;cursor:pointer;">Go to Agents Panel</button>
            <button id="engagecx-go-control" class="btn btn-small" style="padding:6px 10px;cursor:pointer;">Go to Control Panel</button>
            <button id="engagecx-refresh"   class="btn btn-small" style="padding:6px 10px;cursor:pointer;"
              title="Click to refresh session or login/logout.">
              Refresh / Log out
            </button>
            <button id="engagecx-expand"    class="btn btn-small" style="padding:6px 10px;cursor:pointer;">Expand / Scroll Right</button>
          </div>
        </div>
      `);

      const $iframe = $('<iframe>', {
        id: 'engagecxFrame',
        src: nextLoginUrl(),
        style: 'border:none; width:100%; height:calc(100vh - 240px); min-height:800px; overflow:auto;',
        scrolling: 'yes'
      });

            $iframe.on('load', function () {
        nudgeIframe();
        applyExpandState();
        updateTopScroll();
        updateRightScroll();
      });

      $slot.append($bar, $iframe);
      setupTopScroll();
      setupRightScroll();
      applyExpandState();
    });

    // Go to Agents Panel
    $(document).off('click.engagecx-go-agent')
    .on('click.engagecx-go-agent', '#engagecx-go-agent', function (e) {
      e.preventDefault();
      $('#engagecxFrame').attr('src', targetUrl);
      nudgeIframe();
      applyExpandState();
      updateTopScroll();
      updateRightScroll();
    });

    // Go to Control Panel
    $(document).off('click.engagecx-go-control')
    .on('click.engagecx-go-control', '#engagecx-go-control', function (e) {
      e.preventDefault();
      $('#engagecxFrame').attr('src', controlUrl);
      nudgeIframe();
      applyExpandState();
      updateTopScroll();
      updateRightScroll();
    });

    // Refresh Session
    $(document).off('click.engagecx-refresh')
    .on('click.engagecx-refresh', '#engagecx-refresh', function (e) {
      e.preventDefault();
      try {
        window.open(
          'https://engagecx.clarityvoice.com/#/logout?t=' + Date.now(),
          'EngageCXLogout',
          'width=900,height=700,noopener,noreferrer'
        );
      } catch {}
      $('#engagecxFrame').attr('src', nextLoginUrl());
      nudgeIframe();
      applyExpandState();
      updateTopScroll();
      updateRightScroll();
    });

    // Expand / Reset
    $(document).off('click.engagecx-expand')
    .on('click.engagecx-expand', '#engagecx-expand', function (e) {
      e.preventDefault();
      isExpanded = !isExpanded;
      applyExpandState();
      updateTopScroll();
      updateRightScroll();
    });

    // Keep tracks in sync on resize
    $(window).off('resize.engagecx-scrolls')
      .on('resize.engagecx-scrolls', function () {
        updateTopScroll();
        updateRightScroll();
      });
  }

  (function waitForJQ() {
    const jq = window.jQuery || window.$;
    if (!jq || !jq.fn || !jq.fn.jquery) return void setTimeout(waitForJQ, 300);
    when(
      () => jq('#nav-buttons').length && (jq('#nav-music').length || jq('#nav-buttons').children('li').length),
      start
    );
  })();
})();
