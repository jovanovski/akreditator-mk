'use strict';

var registerInformation;

//Generic JSON function
function loadJSON(url, errorCallback)
{
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function()
    {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
              registerInformation = JSON.parse(xhr.responseText);
            } else if (errorCallback) {
              errorCallback(xhr);
            }
        }
    };
    xhr.open("GET", url, true);
    xhr.send();
}

function fetchData(){
  loadJSON('https://gorjan.rocks/clients/akreditator/data/registers.css',
    function(xhr) { 
      console.error(xhr);
    }
  );
}

function runSiteCheck(){
  if(registerInformation === undefined){
    return;
  }

  chrome.tabs.query({active: true, lastFocusedWindow: true}, tabs => {
    var url = tabs[0].url,
        hostname,
        foundSite = false;

    try{
      //Try to extract the base domain and subdomain from the active tab's URL
      hostname = ((new URL(url)).hostname).replace(/^www./g, "");
    }
    catch(e){
      //This can sometimes happen when parsing internal browser page URLs which we know anyway won't belong in the register
      chrome.browserAction.setIcon({path:"/images/unknown.png"});
      return;
    }


    registerInformation["registers"].forEach(register => {
      if(register["sites"].indexOf(hostname) > -1){
        foundSite = true;
      }
    });

    if(foundSite){
      chrome.browserAction.setIcon({path:"/images/allOK.png"});
    }
    else{
      chrome.browserAction.setIcon({path:"/images/unknown.png"});
    }

  });
}

//Run when tab becomes active (tab switching)
chrome.tabs.onActivated.addListener(function(activeInfo) {
  runSiteCheck();
});

//Run when active tab changes URL
chrome.tabs.onUpdated.addListener( function (tabId, changeInfo, tab) {
  if ((changeInfo.status == 'loading' || changeInfo.status == 'complete') && tab.active) {
    runSiteCheck();
  }
})

//Add listener so registerInformation can be passed to 
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.message == "getRegisterInformation"){
      sendResponse({registerInformation: registerInformation});
    }
});

//Run on browser startup to refresh downloaded register information (this will run only once per browser startup)
fetchData();
