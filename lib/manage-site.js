// TODO: Manage Site
var fs               = require('fs');
var shell            = require('child_process').execFile;
var phantomjs        = require('phantomjs').path;
var pageDepth;
// require scripts
var initial          = __dirname + '\\site-process-init.js';
var evaluateCSS      = __dirname + '\\site-process-pages.js';
var tracker          = {
                        "host name" : "",
                        "page rank" : 0,
                        "page count": 0,
                        "site stats": "todo",
                        "frameworks": "todo",
                        "pages"     : []
                      };
var c;

function manageProcess(site, pageDepth, callback){

  tracker["host name"] = site["host name"];
  tracker["page rank"] = site["page rank"];
  c = callback;
  readFirstPage("http://"+site["host name"], pageDepth);
}

function readFirstPage(url, pages){
  pageDepth = pages;
  shell(phantomjs, [initial, url, pages], function(err, stdout, stderr) {
    if (err) throw err;
    if (stderr) throw stderr;
    try {
      var links = JSON.parse(stdout);
    } catch(err) {
      log("error parsing: " + url +" "+stdout);
      error(err);
    }
    log(JSON.stringify(links));
    processPages(links);
  });
}

function processPages(links){
  // TODO: start loop
  if (links.subpages && links.subpages.length == pageDepth)
  links.subpages.forEach(function(u){
    shell(phantomjs, [evaluateCSS, u], function(err, stdout, stderr) {
      if (err) throw err;
      if (stderr) throw stderr;
      try {
        var data = JSON.parse(stdout);
      } catch(err) {
        log("error parsing: " + u +" "+stdout);
        error(err);
      }
      log(JSON.stringify(data));
      addPage(data);
    });
  });
}


function addPage(pageData){
  tracker["page count"] +=1;
  tracker["pages"].push(pageData);
  end();
}

function end (){
  if (tracker["page count"] == Opts.pageDepth){
    var report = require("./site-report.js");
    report.site(tracker, c);
  }
}

function error(err){
  // TODO: send to log
}
function log(message) {
  process.stdout.write(message + '\n');
}

exports.process      = function(site, pageDepth, callback){
  return manageProcess(site, pageDepth, callback);
};
exports.processPages = function(urls){return processLinks(urls);};