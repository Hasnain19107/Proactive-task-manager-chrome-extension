document.addEventListener("DOMContentLoaded", function() {
  // Initialize UI
  updateTabStats();
  loadSavedContexts();

  // Quick Actions
  document.getElementById("manageTabs").addEventListener("click", function() {
    chrome.runtime.sendMessage({action: "manageTabs"}, function(response) {
      showNotification("Inactive tabs suspended");
      updateTabStats();
    });
  });

  document.getElementById("predictiveTabs").addEventListener("click", function() {
    chrome.runtime.sendMessage({action: "predictiveTabOpening"}, function(response) {
      showNotification("Predictive tabs suggested");
    });
  });

  // Context Management
  document.getElementById("saveContext").addEventListener("click", function() {
    const contextName = document.getElementById("contextName").value.trim();
    if (contextName) {
      chrome.runtime.sendMessage({action: "saveContext", contextName: contextName}, function(response) {
        showNotification(`Context \'${contextName}\' saved`);
        document.getElementById("contextName").value = "";
        loadSavedContexts();
      });
    } else {
      showNotification("Please enter a context name");
    }
  });

  document.getElementById("restoreContext").addEventListener("click", function() {
    const contextName = document.getElementById("contextName").value.trim();
    if (contextName) {
      chrome.runtime.sendMessage({action: "restoreContext", contextName: contextName}, function(response) {
        showNotification(`Context \'${contextName}\' restored in a new window`);
      });
    } else {
      showNotification("Please enter a context name");
    }
  });

  // Settings
  document.getElementById("openOptions").addEventListener("click", function() {
    chrome.runtime.openOptionsPage();
  });

  // Functions
  function updateTabStats() {
    chrome.tabs.query({}, function(tabs) {
      const openTabs = tabs.length;
      const suspendedTabs = tabs.filter(tab => tab.discarded).length;
      
      document.getElementById("openTabsCount").textContent = openTabs;
      document.getElementById("suspendedTabsCount").textContent = suspendedTabs;
    });
  }

  function loadSavedContexts() {
    chrome.storage.local.get(null, function(items) {
      const contextList = document.getElementById("contextList");
      contextList.innerHTML = "";
      
      const contexts = Object.keys(items).filter(key => key.startsWith("context_"));
      
      if (contexts.length === 0) {
        contextList.innerHTML = 
          `<div style="font-size: 11px; color: #999; text-align: center; padding: 8px;">
            No saved contexts
          </div>`;
        return;
      }
      
      contexts.forEach(contextKey => {
        const contextName = contextKey.replace("context_", "");
        const contextItem = document.createElement("div");
        contextItem.className = "context-item";
        contextItem.innerHTML = `
          <span>${contextName}</span>
          <button class="restore-btn" data-context-name="${contextName}">Restore</button>
        `;
        contextList.appendChild(contextItem);
      });

      // Attach event listeners to newly created restore buttons
      document.querySelectorAll(".restore-btn").forEach(button => {
        button.addEventListener("click", function() {
          const contextName = this.dataset.contextName;
          chrome.runtime.sendMessage({action: "restoreContext", contextName: contextName}, function(response) {
            showNotification(`Context \'${contextName}\' restored in a new window`);
          });
        });
      });
    });
  }

  function showNotification(message) {
    const notification = document.createElement("div");
    notification.style.cssText = `
      position: fixed;
      top: 10px;
      left: 50%;
      transform: translateX(-50%);
      background-color: #333;
      color: white;
      padding: 8px 16px;
      border-radius: 4px;
      font-size: 12px;
      z-index: 1000;
      opacity: 0;
      transition: opacity 0.3s;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => notification.style.opacity = "1", 10);
    
    setTimeout(() => {
      notification.style.opacity = "0";
      setTimeout(() => document.body.removeChild(notification), 300);
    }, 2000);
  }

  setInterval(updateTabStats, 5000);
});


