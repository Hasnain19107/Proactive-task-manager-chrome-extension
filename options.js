document.addEventListener('DOMContentLoaded', function() {
  // Load saved settings
  chrome.storage.sync.get({
    enableContextSwitching: true,
    suspensionTime: 30
  }, function(items) {
    document.getElementById('enableContextSwitching').checked = items.enableContextSwitching;
    document.getElementById('suspensionTime').value = items.suspensionTime;
  });

  // Save settings
  document.getElementById('saveSettings').addEventListener('click', function() {
    const enableContextSwitching = document.getElementById('enableContextSwitching').checked;
    const suspensionTime = parseInt(document.getElementById('suspensionTime').value);
    
    chrome.storage.sync.set({
      enableContextSwitching: enableContextSwitching,
      suspensionTime: suspensionTime
    }, function() {
      // Show save confirmation
      const button = document.getElementById('saveSettings');
      const originalText = button.textContent;
      button.textContent = 'Saved!';
      setTimeout(() => {
        button.textContent = originalText;
      }, 2000);
    });
  });

  // Integration buttons
  document.getElementById('connectCalendar').addEventListener('click', function() {
    chrome.runtime.sendMessage({action: 'connectCalendar'});
  });

  document.getElementById('connectAsana').addEventListener('click', function() {
    chrome.runtime.sendMessage({action: 'connectAsana'});
  });

  document.getElementById('connectTrello').addEventListener('click', function() {
    chrome.runtime.sendMessage({action: 'connectTrello'});
  });

  document.getElementById('connectSlack').addEventListener('click', function() {
    chrome.runtime.sendMessage({action: 'connectSlack'});
  });
});

