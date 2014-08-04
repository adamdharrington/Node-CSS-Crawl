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
var frameworks;

fs.readdir('./stylesheets', function(err,files){
  frameworks = new Frameworks;
  queue(stripExt(files), getUnique);
  startServer();
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

function Frameworks(){
  var allFrameworks = [],
      allSelectors = [],
      allData = {};

  var isUnique = function(selector){
    return (allSelectors.indexOf(selector) == allSelectors.lastIndexOf(selector))
  };
  this.addFramework = function(name, obj, callback){
    allFrameworks.push(name);
    allData[name] = obj;
    allSelectors = allSelectors.concat(obj["all selectors"]);
    if (callback)callback();
  };
  this.getFrameworks = function(){
    return allFrameworks;
  };
  this.getData = function(){
    return allData;
  };
  this.compareFrameworks = function(callback){
    // for each framework:
    allFrameworks.map(function(framework){
      // the unique selectors are the subset of selectors that:
      allData[framework]["unique identifiers"] = allData[framework]["all selectors"]
        .filter(function(selector){
          return isUnique(selector);
        });
      console.log("unique selectors in "+ framework +" = "+allData[framework]["unique identifiers"].length);
    });
    setTimeout(function(){
      callback(allData);
    },500);
  };
//  this.compareFrameworks = function(callback){
//    var wait = allFrameworks.length;
//    // for each framework:
//    allFrameworks.map(function(framework){
//      // the unique selectors are the subset of selectors that:
//      allData[framework]["unique identifiers"] = allData[framework]["all selectors"]
//        .filter(function(selector){
//          // are present in only one file
//          return (allFrameworks.filter(function(fw){
//            return (fw !== framework && allData[fw]["all selectors"].indexOf(selector) < 0);
//          }).length == 1);
//        });
//      console.log("unique selectors in "+ framework +" = "+allData[framework]["unique identifiers"].length);
//      wait-=1;
//    });
//    do{
//      setTimeout(function(){
//        if (wait == 0) callback(allData);
//      },50);
//    }while(wait);
//  };
}

function getUnique (){
  function w(data){
    fs.writeFile(file, JSON.stringify(data), function(){
      end(file);
    });
  }
  var file = './framework-data/unique.json';
  frameworks.compareFrameworks(w)
}

function end(file){
  console.log("got unique identifiers, wrote to: "+file);
  process.exit(code=0);
}

function Phantom(framework, callback){
  var s = spawn(phantomjs, ["--web-security=false", fwSelectors, framework]);
  var file = fs.createWriteStream('framework-data/'+ framework +'.json');

  s.stdout.on('data', function(data){
    file.write(data);
  });
  s.stdout.on('end', function(){
    console.log("write complete to "+ framework);
    try{
      addFramework(framework, "./framework-data/"+framework+'.json', callback);
    } catch(err) {
      console.log(err);
      callback();
    }
    file.end();
  });
}

function addFramework(name, location, proceed){
  var tmp = require(location);
  frameworks.addFramework(name,tmp, proceed);
}

function stripExt(files){
  return files.map(function(file){
    return file.substring(0, (file.length - 4));
  });
}