// TODO: Manage Site
var fs               = require('fs');
var shell            = require('child_process').execFile;
var phantomjs        = require('phantomjs').path;
var async            = require('async');
var writePage        = require('./file-io.js').pageJSON;
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

function start(site, pageDepth,siteComplete, callback){
  log("\n calling site: " + JSON.stringify(site));
  tracker["host name"] = site["host name"];
  tracker["page rank"] = site["page rank"];
  c = callback;
  readFirstPage("http://"+site["host name"],siteComplete, pageDepth);
}

function readFirstPage(url,siteComplete, pages){
  shell(phantomjs, [initial, url, pages], function(err, stdout, stderr) {
    if (err) throw err;
    if (stderr) throw stderr;
    try {
      var links = JSON.parse(stdout);
      createPageQueue(links, siteComplete);
    } catch(err) {
      log("error parsing: " + url +" "+stdout);
      error(err);
      siteComplete();
    }
  });
}
function createPageQueue(links, queueCallback){
  log(links.subpages);
  var pageQueue = async.queue(function(link, callback){
    processPage(link, callback);
  }, 2);
  //console.log("\nsample: ",typeof obj,"\n", JSON.stringify(obj));
  pageQueue.drain = function(){
    queueCallback();
  };
  if (links.hasOwnProperty("subpages")){
    pageQueue.push(links.subpages);
  }
  else {
    tracker["error"]  =  "No pages to check";
    end(tracker, queueCallback);
  }

}
function processPage(link, callback){
  shell(phantomjs, [evaluateCSS, link], function(err, stdout, stderr) {
    if (err) throw err;
    if (stderr) throw stderr;
    try {
      var data = JSON.parse(stdout);
      log("got page data: "+link);
      addPage(data, callback);
    } catch(err) {
      log("error parsing: " + link +" "+stdout);
      error(err);
      callback();
    }
  });
}


function addPage(pageData, callback){
  tracker["page count"] +=1;
  tracker["pages"].push(pageData);
  writePage(tracker["host name"], pageData, log, callback);
}

function end (siteObj, callback){
  var report = require("./site-report.js");
  report.site(siteObj, callback);
}

function error(err){
  // TODO: send to log
}
function log(message) {
  process.stdout.write(message + '\n');
}

exports.process      = function(site, pages, phantomEnd, callback){
  pageDepth = pages;
  return start(site, pageDepth, phantomEnd, callback);
};

//exports.processPages = function(urls){return processLinks(urls);};