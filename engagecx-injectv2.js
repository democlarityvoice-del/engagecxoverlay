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

    // === Top & Right scrollbars (sync with #engagecx-slot) ===
    let _lock = false;

    function updateTopScroll() {
      const $slot  = $('#engagecx-slot');
      const $track = $('#engagecx-scrolltop .track');
      const $top   = $('#engagecx-scrolltop');
      if (!$slot.length || !$track.length || !$top.length) return;
      $track.css('minWidth', ($slot[0].scrollWidth || 0) + 1); // ensure scrollable
      $top[0].scrollLeft = $slot[0].scrollLeft;
    }

    function setupTopScroll() {
      const $slot = $('#engagecx-slot'); if (!$slot.length) return;
      let $top = $('#engagecx-scrolltop');
      if (!$top.length) {
        $top = $('<div id="engagecx-scrolltop"><div class="track"></div></div>')
          .css({height:'16px', overflowX:'scroll', overflowY:'hidden', position:'sticky', top:0, zIndex:30, background:'#fafafa', width:'100%'});
        $top.insertBefore($slot);
        $top.find('.track').css({display:'block', height:'1px'});
      }
      $top.off('scroll.sync').on('scroll.sync', function () {
        if (_lock) return; _lock = true; $slot.scrollLeft(this.scrollLeft); _lock = false;
      });
      $slot.off('scroll.syncTop').on('scroll.syncTop', function () {
        if (_lock) return; _lock = true; $top.scrollLeft($slot.scrollLeft()); _lock = false;
      });
      updateTopScroll();
    }

    function updateRightScroll() {
      const $slot = $('#engagecx-slot'), $track = $('#engagecx-scrollright .vtrack');
      if ($slot.length && $track.length) {
        $track.height($slot[0].scrollWidth || 0);
        $('#engagecx-scrollright').height($slot.innerHeight() || 0);
      }
    }

    function setupRightScroll() {
      const $slot = $('#engagecx-slot'); if (!$slot.length) return;
      let $right = $('#engagecx-scrollright');
      if (!$right.length) {
        $right = $('<div id="engagecx-scro
