#!/usr/bin/env node
// TODO: CLI script, control everything


var args             = process.argv.slice(2);

var defaults         = require('./lib/defaults.js');
var crawl            = require('./lib/manage-process.js');
var pace             = require('pace')(100);
var data;
var options          = defaults.load(args);

setUp();
function setUp(){
  log("\n=============================================\n\t\tCSS Crawl\n");
	log("Crawling from: \t"+options.list);
  log("Examining:\t" + options.samples + " " + options.sampleMethod +
      " samples of "+options.pageDepth+" pages from "+options.sampleSize+" websites \n");
  pace.op(0);
  crawl.start(options, setProgress, end);
}
function setProgress(n){
  pace.op(n);
}
function end(message){

  log("\nEnded with: "+JSON.stringify(message));
}
function log(message) {
  if (!options.test)
	  process.stdout.write(message + '\n');
}

function error(err) {
	process.stderr.write(err);
}

// Test with: node css-crawl.js test/lib/sampledata.csv 1 1 Random 1