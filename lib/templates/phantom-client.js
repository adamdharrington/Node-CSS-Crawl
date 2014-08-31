// FEATURE: Phantom client to inject scripts and return template data
// Todo: accept a url, load page and evaluate response
// Todo: extract selectors only from response
// Todo: Return selectors array to STDOUT


var webPage    = require('webpage') || null;
var page       = webPage.create() || null;
var system     = require('system') || null;
var args       = system.args || null;
var template   = args[1] || null;
var url        = 'http://localhost:3000/fw/' + template;


if(page){
  page.onError = function(msg, trace) {
    errors.push({message: msg, trace: trace});
  };
  page.settings.userAgent = 'Mozilla/5.0 (X11; Linux x86_64)' +
    ' AppleWebKit/537.36 (KHTML, like Gecko) ' +
    'Chrome/28.0.1500.71 Safari/537.36';
  page.viewportSize = { width: 1920, height: 800 };
  page.open(url, function(status){
    if (status == 'success') {
      setTimeout(function(){
        setTimeout(function(){
          convert(evaluate(), end);
        },400);
      },1);
    }
  });
}


function evaluate (){
  var result = {};
  result = page.evaluate(function(){
    return window.__STYLES;
  });
  return result;
}
function convert(obj, callback){
  callback({
    "template"     : url,
    "all selectors": obj["all selectors"],
    "summary"      : obj.summary
  });
}

function end(response){
  var r = response;
  if (response.errors)
    r.errors = r.errors.concat(errors);
  // Console.log acts as STDOUT and is read by calling NODE script
  console.log(JSON.stringify(r));
  phantom.exit();
}