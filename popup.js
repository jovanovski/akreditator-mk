'use strict';

function renderPopup(registerInformation){
  chrome.tabs.query({active: true, lastFocusedWindow: true}, tabs => {
    var url = tabs[0].url,
        hostname = ((new URL(url)).hostname).replace(/^www./g, ""),
        foundSite = false;

    document.getElementById("logo").innerText= registerInformation.extensionName;
    document.getElementById("contactLink").href = registerInformation.extensionURL;
    document.getElementById('siteName').innerText = hostname;
    document.getElementById('registerList').innerHTML = "";

    registerInformation["registers"].forEach(register => {
      if(register["sites"].indexOf(hostname) > -1){
        //Not the best way to generate HTML, need to refactor this
        document.getElementById('registerList').innerHTML+= "<div class='register'><div class='registerTitle'><a target='_blank' href='"+register["link"].toString()+"'>"+register["name"]+"</a></div><div class='registerDescription'>"+register["description"].toString()+"</div><div class='links'><ul><li><a target='_blank' href='"+register["link"].toString()+"'>Посети сајт</a></li><li><a target='_blank' href='"+register["abuseLink"].toString()+"'>Пријави непочитување</a></li></ul></div></div>";
        foundSite = true;
      }
    });
  
    if(foundSite){
      document.getElementById('descriptionGood').style.display = 'block';
      document.body.classList.add("goodBg");
    }
    else{
      document.getElementById('descriptionUnknown').style.display = 'block';
      document.body.classList.add("unknownBg");
    }
  });
}

//Request register information from background.js that has already downloaded it during startip
chrome.runtime.sendMessage({message: "getRegisterInformation"}, function(response) {
  console.log("EVE");
  console.log(response.registerInformation);
  renderPopup(response.registerInformation);
});