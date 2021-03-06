var fs         = require('fs');




function checkLocal (file){
	if (fs.existsSync(file)) return true;
}
function checkSource(callbackTrue, callbackFalse){
  fs.exists("./data/sources/top-1m.csv", function(exist){
    if (exist) callbackTrue();
    else callbackFalse();
  });
}

function getAlexa (callback, progress){
	var alexaUrl = "http://s3.amazonaws.com/alexa-static/top-1m.csv.zip";
  var g        = require('./http-requests.js').getFile;
  var prog     = progress || null;
	g(alexaUrl, "./data/sources/", function(err,fileLoc){extractList(err, fileLoc, callback)}, prog);
}
/*
 var pace = require('pace');
 var g = require('./lib/http-requests.js').getFile;
 g("http://s3.amazonaws.com/alexa-static/top-1m.csv.zip", './tmp/deleteme/', function(err,loc){console.log(loc)}, pace);
 */


function extractList (err, fileLoc, callback){
	// TODO: extract zip file
  if(err) throw err;
  var unzip = require("unzip").Extract({ path: './data/sources' });
  unzip.on('error', function(err) {
    throw err;
  });
  unzip.on('close', function(){
    callback(fileLoc);
  });

  fs.createReadStream(fileLoc).pipe(unzip);

}

function readList (options, callback){
	// TODO: extract csv to array of arrays
  var urlList = [];
  fs.readFile(options.list, "utf-8", function (err, data) {
    if (err) throw err;
    urlList = Array.prototype.map.call(data.split(/\r?\n/), function(l){
      var t = l.split(",");
      return {
        "page rank" : t[0],
        "host name" : t[1]
      }
    });
    arrayToObj(options, urlList, callback);
  });
}

function arrayToObj (options, list, callback){
  // TODO: turn array into object as defined by Global defaults
  var obj = {}, listSize = list.length, samples = options.samples;
  var chunkSize = Math.floor(listSize / samples);
  if (options.sampleSize>chunkSize) throw new Error("There are not enough urls to sample as specified.");
  while (samples > 0){
    var tmpArr = list.slice((samples-1)*chunkSize, samples*chunkSize);
    obj["sample" + samples] = sample(options.sampleSize, options.sampleMethod, tmpArr);
    samples--;
  }
  callback(null, {
    "sampling info" : {
      "source"        : options.list,
      "sample size"   : options.sampleSize,
      "sample count"  : options.samples,
      "sample method" : options.sampleMethod
    },
    "samples"         : obj
  });
}



function sample(size, method, arr){
  if (!isNaN(parseInt(method,10))){
    return arr.splice(parseInt(method,10),size);
  }
  else{
    var m = method.toUpperCase();
    switch (m){
      case ("TOP"):
        return arr.slice(0,size);
        break;
      case ("RANDOM"):
        var s =[], l = arr.length;
        while (s.length<size){
          var u = Math.floor(Math.random() * l);
          if (s.indexOf(arr[u])<0)s.push(arr[u]);
        }
        return s;
        break;
      case("MID"):
        var st = Math.floor((arr.length/2)-(size/2));
        return arr.splice(st,size);
        break;
    }
  }

}



function list(callback){
	if (checkLocal("./data/sources/top-1m.csv"))
    readList("./data/sources/top-1m.csv", callback);
  else if (checkLocal("./data/sources/top-1m.csv.zip"))
    extractList (null, "./data/sources/top-1m.csv.zip", callback);
  else getAlexa (callback);
}











exports.checkSource         = function(callbackTrue, callbackFalse){return checkSource(callbackTrue, callbackFalse);};

exports.getAlexa            = function(callback, progress){return getAlexa (callback, progress);};

exports.getlist             = function(callback){ return list(callback); };

exports.readList            = function(options, callback){return readList(options, callback); };

exports.formatLists         = function(opts, callback){
  if (opts.list.toLowerCase() == "alexa"){
    if (checkLocal("./data/sources/top-1m.csv")){
      opts.list = "./data/sources/top-1m.csv";
      return readList(opts, callback);
    }
    else if (checkLocal("./data/sources/top-1m.csv.zip")) {
      opts.list = "./data/sources/top-1m.csv";
      return extractList (null, "./data/sources/top-1m.csv.zip", callback, opts);
    }
    else
      opts.list = "./data/sources/top-1m.csv";
      return getAlexa (callback, opts);
  }
  else 
    return readList(opts, callback);
};

exports.unitTests   = function(){return{

}};