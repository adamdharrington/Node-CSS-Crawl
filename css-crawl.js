#!/usr/bin/env node
// TODO: CLI script, control everything


var args             = process.argv.slice(2);

var defaults         = require('./lib/defaults.js');
var crawl            = require('./lib/manage-process.js');
var progress         = 0;
//var pace             = require('pace')(total);
var data;
GLOBAL.Opts          = defaults.load(args);

setUp();
function setUp(){
  log("\n=============================================\n\t\tCSS Crawl\n");
	log("Crawling from: \t"+Opts.list);
  log("Examining:\t" + Opts.samples + " " + Opts.sampleMethod +
      " samples of "+Opts.pageDepth+" pages from "+Opts.sampleSize+" websites ");
}

function log(message) {
  if (!Opts.test)
	  process.stdout.write(message + '\n');
}

function error(err) {
	process.stderr.write(err);
}