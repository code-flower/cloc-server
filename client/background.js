// The background script for the chrome extension.
// Has no effect when the app is run as a regular web app.

// instead of this script, it might be better to use just this:
// chrome.browserAction.onClicked.addListener(function() {
//   window.open('index.html', '_blank');
// });

/////// UNIQUE TAB SCRIPT ////////

// if true, browser will prevent multiple instances of the extension
// from opening in different tabs.  The only time this doesn't work is
// when the url of a tab containing the extension is changed.  The onUpdated
// event does not seem to fire consistently in that scenario, so we
// can't tell whether to allow a new tab to be created.
var REQUIRE_UNIQUE = true;

// holds the Tab object containing the extension
var theTab;

// open the extension in a new tab
function openTab() {
  chrome.tabs.create({url: 'index.html'}, function(tab) {
    theTab = tab;
  });
}

// fired when user clicks the extension button
chrome.browserAction.onClicked.addListener(function() {
  if (!REQUIRE_UNIQUE) 
    openTab();

  else {
    if (!theTab) 
      openTab();
    else 
      chrome.tabs.get(theTab.id, function(tab) {
        if (tab) 
          chrome.windows.update(tab.windowId, {focused: true}, function() {
            chrome.tabs.highlight({tabs: tab.index});
          });
        else 
          openTab();
      }); 

    // listen for tab removal
    chrome.tabs.onRemoved.addListener(function(tabId) {
      if (theTab && theTab.id === tabId) 
        theTab = undefined;
    });

    // listen for tab update
    // NOTE: this doesn't fire consistently when you change
    // the url of an existing tab
    // chrome.tabs.onUpdated.addListener(function(tabId, changeInfo) {
    //   if (theTab && theTab.id === tabId) 
    //     theTab = undefined;
    // });
  }
});
