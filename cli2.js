#!/usr/bin/env node
var prompt = require('prompt');

prompt.start();

prompt.get(['username', 'email'], function (err, result) {
  if (err) { return onErr(err); }
  write('Command-line input received:');
  write('  Username:\t' + result.username);
  write('  Email:\t' + result.email);
});

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
