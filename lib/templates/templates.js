#!/usr/bin/env node
// FEATURE: Get selectors for each stylesheet, store in an object, find unique identifiers, store in an object, write to file
// TODO: Find all stylesheets in css directory,
// TODO: Create a url for each get selectors from child process,
// TODO: store all in a global object
// TODO: when process complete commence unique identifier function
// TODO: Write all data to file as JSON
var fs          = require('fs');
var async       = require('async');
var phantomjs   = require('phantomjs').path;
var fwSelectors = __dirname + '\\phantom-client.js';
var server      = require('./server.js');
var spawn       = require('child_process').spawn;
var templates;

fs.readdir(__dirname + '/stylesheets', function(err,files){
  templates = new Templates;
  queue(stripExt(files), getUnique);
  startServer();
  console.log("starting...")
});



function queue(fws, queueCallback){
  var fwQueue = async.queue(function(fw, callback){
    if (fw)
      new Phantom(fw, callback);
  }, 3);

  fwQueue.drain = function(){
    queueCallback();
  };
  fwQueue.push(fws);
}

function startServer (){
  server.start();
}
function endServer (){
  server.end();
}

function Templates(){
  var allTemplates = [],
      allSelectors = [],
      allData = {};

  var isUnique = function(selector){
    return (allSelectors.indexOf(selector) == allSelectors.lastIndexOf(selector))
  };
  this.addTemplate = function(name, obj, callback){
    allTemplates.push(name);
    allData[name] = obj;
    allSelectors = allSelectors.concat(obj["all selectors"]);
    if (callback)callback();
  };
  this.getTemplates = function(){
    return allTemplates;
  };
  this.getData = function(){
    return allData;
  };
  this.compareTemplates = function(callback){
    // for each template:
    allTemplates.map(function(template){
      // the unique selectors are the subset of selectors that:
      allData[template]["unique identifiers"] = allData[template]["all selectors"]
        .filter(function(selector){
          return isUnique(selector);
        });
      console.log("unique selectors in "+ template +" = "+allData[template]["unique identifiers"].length);
    });
    setTimeout(function(){
      callback(allData);
    },500);
  };
}

function getUnique (){
  function w(data){
    fs.writeFile(file, JSON.stringify(data), function(){
      end(file);
    });
  }
  var file = __dirname + '/template-data/unique.json';
  templates.compareTemplates(w)
}

function end(file){
  console.log("got unique identifiers, wrote to: "+file);
  process.exit(code=0);
}

function Phantom(template, callback){
  var s = spawn(phantomjs, ["--web-security=false", fwSelectors, template]);
  var file = fs.createWriteStream(__dirname + '/template-data/'+ template +'.json');
  console.log("getting "+ template +" data...");
  s.stdout.on('data', function(data){
    file.write(data);
  });
  s.stdout.on('end', function(){
    console.log("write complete to "+ template);
    try{
      addTemplate(template, __dirname + "/template-data/"+template+'.json', callback);
    } catch(err) {
      console.log(err);
      callback();
    }
    file.end();
  });
}

function addTemplate(name, location, proceed){
  var tmp = require(location);
  templates.addTemplate(name,tmp, proceed);
}

function stripExt(files){
  return files.map(function(file){
    return file.substring(0, (file.length - 4));
  });
}