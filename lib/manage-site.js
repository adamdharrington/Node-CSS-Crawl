// TODO: Manage Site
var fs               = require('fs');
var shell            = require('child_process').execFile;
var spawn            = require('child_process').spawn;
var phantomjs        = require('phantomjs').path;
var async            = require('async');
var write            = require('./file-io.js');
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

function start(site, pageDepth, siteComplete, callback){
  log("\n calling site: " + JSON.stringify(site));
  tracker["host name"] = site["host name"];
  tracker["page rank"] = site["page rank"];
  c = callback;
  readFirstPage("http://"+site["host name"],siteComplete, pageDepth);
}

function readFirstPage(url, siteComplete, pages){
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
    if (link)
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
  var s = spawn(phantomjs, ["--web-security=false",evaluateCSS, link]);
  var filename = write.pageFilename(link);
  var file = new write.StreamJSON(filename);

  s.stdout.on('data', function(data){
    file.write(data);
  });
  s.stdout.on('end', function(){
    log("write complete to "+ filename);
    try{
      addPage("../"+filename, callback);
    } catch(err) {
      log("error parsing: " + link +" "+err+"\n");
      error(err);
      callback();
    }
    file.end();
  });
}



function addPage(file, callback){
  var url = require(file).url,
    dom = require(file).document,
    summary = require(file).summary;
  log(url);
  tracker["page count"] +=1;
  tracker["pages"].push({url:url,stats:{dom:dom,summary:summary}});
  callback();
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