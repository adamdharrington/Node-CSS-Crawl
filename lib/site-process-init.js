// TODO: Site process pages from initial style manifest object

var webPage    = require('webpage') || null;
var page       = webPage.create() || null;
var system     = require('system') || null;
var args       = system.args || null;
var url        = args[1] || null;
var linkCount  = args[2] || 10;

if(page){
  page.customHeaders = { 'Connection': 'close' };
  page.open(url, function(){
    end(eval());
    page.close();
  });
}

function end(response){
  var result = {
    "info"      : response ["info"],
    "host name" : response.info.origin,
    "subpages"  : new Array()
  };
  var l = cleanUrls(response.subpages);
  result["subpages"]   = l.filter(function(item){
    // Feature: Allow only unique non-empty results up to sub page limit
    return (item !== null && item !== "" && item !== response.info.origin+"/" && result["subpages"].indexOf(item) < 0);
  }).slice(0,linkCount - 1);
  // Feature: ensure at the least the root url is included.
  result["subpages"].push(response.info.origin);
  // Console.log acts as STDOUT and is read by calling NODE script
  console.log(JSON.stringify(result));
  phantom.exit();
}
function cleanUrls(list){
  var query = new RegExp("^(.*)([#\\?]{1}.*)$");
  return list.map(function(url){
    var a = query.exec(url);
    if (a) return a[1];
    else return url;
  });
}
function eval() {
  return page.evaluate(function() {
    var info = {
      path  : window.location.pathname,
      host  : window.location.hostname,
      origin: window.location.origin
      },
      subpages = Array.prototype.slice.call
        (document.querySelectorAll('a[href]'))
        .map(function(item) {
          var h = item.href,
              o = new RegExp(window.location.origin);
          if (h.substr(0,1) == "/")
            return "" + window.location.origin + h;
          else if (o.test(h) && h !== window.location.origin+"/")
              return h;
          else
            return null;
        }
      );
   return{
     "host name" : "",
     "info"      : info,
     "subpages"  : subpages
   }
  });
}