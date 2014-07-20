#!/usr/bin/env node
// TODO: CLI script, control everything


var args             = process.argv.slice(2);

var defaults         = require('./lib/defaults.js');
var crawl 			 = require('./lib/manage-process.js').readGlobal;
var progress         = 0;
//var pace             = require('pace')(total);
var data;
GLOBAL.Opts          = defaults.load(args);

setUp();
function setUp(){
	log("Loading Node CSS Crawl...");
	//defaults.load(args);
	log(Opts.hi);
	log(crawl());
}

function log(message) {
	process.stdout.write(message + '\n');
}

function error(err) {
	process.stderr.write(err);
}