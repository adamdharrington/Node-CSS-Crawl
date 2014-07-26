// TODO: Manage Site
var fs               = require('fs');
var shell            = require('child_process').execFile;
var phantomjs        = require('phantomjs').path;
var async            = require('async');
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

function manageProcess(site, pageDepth,siteComplete, callback){
  //log("\n called site: " + JSON.stringify(site));
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
      //log("error parsing: " + url +" "+stdout);
      error(err);
      siteComplete();
    }
  });
}
function createPageQueue(links, queueCallback){
  var pageQueue = async.queue(function(link, callback){
    processPage(link, callback);
  }, 2);
  //console.log("\nsample: ",typeof obj,"\n", JSON.stringify(obj));
  pageQueue.drain = function(){
    queueCallback();
  };
  pageQueue.push(links);
}
function processPage(link, callback){
  if (typeof link === 'object'
      && link.hasOwnProperty("subpages")
      && link.subpages.length === pageDepth){
    link.subpages.forEach(function(u){
      shell(phantomjs, [evaluateCSS, u], function(err, stdout, stderr) {
        if (err) throw err;
        if (stderr) throw stderr;
        try {
          var data = JSON.parse(stdout);
          addPage(data);
          callback();
        } catch(err) {
          //log("error parsing: " + u +" "+stdout);
          error(err);
          callback();
        }
      });
    });
  }
  else {
    tracker["error"]  =  "No pages to check";
    end();
    callback();
  }
}


function addPage(pageData){
  tracker["page count"] +=1;
  tracker["pages"].push(pageData);
  end();
}

function end (){
  if (tracker["page count"] == pageDepth){
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

exports.process      = function(site, pages, phantonEnd, callback){
  pageDepth = pages;
  return manageProcess(site, pageDepth,phantonEnd, callback);
};

//exports.processPages = function(urls){return processLinks(urls);};