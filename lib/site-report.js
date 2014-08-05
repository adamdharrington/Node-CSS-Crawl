// TODO: Combine page report objects into a site report object
// TODO: Also, evaluate framework presence and other metrics.
var write = require('./file-io.js');


function report(siteObj, callback){
  // TODO: create all unique selectors, recreate accurate redundancy metrics


  // TODO: combine siteObj into a single object of cumulative statistics


  // TODO: THEN:













  checkFrameworks(fwks, siteObj,function(site){
    writeSiteJSON(siteStats(site), end, callback);
  });

}





function analyseSite (siteObj, callback){
  var master = {
    "host name" : "",
    "page rank" : 0,
    "page count": 0,
    "site stats": "todo",
    "frameworks": "todo",
    "pages"     : []
    },
    pages = siteObj.pages.length,
    unique = [];

  for (var i = 0;i<pages;i++){
    unique = unique.concat(siteObj.pages[i]["used selectors"]);
  }

  unique = unique.sort().filter(function(elem, pos, self) {
    return self.indexOf(elem) == pos;
  });

}

function combine(array){
  var l = array.length,
      tot = array.reduce(function(a,b){return a+b}),
      mean = tot/ l,
      variance=0;
  array.map(function(i){
    variance+=Math.pow(i - mean, 2);
  });
  var sd = variance/l;
  return {
    mean:mean,
    variance: variance,
    "standard deviation": sd
  };
}



















function checkFrameworks(fwks, siteObj,callback){
  // if (window.__STYLES.frameworks["metro-bootstrap"] && window.__STYLES.frameworks["metro-bootstrap"] >= .75) console.log("bingo");
}

function checkFrameworks(identifiers, site, callback){
  // TODO: compare pages to framework identifiers
  var frameworks = {
    bootv3   :false,
    bootv2   :false,
    bootv1   :false,
    found5   :false,
    found4   :false,
    found3   :false,
    found2   :false,
    found1   :false,
    pureCSS  :false,
    jquertUI :false,
    normalizr:false
  };
  site.frameworks = frameworks;
  callback(site);
}

function siteStats (siteObj){
  // TODO: Create a report object with summarised data
  siteObj.summary = {
    "pages crawled": 0,
    "avg sheets": 0,
    "avg abstractness": 0,
    "tot avg scope": 0,
    "tot rule redundancy": 0,
    "avg rules": 0,
    "tot selector redundancy": 0,
    "avg selectors": 0,
    "tot universality": 0,
    "tot universalityK": 0,
    "avg unused rules": 0,
    "sd unused rules": 0,
    "avg unused selectors": 0,
    "sd unused selectors": 0,
    "avg used rules": 0,
    "avg used selectors": 0,
    "sd used rules": 0,
    "sd used selectors": 0
  }
}

function writeSiteJSON (siteObj, callback, passiveCallback){
  var c = function(){
    callback(siteObj, passiveCallback);
  };
  write.siteJSON(siteObj,console.log,c);
}
function end(siteObj, callback){
  var newObj = {
    "host name"    : siteObj["host name"],
    "page rank"    : siteObj["page rank"],
    "pages"        : siteObj["pages"],
    "summary"      : siteObj["summary"],
    "frameworks"   : siteObj["frameworks"]
  };
  return callback(newObj);
}


exports.site        = function(siteObj, callback){return report(siteObj, callback);};