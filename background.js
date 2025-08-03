// background.js

// --- Predictive Tab Opening (Simulated AI) ---
async function predictiveTabOpening() {
  console.log("Attempting predictive tab opening...");
  const now = new Date();
  const day = now.getDay(); // 0 = Sunday, 6 = Saturday
  const hours = now.getHours();

  if (day >= 1 && day <= 5 && hours >= 8 && hours <= 10) { // Weekday morning
    chrome.tabs.query({url: "*://news.google.com/*"}, function(tabs) {
      if (tabs.length === 0) {
        chrome.tabs.create({ url: "https://news.google.com/" });
      }
    });
    chrome.tabs.query({url: "*://www.wikipedia.org/*"}, function(tabs) {
      if (tabs.length === 0) {
        chrome.tabs.create({ url: "https://www.wikipedia.org/" });
      }
    });
    console.log("Simulated predictive tab opening: suggested news and Wikipedia.");
  } else {
    console.log("No predictive tabs suggested based on current simulated context.");
  }
}

// --- Context Switching ---
async function saveContext(contextName) {
  return new Promise(resolve => {
    chrome.windows.getCurrent({ populate: true }, function(currentWindow) {
      const tabs = currentWindow.tabs.map(tab => ({
        url: tab.url,
        pinned: tab.pinned,
        active: tab.active,
        title: tab.title
      }));
      chrome.storage.local.set({["context_" + contextName]: { tabs: tabs, windowId: currentWindow.id }}, function() {
        console.log(`Context \'${contextName}\' saved.`);
        resolve();
      });
    });
  });
}

async function restoreContext(contextName) {
  return new Promise(resolve => {
    chrome.storage.local.get(["context_" + contextName], async function(result) {
      const savedContext = result["context_" + contextName];
      if (savedContext) {
        chrome.windows.create({ focused: true }, function(newWindow) {
          savedContext.tabs.forEach((tabData, index) => {
            if (tabData.url && (tabData.url.startsWith("http") || tabData.url.startsWith("https"))) {
              chrome.tabs.create({
                windowId: newWindow.id,
                url: tabData.url,
                pinned: tabData.pinned,
                active: tabData.active,
                index: index
              });
            } else {
              console.warn(`Skipping invalid or non-HTTP/HTTPS URL: ${tabData.url}`);
            }
          });
          console.log(`Context \'${contextName}\' restored in a new window.`);
          resolve();
        });
      } else {
        console.log(`No context found for \'${contextName}\'.`);
        resolve();
      }
    });
  });
}

// --- Intelligent Tab Suspension/Hibernation ---
async function intelligentlySuspendTabs() {
  console.log("Intelligently suspending inactive tabs...");
  chrome.storage.sync.get(["suspensionTime"], function(result) {
    const suspensionTimeMinutes = result.suspensionTime || 30; // Default to 30 minutes
    const threshold = Date.now() - (suspensionTimeMinutes * 60 * 1000);

    chrome.tabs.query({}, function(tabs) {
      tabs.forEach(function(tab) {
        // Only discard if not pinned, not active, not audible, and last accessed before threshold
        // Also, ensure it's a valid HTTP/HTTPS tab and not a special Chrome page
        const isSpecialChromePage = tab.url.startsWith("chrome://") || tab.url.startsWith("chrome-extension://");
        if (!tab.pinned && !tab.active && !tab.audible && !isSpecialChromePage && tab.url.startsWith("http") && tab.lastAccessed < threshold) {
          chrome.tabs.discard(tab.id, function() {
            if (chrome.runtime.lastError) {
              console.error("Error discarding tab:", chrome.runtime.lastError.message);
            } else {
              console.log(`Tab \'${tab.title}\' (ID: ${tab.id}) suspended.`);
            }
          });
        }
      });
    });
  });
}

// --- Event Listeners ---
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "manageTabs") {
    intelligentlySuspendTabs();
    sendResponse({status: "Tab suspension initiated."});
  } else if (request.action === "saveContext") {
    saveContext(request.contextName).then(() => sendResponse({status: `Context \'${request.contextName}\' saved.`}));
    return true;
  } else if (request.action === "restoreContext") {
    restoreContext(request.contextName).then(() => sendResponse({status: `Context \'${request.contextName}\' restored.`}));
    return true;
  } else if (request.action === "predictiveTabOpening") {
    predictiveTabOpening();
    sendResponse({status: "Predictive tab opening initiated."});
  }
  else if (request.action.startsWith("connect")) {
    console.log(`Simulating connection to ${request.action.replace("connect", "")}...`);
    sendResponse({status: "Simulated connection initiated."});
  }
});

chrome.runtime.onStartup.addListener(function() {
  console.log("Extension started. Running predictive tab opening...");
  predictiveTabOpening();
});

setInterval(intelligentlySuspendTabs, 5 * 60 * 1000);


