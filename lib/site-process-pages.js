// TODO: If external CSS, pass in CSS, process and report.
var webPage    = require('webpage') || null;
var page       = webPage.create() || null;
var system     = require('system') || null;
var args       = system.args || null;
var url        = args[1] || null;
var errors     = [];
//var write      = require('./file-io.js').phantomPage;


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
  page.open(url, function(status){
    if (status == 'success') {
      var result;
      injectScripts();
      setTimeout(function(){
        setTimeout(function(){
          result = evaluate();
          convert(result, end);
        },2000);
      },1);
    }
  });
}

function injectScripts(){
  page.injectJs('./lib/injection/inject.min.js');
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
    "url": obj.url,
    "selectors": obj.selectors || [],
    "used selectors" : obj["used selectors"] || [],
    "frameworks" : obj.frameworks || {},
    "summary": obj.summary || {},
    "errors" : obj.errors || []
  });
}

function end(response){
  var r = response;
  if (response.errors)
    r["errors"] = r.errors.concat(errors);
  else r["errors"] = errors;
  // Console.log acts as STDOUT and is read by calling NODE script
  console.log(JSON.stringify(r));
  phantom.exit();
}