// TODO: Manage Site
var fs               = require('fs');
var shell            = require('child_process').execFile;
var spawn            = require('child_process').spawn;
var phantomjs        = require('phantomjs').path;
var async            = require('async');
var write            = require('./file-io.js');
var pageDepth;
// require scripts
var initial          = __dirname + '\\site-process-init.js';
var evaluateCSS      = __dirname + '\\site-process-pages.js';


function start(site, pageDepth, siteComplete, callback){
  var siteTracker = {
    "host name" : site["host name"],
    "page rank" : site["page rank"],
    "page count": 0,
    "pages"     : []
  };
  readFirstPage("http://"+site["host name"],{siteTracker:siteTracker, callbackPhantom: siteComplete, callbackReport: callback}, pageDepth);
}

function readFirstPage(url, state, pages){
  shell(phantomjs, [initial, url, pages], function(err, stdout, stderr) {
    if (err) throw err;
    if (stderr) throw stderr;
    try {
      var links = JSON.parse(stdout);
      createPageQueue(links, state);
    } catch(err) {
      log("error parsing: " + url +" "+stdout);
      error(err);
      state.callbackPhantom();
    }
  });
}
function createPageQueue(links, state){
  var pageQueue = async.queue(function(link, callback){
    if (link)
      processPage(link, state, callback);
  }, 2);
  //console.log("\nsample: ",typeof obj,"\n", JSON.stringify(obj));
  pageQueue.drain = function(){
    end(state);
  };
  if (links.hasOwnProperty("subpages")){
    pageQueue.push(links.subpages);
  }
  else {
    state.siteTracker["error"]  =  "No pages to check";
    end(state);
  }

}



function processPage(link, state, callback){
  var s = spawn(phantomjs, ["--web-security=false",evaluateCSS, link]);
  var filename = write.pageFilename(link);
  var file = new write.StreamJSON(filename);

  s.stdout.on('data', function(data){
    file.write(data);
  });
  s.stdout.on('end', function(){
    try{
      addPage('../'+file.path, state, callback);
    } catch(err) {
      log("error parsing: " + link +" "+err+"\n");
      error(err);
    }
    file.end();
  });
}



function addPage(file, state, callback){
  var page = require(file);
  delete(page.document);
  state.siteTracker["page count"] +=1;
  state.siteTracker["pages"].push(page);
  callback();
}

function end (state){
  var report = require("./site-report.js");
  report.site(state.siteTracker, state.callbackReport);
  state.callbackPhantom();
}

function error(err){
  // TODO: send to log
}
function log(message) {
  process.stdout.write(message + '\n');
}

exports.process      = function(site, pages, queue, callback){
  pageDepth = pages;
  return start(site, pageDepth, queue, callback);
};

//exports.processPages = function(urls){return processLinks(urls);};
