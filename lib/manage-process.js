// TODO: Manage Process
var fs               = require('fs');
var list             = require('./get-sources-list.js');
var manageSite       = require('./manage-site.js');
var resultObj ={};

var terminate;

var start = function(callback){
  terminate = callback;
  if (Opts.list != "alexa")
    try {
      list.formatLists(Opts.list, createSamples)
    } catch(e){
      throw new Error("Invalid list of hosts"+e);
    }
  else
	  //list.getlist(function(){list.formatLists("../data/sources/top-1m.csv", createSamples)});
    list.formatLists("../test/lib/sampledata.csv", createSamples);
};
// Function to initiate crawling over each sample group
function createSamples(err, obj){
  if(err) throw err;
  var samples = obj["sampling info"]["sample count"];
  for (var i = 0; i<samples;i++){
    crawlProcess(obj.samples["sample"+(i+1)]);
  }
}
function crawlProcess(sample){
  sample.forEach(function(site){
    manageSite.process(site, Opts.pageDepth, siteResults);
  });
}
function crawlResults(){

}
function siteResults(result){
  resultObj[result["host name"]] = result;
  terminate(result);
}
function writeCrawlResults(){

}

exports.start = function(callback){ return start(callback);};
exports.crawl = function(){ return start();};