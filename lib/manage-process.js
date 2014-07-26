// TODO: Manage Process
var fs               = require('fs');
var async            = require('async');
var list             = require('./get-sources-list.js');
var manageSite       = require('./manage-site.js');
var options;
var resultObj        = {};
var p;


var start = function(){
    list.formatLists(options, createSampleQueue);
};

var progression = function(messageBack, end){
  var mb = messageBack,
      e = end,
      _progress  = 0,
      _increment, _total;
  this.setTasks = (function(opts){
    _total     = opts.samples*opts.sampleSize;
    _increment = 100 / _total;
  })(options);
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
    manageSite.process(site, options.pageDepth, callback, siteResults);
  }, 2);
  //console.log("\nsample: ",typeof obj,"\n", JSON.stringify(obj));

  var samples = obj["sampling info"]["sample count"];
  for (var i = 0; i<samples;i++){
    sampleQueue.push(obj.samples["sample"+(i+1)]);
  }
}




//// Queue Function to initiate and manage crawling over each sample group
//function createSampleQueue(err, obj){
//  if(err) throw err;
//  var sampleQueue = async.queue(function(site){
//    createSiteQueue(site);
//  }, 1);
//  //console.log("\nsample: ",typeof obj,"\n", JSON.stringify(obj));
//
//  var samples = obj["sampling info"]["sample count"];
//  for (var i = 0; i<samples;i++){
//    sampleQueue.push(obj.samples["sample"+(i+1)]);
//  }
//}

// Queue Function to initiate and manage crawling sites inside each sample group
//function createSiteQueue(sample){
//  var siteQueue = async.queue(function(site, pages, callback){
//    manageSite.process(site, pages, callback);
//  }, 1);
//  var sites = sample.length;
//  console.log(sample.length);
//  for (var i = 0; i<sites;i++){
//    //console.log("\nsite: ",typeof sample[i],"\n", JSON.stringify(sample[i]));
//    siteQueue.push(sample[i], options.pageDepth, siteResults);
//  }
//}


//
//function crawlProcess(sample){
//  sample.forEach(function(site){
//    manageSite.process(site, options.pageDepth, siteResults);
//  });
//}
//function crawlResults(){
//
//}

function siteResults(result){
  p.increment();
  resultObj[result["host name"]] = result;
  p.isComplete();
}
function writeCrawlResults(){

}

exports.start = function(opts, progress, callback){
  options = opts;
  p = new progression(progress, callback);
  return start();
};
exports.crawl = function(){ return start();};