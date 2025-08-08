(function () {
  // --- CONFIG ---
  const ENGAGECX_URL = "https://engagecx.clarityvoice.com/";

  // --- Helpers ---
  function onReady(fn) {
    (document.readyState !== 'loading')
      ? fn()
      : document.addEventListener('DOMContentLoaded', fn);
  }

  function log(msg) { console.info(`[EngageCX Inject] ${msg}`); }
  function warn(msg) { console.warn(`[EngageCX Inject] ${msg}`); }

  onReady(function () {
    // Locate the nav/menu container
    const menu =
      document.querySelector("#menu") ||
      document.querySelector(".nav-buttons") ||
      document.querySelector("nav ul");

    if (!menu) { warn("Menu container not found."); return; }

    // Try to find the Call History item to insert after
    const allLis = Array.from(menu.querySelectorAll("li"));
    const callHistoryLi = allLis.find(li => /call\s*history/i.test(li.textContent || ""));

    // Build the new button <li><a>
    const li = document.createElement("li");
    li.id = "engagecx-li";

    // Try to mirror classes from Call History for a perfect match
    if (callHistoryLi && callHistoryLi.className) li.className = callHistoryLi.className;
    else li.className =
