chrome.browserAction.onClicked.addListener(function() {
  window.open('index.html', '_blank');
  // console.log("browser action");
  // chrome.windows.getAll({populate: true}, function(windows) {
  //   console.log("windows = ", windows);
  //   window.open('index.html', '_blank');
  // });
  
});