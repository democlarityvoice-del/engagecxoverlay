(function () {
  // --- CONFIG ---
  const ENGAGECX_URL = "https://engagecx.clarityvoice.com/";

  // --- Helpers ---
  function onReady(fn) {
    (document.readyState !== 'loading') ? fn() : document.addEventListener('DOMContentLoaded', fn);
  }

  function log(msg){ console.info(`[EngageCX Inject] ${msg}`); }
  function warn(msg){ console.warn(`[EngageCX Inject] ${msg}`); }

  onReady(function () {
    // Host + domain guards
    const allowedHosts = ["portal02.clarityvoice.net", "portal.clarityvoice.com"];
    const hostMatch = allowedHosts.includes(window.location.hostname);

    const domainMessage = document.getElementById('domain-message')?.textContent?.toLowerCase() || '';
    const domainMatch = domainMessage.includes('abtesting');

    if (!hostMatch || !domainMatch) {
      log(`Skipped (hostMatch=${hostMatch}, domainMatch=${domainMatch})`);
      return;
    }
    log("Conditions met.");

    // Prevent duplicate injection
    if (document.getElementById('engagecx-btn')) {
      log("Button already present; skipping reinjection.");
      return;
    }

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
    else li.className = "menu-item"; // fallback

    const a = document.createElement("a");
    a.id = "engagecx-btn";
    a.href = "#";
    a.textContent = "EngageCX";

    // Mirror anchor classes if available
    const callHistoryA = callHistoryLi?.querySelector("a");
    if (callHistoryA && callHistoryA.className) a.className = callHistoryA.className;

    li.appendChild(a);

    // Insert after Call History if found, else append to end
    if (callHistoryLi && callHistoryLi.parentNode === menu) {
      callHistoryLi.parentNode.insertBefore(li, callHistoryLi.nextSibling);
      log("Inserted EngageCX button after Call History.");
    } else {
      menu.appendChild(li);
      log("Inserted EngageCX button at end of menu (Call History not found).");
    }

    // Click -> swap content to iframe
    a.addEventListener("click", function (e) {
      e.preventDefault();

      const mainContent =
        document.querySelector("#main-content") ||
        document.querySelector("#content") ||
        document.querySelector(".content");

      if (!mainContent) { warn("Main content container not found."); return; }

      // Optional: set the page title area if present
      const navTitle =
        document.querySelector(".navigation-title") ||
        document.querySelector("#navigation-title");
      if (navTitle) navTitle.textContent = "EngageCX";

      mainContent.innerHTML = `
        <iframe src="${ENGAGECX_URL}" style="width:100%; height:800px; border:none;" allow="clipboard-write; microphone; camera"></iframe>
      `;

      log("Iframe injected.");
    });
  });
})();
