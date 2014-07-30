// TODO: If external CSS, pass in CSS, process and report.
var webPage    = require('webpage') || null;
var page       = webPage.create() || null;
var system     = require('system') || null;
var args       = system.args || null;
var url        = args[1] || null;


if(page){

  page.open(url, function(status){
    if (status == 'success') {
      var result;
      injectScripts();
      setTimeout(function(){
        setTimeout(function(){
          result = evaluate();
          end(result);
        },1000);
      },1);
    }
  });
}

function injectScripts(){
  page.injectJs('./lib/injection/inject.min.js');
}

function evaluate (){
  var result = "hello";
  console.log(result);
  result = page.evaluate(function(){
    return window.__STYLES;
  });
  console.log(result);
  return result;
}
function end(response){
  var r = response || {error:true};
  // Console.log acts as STDOUT and is read by calling NODE script
  console.log(JSON.stringify(r));
  phantom.exit();
}