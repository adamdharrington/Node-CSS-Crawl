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
var log;


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
  var firstRead = spawn(phantomjs, ["--web-security=false", initial, url, pages]),
    stdout = "", d = new Date();
  firstRead.stdout.on("data", function(data){
    stdout+=data;
  });
  firstRead.stderr.on("data", function(data){
    log("Error", "Error collecting pages from "+ url+"\r\n"+data);
    state.callbackPhantom();
  });
  firstRead.stdout.on("end", function() {
    try {
      var links = JSON.parse(stdout);
      createPageQueue(links, state);
    } catch(err) {
      log("error", "error parsing: \t" + url +" \t"+stdout+"\r\n"+err);
      state.callbackPhantom();
    }
  });
  setTimeout(function () {
    //log("log", "Timeout site "+url+"after "+(new Date() - d)/1000 +" seconds");
    firstRead.kill();
  }, 200000);
}
function createPageQueue(links, state){
  var pageQueue = async.queue(function(link, callback){
    if (link)
      processPage(link, state, callback);
  }, 2);
  pageQueue.drain = function(){
    end(state);
  };
  if(links["errors"] && links.errors.length) log("error", "accessing sub pages on "+ links.info.url +"\r\n"+JSON.stringify(links.errors));
  if (links.hasOwnProperty("subpages") && links.subpages){
    log("log", "Acquired "+ links.subpages.length +" pages for site " + state.siteTracker["host name"] +"\r\n"+links.subpages.join(",\r\n"));
    pageQueue.push(links.subpages);
  }
  else {
    log("log", "No pages to check on site "+ state.siteTracker["host name"]);
    state.siteTracker["error"]  =  "No pages to check";
    end(state);
  }
}



function processPage(link, state, callback){
  var s = spawn(phantomjs, ["--web-security=false",evaluateCSS, link]),
      filename = write.pageFilename(link),
      file = new write.StreamJSON(filename),
      t = new Date();

  s.stdout.on('data', function(data){
    file.write(data);
  });
  s.stderr.on('data',function(data){
    log('Error', 'Error reading page results for '+link+'\r\n'+data);
  });
  s.stdout.on('end', function(){
    try{
      log("log", "wrote "+ filename +" for site " + state.siteTracker["host name"]);
      addPage('../'+filename, state, callback);
    } catch(err) {
      log("error", "site :\t"+ state.siteTracker["host name"]+"\r\nerror parsing: \t" + link +"\r\n"+err+"\r\n");
    }
//    s.kill();
//    file.end();
  });
  setTimeout(function () {
    //log("Log", "Timeout page "+link+"after "+(new Date() - t)/1000 +" seconds");
    s.kill();
  }, 60000);
}



function addPage(file, state, callback){
  try {
    var page = require(file);
    delete(page.document);
    state.siteTracker["page count"] +=1; // TODO: add smaller increments here
    state.siteTracker["pages"].push(page);
  } catch (err){
    log("error", "site:\t"+ state.siteTracker["host name"]+err)
  }
  callback();
}

function end (state){
  var report = require("./site-report.js");
  log("log", "Completed evaluation of "+state.siteTracker["host name"]+"\r\n\t---");
  report.site(state.siteTracker, state.callbackReport);
  state.callbackPhantom();
}

exports.process      = function(site, pages, queue, l, callback){
  log = l;
  pageDepth = pages;
  return start(site, pageDepth, queue, callback);
};

//exports.processPages = function(urls){return processLinks(urls);};