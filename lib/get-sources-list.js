var fs         = require('fs');
var http       = require('http');


var checkLocal = function(file){
	if (fs.exists(file)) return true;
}
function getAlexa (){
	var alexaUrl = "s3 whatever";
	http.get(alexaUrl, extractList(err, contentAsBuffer));
}
function extractList (buffer){
	// TODO: extract zip file
  var unzip = require("unzip");
}
function csvToArray (csvList, callback){
	// TODO: extract csv to array of arrays
  var urlList = [];
  fs.readFile(csvList, "utf-8", function (err, data) {
    if (err) throw err;
    urlList = Array.prototype.map.call(data.split(/\r?\n/), function(l){
      return l.split(",")[1].trim();
    });
    callback(null, arrayToObj(urlList));
    //arrayToObj(urlList, callback);, callback
  });
}

function arrayToObj (list){
  // TODO: turn array into object as defined by Global defaults
  var obj = {}, listSize = list.length, samples = Opts.samples;
  var chunkSize = Math.floor(listSize / samples);
  if (Opts.sampleSize>chunkSize) throw new Error("There are not enough urls to sample as specified.");
  while (samples > 0){
    tmpArr = list.slice((samples-1)*chunkSize,samples*chunkSize);
    obj["sample"+samples] = sample(tmpArr);
    samples--;
  }
  return obj;
  //callback(null, obj);
}
function sample(arr){
  var ss = Opts.sampleSize;
  switch (Opts.sampleMethod){
    case ("TOP"):
      return arr.slice(0,ss);
      break;
    case ("RANDOM"):
      var s =[], l = arr.length;
      while (s.length<ss){
        var u = Math.floor(Math.random() * l);
        if (s.indexOf(arr[u])<0)s.push(arr[u]);
      }
      return s;
      break;
    case("MID"):
      var st = Math.floor((arr.length/2)-(ss/2));
      return arr.slice(st,st+ss);
      break;
  }
}
function list(){
	var list;
	checkLocal ? list = [] : list = [];
	return list;
}

exports.list             = function(){ return list(); };
exports.formatLists      = function(csvList, callback){ return csvToArray(csvList, callback); };

//var f = require('./lib/get-sources-list.js').formatLists('./data/top-1m.csv');