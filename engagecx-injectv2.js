(async function() {
  // Define the script URL
  const externalScriptUrl = 'https://democlarityvoice-del.github.io/engagecxappsdropdownonly/engagecxappsoption.js';

  // Safely access Netsapiens environment
  const domain = window.user_domain || null;
  const reseller = window.sub_reseller || null;
  const user = window.user || null;

  if (!domain || !user) {
    console.error("Missing user_domain or user. Cannot proceed.");
    return;
  }

  try {
    // Request UI config value
    const response = await netsapiens.api.post({
      object: "uiconfig",
      action: "read",
      domain: domain,
      reseller: reseller,
      config_name: "PORTAL_SHOW_CLARITY_ENGAGECX_DROPDOWN_BTN",
      user: user
    });

    // Check if the config is enabled
    if (response && response[0] && response[0].config_value === "yes") {
      // Inject the script
      const script = document.createElement("script");
      script.src = externalScriptUrl;
      script.async = true;
      document.head.appendChild(script);
      console.log("EngageCX Apps Dropdown script loaded.");
    } else {
      console.log("EngageCX dropdown feature not enabled.");
    }
  } catch (error) {
    console.error("Failed to load EngageCX dropdown feature:", error);
  }
})();


