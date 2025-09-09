function waitForClarityAndRun() {
  if (typeof clarity !== 'undefined' && clarity?.ui?.get) {
    try {
      const dropdownUrl = clarity.ui.get('PORTAL_SHOW_CLARITY_ENGAGECX_DROPDOWN_BTN');
      if (dropdownUrl?.startsWith('http')) {
        const s = document.createElement('script');
        s.src = dropdownUrl;
        s.onload = () => console.log('[Dropdown Loader] Loaded:', dropdownUrl);
        s.onerror = () => console.error('[Dropdown Loader] Failed to load:', dropdownUrl);
        document.head.appendChild(s);
      } else {
        console.warn('[Dropdown Loader] No valid dropdown URL set.');
      }
    } catch (e) {
      console.error('[Dropdown Loader] Error while loading dropdown script:', e);
    }
  } else {
    // Retry in 100ms
    setTimeout(waitForClarityAndRun, 100);
  }
}

// Start waiting
waitForClarityAndRun();
