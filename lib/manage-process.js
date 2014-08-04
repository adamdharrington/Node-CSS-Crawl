// TODO: Manage Process
var fs               = require('fs');
var async            = require('async');
var list             = require('./get-sources-list.js');
var write            = require('./file-io.js');
var options;
var resultObj        = {};
var p,w;


var start = function(){
  list.formatLists(options, createSampleQueue);
};

var progression = function(messageBack, end){
  var mb = messageBack,
      e = end,
      _progress  = 0,
      _increment, _total;
  this.setTasks = function(opts){
    _total     = opts.samples*opts.sampleSize;
    _increment = 100 / _total;
  };
  this.getTasks = function(){
    return "Completed "+_progress+" of "+_total;
  };
  this.increment = function(){
    _progress += _increment;
    mb(_progress)
  };
  this.isComplete = function(){
    if (_progress == _total)
      e(resultObj);
  };
};

// Queue Function to initiate and manage crawling over each sample group
function createSampleQueue(err, obj){
  if(err) throw err;
  var sampleQueue = async.queue(function(site, callback){
    var manageSite = new require('./manage-site.js');
    manageSite.process(site, options.pageDepth, callback, siteResults);
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
  log(JSON.stringify(result));
  var c = function(){
    p.increment();
    p.isComplete();
  };
  resultObj[result["host name"]] = result;
  w.addLine(result, c)
}
function writeCrawlResults(){
  // TODO: write results to console, end application
  // TODO: ensure ALL processes are actually complete.
}

function log(message) {
  process.stdout.write(message + '\n');
}


exports.start = function(opts, progress, callback){
  options = opts;
  p = new progression(progress, callback);
  p.setTasks(options);
  w = new write.dataCSV(options);
  return start();
};
exports.endReport = function(){ return writeCrawlResults();};