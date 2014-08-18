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

  result["subpages"]  = response.subpages.filter(function(item, index){
    // Feature: Allow only unique non-empty results up to sub page limit
    return (item !== null && item !== "" && item !== response.info.origin+"/" && response.subpages.indexOf(item) == index);
  }).slice(0,linkCount - 1);
  // Feature: ensure at the least the root url is included.
  result["subpages"].push(response.info.origin);
  // Console.log acts as STDOUT and is read by calling NODE script
  result["errors"] = errors;
  console.log(JSON.stringify(result));
  phantom.exit();
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
        o = new RegExp("https*:\/\/(www.){0,1}"+origin[3]),
        exts = /\.png|\.jpg|\.rss|\.xml|\.css|\.js|\.bmp|\.svg|\.doc|\.rtf|\.txt|\.mp3|\.wav|\.ogg|\.flv|\.avi|\.m4a|\.mp4|\.swf|\.gif|\.xls|\.db|\.exe|\.crx/;

      subpages = Array.prototype.slice.call
        (document.querySelectorAll('a[href]'))
        .map(function(item) {
          // FEATURE: remove query parameters, commas, anchors, bookmarklets, and known file extension conflicts
          var h = item.href.split(/[?#,]+/)[0].split(/javascript\:/)[0];
          if (exts.test(h)) return null;
          if (h[0] == "/")
            return "" + window.location.origin + h;
          else if (h[0] !== "/" && h.substr(0,4) !== "http" && !/:+/.test(h))
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