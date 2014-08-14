#!/usr/bin/env node
var fs         = require('fs');
var sources    = require('./lib/get-sources-list.js');
var options    = {};



write('====================================================\n\t\tWelcome to CSS Crawl');
init();

function init(){
  var prompt = new require('prompt');
  prompt.start();
  write('Please choose one of the following options\n' +
    ' (1) Process new CSS frameworks\n' +
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
        options['function'] = "frameworks";
        callback = frameworkExtraction;
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

function frameworkExtraction(){
  write("do framework now");
}
function getAlexa(){
  write("download alexa list now");
}
function crawlPrompts(){
  sources.checkSource(function(){
    var prompt = new require('prompt');
    prompt.start();
    write('Are you looking to crawl from different intervals of your list?\n' +
      ' (1) No, a single sample is all I want.\n' +
      ' (2) Yes, I want to choose specific intervals to sample.\n' +
      ' (3) Yes, I want to divide the list evenly into a number of samples.\n');
    prompt.get([{
      name: 'samples',
      description: 'Samples: 1, 2 or 3',
      pattern: /^[123]{1}$/,
      message: 'Choose 1, 2, or 3',
      default: '1'
    }], function (err, result) {
      if (err) return onErr(err);
      write('Command-line input received:');
      switch (result.samples){
        case('1'):
          options['sample'] = "single";
          break;
        case('2'):
          options['sample'] = "specific";
          break;
        default:
          options['sample'] = "set";
          break;
      }
      write('  Sample:\t' + options.sample+'\n\n');
    });
  },function(){
    write('No valid Samples in> "/data/sources".\n  - Run with option (2) Get Source first.')
  });
}






function onErr(err) {
  console.log(err);
  return 1;
}



//var util = require('util');
//
//function setUp(){
//  write("\n=============================================\n\t\tCSS Crawl\n\n");
//  write("Please select from the following options: ");
//  getList();
//}
//var options = {};
//function getList(){
//  askFor("Local list or download the Alexa top 1 million sites?", setList, ["Local", "Alexa"]);
//}
//function setList(value){
//  options["list"] = value;
//  write(value);
//  getListLocation();
//  //else sayGoodbye();
//}
//
//function getListLocation(){
//  askFor("Please enter the full path to your source CSV file.", sayGoodbye);
//}
//
//function sayGoodbye(value){
//  write("Goodbye");
//}
//
//
//function askFor(message, callback, options){
//  process.stdin.resume();
//  process.stdin.setEncoding('utf8');
//  write(message);
//  if (options) write("("+options.join(", ")+")");
//  process.stdin.on('data', function (text) {
//    var t = cleanInput(text);
//    if (options){
//      if (options.indexOf(t)>=0) callback(t);
//      else askFor(t+" is not a valid response try again", callback, options);
//    }
//    else callback(t);
//
//  });
//}
//function cleanInput(text){
//  return text.substr(0,text.indexOf("\n")-1).trim();
//}

function write(message){
  process.stdout.write(message+"\n");
}

//setUp();
