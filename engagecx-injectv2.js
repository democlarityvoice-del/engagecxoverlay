(async function() {
  try {
    const config = window?.clarity?.uiConfigs?.find(c => c.param === "PORTAL_SHOW_CLARITY_ENGAGECX_DROPDOWN_BTN");
    if (!config || !config.value) {
      console.warn("[Dropdown Loader] No param or value found.");
      return;
    }

    const script = document.createElement("script");
    script.src = config.value;
    script.onload = () => console.log("[Dropdown Loader] Script loaded:", config.value);
    script.onerror = (e) => console.error("[Dropdown Loader] Failed to load:", config.value, e);
    document.head.appendChild(script);
  } catch (err) {
    console.error("[Dropdown Loader] Runtime error", err);
  }
})();


