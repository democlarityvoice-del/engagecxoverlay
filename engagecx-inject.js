(function() {
    // --- CONFIG ---
    const ENGAGECX_URL = "https://engagecx.clarityvoice.com/"; // replace with actual EngageCX panel URL

    // Wait for the DOM to be ready
    function onReady(callback) {
        if (document.readyState !== 'loading') {
            callback();
        } else {
            document.addEventListener('DOMContentLoaded', callback);
        }
    }

    // Main execution
    onReady(function() {
        // Check hostname and domain
        const hostMatch = window.location.hostname === "portal02.clarityvoice.net";
        const domainElem = document.querySelector("#domain-select option[selected]"); 
        const domainName = domainElem ? domainElem.textContent.trim().toLowerCase() : "";

        if (!hostMatch || domainName !== "abtesting") return;

        console.log("EngageCX Button Injection: conditions met");

        // Find the sidebar menu container
        const menu = document.querySelector("#menu"); 
        if (!menu) {
            console.warn("EngageCX Button Injection: Menu container not found.");
            return;
        }

       // Create button
const btn = document.createElement("li");
btn.className = "menu-item";
btn.innerHTML = `<a href="#" id="engagecx-btn">EngageCX</a>`;
menu.appendChild(btn);

// Click handler (attach to the anchor)
const anchor = btn.querySelector('#engagecx-btn');
anchor.addEventListener("click", function(e) {
  e.preventDefault();

  const mainContent = document.querySelector("#main-content");
  if (!mainContent) {
    console.warn("EngageCX Button Injection: Main content container not found.");
    return;
  }

  mainContent.innerHTML = `
    <iframe src="${ENGAGECX_URL}" style="width:100%; height:800px; border:none;"></iframe>
  `;
});

        });
    });
})();
