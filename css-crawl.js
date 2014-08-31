#!/usr/bin/env node
var fs         = require('fs');
var sources    = require('./lib/get-sources-list.js');
var io         = require('./lib/file-io.js');
var crawl      = require('./lib/manage-process.js');
var pace       = require('pace')(100);
var options    = {};



write('====================================================\n\t\tWelcome to CSS Crawl');
io.setup(function(){
  init();
});


function init(){
  var prompt = new require('prompt');
  prompt.start();
  write('Please choose one of the following options\n' +
    ' (1) Process new CSS templates\n' +
    ' (2) Get the Alexa Source list\n' +
    ' (3) Begin a crawl\n');
  var callback;
  prompt.get([{
    name: 'function',
    description: 'Function: 1, 2 or 3',
    pattern: /^[123]{1}$/,
    message: 'Choose 1, 2, or 3',
    default: '3'
  }], function (err, result) {
    if (err) return onErr(err);
    write('Command-line input received:');
    switch (result.function){
      case('1'):
        options['function'] = "templates";
        callback = templateExtraction;
        break;
      case('2'):
        options['function'] = "alexa";
        callback = getAlexa;
        break;
      default :
        options['function'] = "crawl";
        callback = crawlPrompts;
        break;
    }
    write('  Function:\t' + options.function+'\n\n');
    callback();
  });
}

function templateExtraction(){
  write("=======\tTemplate Extraction\t========\r\n");
  var prompt = new require('prompt');
  prompt.start();
    write('Lets plan this crawl.');
    prompt.get([{
		name: 'ready',
		description: 'Copy style sheets to \/lib\/templates\/stylesheets to proceed\r\n',
		pattern: /^[yYnN]{1}$/,
		message: 'Y or N',
		default: 'N'
	}], function(err, result) {
      if (err) return onErr(err);
	  if(result.ready.toLowerCase() == 'n'){
      write('Not ready, exiting now.');
      return;
	  } else if (result.ready.toLowerCase() == 'y'){
		  var temp = require('./lib/templates/templates.js');
	  } else templateExtraction();
	});
  
}
function getAlexa(){
  var pace = require('pace');
  write("Downloading alexa list now.");
  sources.getAlexa(function(path){
    write("Successfully downloaded and extracted list to: "+ path);
  }, pace);
}


function crawlPrompts(){
  sources.checkSource(function(){
    var prompt = new require('prompt');
    prompt.start();
    write('Lets plan this crawl.');
    prompt.get([
      {
        name: 'samples',
        description: 'How many groups of sites would you like to sample from?\n' +
          'Max: 9\n' +
          '>\n',
        pattern: /^[123456789]{1}$/,
        message: '1-9',
        default: '1'
      },{
        name: 'sampleSize',
        description: 'For each group, how many sites do you want to examine?\n' +
          'Larger samples take longer\n' +
          '>\n',
        type: 'number',
        message: 'Number of websites',
        default: '20'
      },{
        name: 'sampleMethod',
        description: 'For each group, how would you like to select the websites?\r\n' +
          '  "top"    - Choose from the TOP of the sample range.\r\n' +
          '  "mid"    - Choose from the middle of the sample range.\r\n' +
          '  "random" - Choose randomly within the sample range.\r\n' +
          '  rank     - enter a number as a starting point (e.g. 50 will start at from the 50th page rank within each sample).\r\n' +
          '>\r\n',
        pattern: /^top$|^mid$|^random$|^\d+$/,
        message: 'Number of websites',
        default: '5000'
      },{
        name: 'sampleDepth',
        description: 'How many pages would you like to compare from each site?\n' +
          'Each page takes approximately 10 seconds.' +
          'Max: 9\n' +
          '>\n',
        pattern: /^[123456789]{1}$/,
        message: '1-9',
        default: '8'
      }
    ], function (err, result) {
      if (err) return onErr(err);
      write('Command-line input received:');
      options.list             = "./data/sources/top-1m.csv";
      options['samples']       = result.samples;
      options['sampleSize']    = result.sampleSize;
      options['sampleMethod']  = result.sampleMethod;
      options.pageDepth        = result.sampleDepth;

      write("Crawling from: \t"+options.list);
      write("Examining:\t" + options.samples +" sample(s) of "+options.sampleSize+" websites \n");
      write("sampling from " + options.sampleMethod + " comparing " +options.pageDepth+" pages.\r\n\r\n");

      pace.op(0);
      crawl.start(options, setProgress, write, end);
    });
  },function(){
    write('No valid Samples in> "/data/sources".\n  - Run with option (2) Get Source first.')
  });
}

function setProgress(n){
  pace.op(n);
}
function end(message){
  setProgress(100);
  write("\nCrawl Complete\nCompleted results for "
    +message["sites crawled"].length+" of "
    +message["sample size"]+" crawled\n");
}

function write(message){
  process.stdout.write(message+"\n");
}

