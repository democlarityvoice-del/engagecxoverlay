// Auto-load EngageCX Apps Dropdown Script from UI Config
(async function() {
  try {
    const config = window?.clarity?.uiConfigs?.find(c => c.param === "dropdownLoader");
    if (!config || !config.value) {
      console.warn("[Dropdown Loader] No dropdownLoader param found in UI config.");
      return;
    }

    const script = document.createElement("script");
    script.src = config.value;
    script.onload = () => console.log("[Dropdown Loader] Script loaded successfully:", config.value);
    script.onerror = (e) => console.error("[Dropdown Loader] Failed to load script:", config.value, e);
    document.head.appendChild(script);
  } catch (err) {
    console.error("[Dropdown Loader] Error while loading dropdown script", err);
  }
})();

