// TODO: Manage Process
var fs               = require('fs');
var list             = require('./get-sources-list.js');
var manageSite       = require('./manage-site.js');
var resultObj;

var start = function(){
  if (Opts.list != "alexa")
    try {
      list.formatLists(Opts.list, createSamples)
    } catch(e){
      throw new Error("Invalid list of hosts"+e);
    }
  else
	  list.getlist(function(){list.formatLists("../data/sources/top-1m.csv", createSamples)});
};
function createSamples(obj){
  var samples = obj["sampling info"]["sample count"];
  for (var i = 0; i<samples;i++){
    crawlProcess(obj.samples["sample"+(i+1)]);
  }
}
function crawlProcess(sample){
  sample.forEach(function(host){
    manageSite.process(host, siteResults);
  });
}
function crawlResults(){

}
function siteResults(result){
  resultObj[result["host name"]] = result;
}
function writeCrawlResults(){

}

exports.start = function(){ return start();};