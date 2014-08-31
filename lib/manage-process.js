// TODO: Manage Process
var fs               = require('fs');
var async            = require('async');
var list             = require('./get-sources-list.js');
var write            = require('./file-io.js');
var manageSite       = require('./manage-site.js');
var options;
var resultObj        = {"sites crawled":[], "sample size": 0};
var p, w, _log;


var start = function(){
  log("log", "beginning crawl");
  list.readList(options, createSampleQueue);
};

var progression = function(progress, messageBack, end){
  var mb = messageBack,
      e = end,
      _progress  = 0,
      _increment, _total;
  this.setTasks = function(opts){
    _total     = opts.samples*opts.sampleSize;
    _increment = 100 / _total;
    resultObj["sample size"] = _total;
  };
  this.getTasks = function(){
    return "Completed "+_progress+" of "+_total;
  };
  this.increment = function(){
    _progress += _increment;
    progress(_progress);
  };
  this.isComplete = function(){
    _progress = 100;
    progress(_progress);
    log("error", "fired complete early");
    e(resultObj, mb);
  };
};

// Queue Function to initiate and manage crawling over each sample group
function createSampleQueue(err, obj){
  if(err) throw err;
  var sampleQueue = async.queue(function(site, callback){
    manageSite.process(site, options.pageDepth, callback, log, siteResults);
  }, 2);
  //console.log("\nsample: ",typeof obj,"\n", JSON.stringify(obj));
  sampleQueue.drain = function() {
    writeCrawlResults();
  };
  var samples = obj["sampling info"]["sample count"];
  for (var i = 0; i<samples;i++){
    sampleQueue.push(obj.samples["sample"+(i+1)]);
  }
}

function siteResults(result){
  var c = function(){
    p.increment();
  };
  resultObj["sites crawled"] = result["host name"];
  w.addLine(result, c)
}


function writeCrawlResults(){
  p.isComplete();
}

function log(type, message, callback) {
  var c = callback || null;
  if (_log) _log.write(type, message, c);
  else {
    _log = new write.Log(function(){
       _log.write(type,message, c);
    });
  }
}


exports.start = function(opts, progress, log, callback){
  options = opts;
  p = new progression(progress, log, callback);
  p.setTasks(options);
  write.setup(function(){
    w = new write.SiteCSV(options);
  });
  return start();
};
exports.endReport = function(){ return writeCrawlResults();};