var fs         = require('fs');
var g          = require('./http-requests.js').getFile;



function checkLocal (file){
	if (fs.existsSync(file)) return true;
}


function getAlexa (callback, options){
	var alexaUrl = "http://s3.amazonaws.com/alexa-static/top-1m.csv.zip";
	g(alexaUrl, "./data/sources/", function(err,fileLoc){extractList(err, fileLoc, callback, options)});
}



function extractList (err, fileLoc, callback, options){
	// TODO: extract zip file
  if(err) throw err;
  var unzip = require("unzip").Extract({ path: './data/sources' });
  unzip.on('error', function(err) {
    throw err;
  });
  unzip.on('close', function(){csvToArray(options, callback)});

  fs.createReadStream(fileLoc).pipe(unzip);

}


function csvToArray (options, callback){
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
    callback(null, arrayToObj(options, urlList));
  });
}



function arrayToObj (options, list){
  // TODO: turn array into object as defined by Global defaults
  var obj = {}, listSize = list.length, samples = options.samples;
  var chunkSize = Math.floor(listSize / samples);
  if (options.sampleSize>chunkSize) throw new Error("There are not enough urls to sample as specified.");
  while (samples > 0){
    tmpArr = list.slice((samples-1)*chunkSize,samples*chunkSize);
    obj["sample" + samples] = sample(options.sampleSize, options.sampleMethod, tmpArr);
    samples--;
  }
  return {
    "sampling info" : {
      "source"        : options.list,
      "sample size"   : options.sampleSize,
      "sample count"  : options.samples,
      "sample method" : options.sampleMethod
    },
    "samples"       : obj
  };
}



function sample(size, method, arr){
  switch (method){
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
      return arr.slice(st,st+size);
      break;
  }
}
function list(callback){
	if (checkLocal("./data/sources/top-1m.csv"))
    csvToArray("./data/sources/top-1m.csv", callback);
  else if (checkLocal("./data/sources/top-1m.csv.zip"))
    extractList (null, "./data/sources/top-1m.csv.zip", callback);
  else getAlexa (callback);
}

exports.getlist             = function(callback){ return list(callback); };
exports.formatLists         = function(opts, callback){
  if (opts.list == "alexa"){
    if (checkLocal("./data/sources/top-1m.csv")){
      opts.list = "./data/sources/top-1m.csv";
      return csvToArray(opts, callback);
    }
    else if (checkLocal("./data/sources/top-1m.csv.zip")) {
      opts.list = "./data/sources/top-1m.csv";
      return extractList (null, "./data/sources/top-1m.csv.zip", callback, opts);
    }
    else 
      return getAlexa (callback, opts);
  }
  else 
    return csvToArray(opts, callback); 
};

//var f = require('./lib/get-sources-list.js').formatLists('./data/top-1m.csv');