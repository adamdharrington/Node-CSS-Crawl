// TODO: Combine page report objects into a site report object
// TODO: Also, evaluate framework presence and other metrics.
var write = require('./file-io.js');


function report(siteObj, callback){
  checkFrameworks(fwks, siteObj,function(site){
    writeSiteJSON(siteStats(site), end, callback);
  })

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
    "pages crawled": 4,
    "avg sheets": 4,
    "avg abstractness": 0.06626506024096386,
    "tot avg scope": 0.7924313533202578,
    "tot rule redundancy": 0.5666666666666667,
    "avg rules": 240,
    "tot selector redundancy": 0.6054216867469879,
    "avg selectors": 332,
    "tot universality": 0.44728915662650603,
    "tot universalityK": 0.06626506024096386,
    "avg unused rules": 136,
    "sd unused rules": 2,
    "avg unused selectors": 201,
    "sd unused selectors": 2,
    "avg used rules": 104,
    "avg used selectors": 131,
    "sd used rules": 2,
    "sd used selectors": 2
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