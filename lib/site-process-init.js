// TODO: Site process pages from initial style manifest object

var webPage    = require('webpage') || null;
var page       = webPage.create() || null;
var system     = require('system') || null;
var args       = system.args || null;
var url        = args[1] || null;
var linkCount  = args[2] || 10;
var errors     = [];

if(page){
  page.onError = function(msg, trace) {
    errors.push({message: msg, trace: trace});
  };
  page.onResourceRequested = function(requestData, networkRequest) {
    // FEATURE: Avoid scripts that cause known conflicts
    if(requestData.url.indexOf("prototype") !== -1
      || requestData.url.indexOf("fbstatic-a.akamaihd.net" ) !== -1
      || requestData.url.indexOf("googleusercontent.com" ) !== -1
      || requestData.url.indexOf( "gstatic.com" ) != -1
      // || requestData.url.indexOf( "" ) != -1
      ){
      networkRequest.abort();
    }
  };
  page.settings.userAgent = 'Mozilla/5.0 (X11; Linux x86_64)' +
    ' AppleWebKit/537.36 (KHTML, like Gecko) ' +
    'Chrome/28.0.1500.71 Safari/537.36';
  page.viewportSize = { width: 1920, height: 800 };
  page.customHeaders = { 'Connection': 'close' };
  page.open(url, function(){
    end(evaluate());
  });
}

function end(response){
  page.close();
  var result = {
    "info"      : response["info"],
    "host name" : response.info.origin,
    "subpages"  : new Array(),
    "errors"    : errors
  };
  var l = cleanUrls(response.subpages);
  result["subpages"]   = l.filter(function(item){
    // Feature: Allow only unique non-empty results up to sub page limit
    return (item !== null && item !== "" && item !== response.info.origin+"/" && result["subpages"].indexOf(item) < 0);
  }).slice(0,linkCount - 1);
  // Feature: ensure at the least the root url is included.
  result["subpages"].push(response.info.origin);
  // Console.log acts as STDOUT and is read by calling NODE script
  result["errors"] = errors;
  console.log(JSON.stringify(result));
  phantom.exit();
}
function cleanUrls(list){
  if (list){
    return list.map(function(url){
      return url.split("?")[0].split("#")[0];
    });
  }
  else return [];
}
function evaluate() {
  return page.evaluate(function() {
    var info = {
        url  : window.location.href,
        host  : window.location.hostname,
        origin: window.location.origin
      },
      subpages;
    if (document.styleSheets.length >0){
        var origin = /(https*:\/\/)(www.){0,1}([\w\W]*)/.exec(window.location.origin),
        o = new RegExp("https*:\/\/(www.){0,1}"+origin[3]);
      subpages = Array.prototype.slice.call
        (document.querySelectorAll('a[href]'))
        .map(function(item) {
          var h = item.href;
          if (h[0] == "/")
            return "" + window.location.origin + h;
          else if (h[0] !== "/" && h.substr(0,4) !== "http")
            return "" + info.url + h;
          else if (o.test(h) && h !== window.location.origin +"/")
              return h;
          else
            return null;
        }
      );
    }
   return{
     "info"      : info,
     "subpages"  : subpages
   }
  });
}