// TODO: If external CSS, pass in CSS, process and report.
var webPage    = require('webpage');
var page       = webPage.create();
var system     = require('system');
var args       = system.args || null;
var url        = args[1] || null;
var externalCSS=[];

page.onResourceReceived = function(response) {
  if ((/http:\/\/.+?\.css$/gi).test(response['url']) && !(new RegExp(url)).test(response['url']))
    externalCSS.push(response['url']);
};

page.open(url, function(status){
  var r = [];
  if (status === "success"){
    page.injectJs('./lib/injection/microajax.min.js', function(err){
    //page.injectJs('./lib/injection/processCSS.js', function(err){
    r = page.evaluate(function(){
      return window.document.title;
      /*return Array.prototype.map.call(window.document.styleSheets, function(t,i){
        var rs;
        if(t.hasOwnProperty("cssRules") && t.cssRules !== null) rs=Array.prototype.map.call(t.cssRules, function(r){
          if (r) return {
            selector: r.selectorText || "",
            styles: r.style ? r.style.length : 0
          };
          return null;
        });
        else rs = [];

        return {
          index       : i,
          "rule count": rs.length,
          rules       : rs,
          href        : t.href
        };
      });*/
    //});
    });});
  }
  // Console.log acts as STDOUT and is read by calling NODE script
  //console.log(JSON.stringify({page : url, title : r.length, cssSheets : r, externalSheets: externalCSS}));
  console.log(JSON.stringify({page : url, title : r}));
  phantom.exit();
});