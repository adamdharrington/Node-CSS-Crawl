// TODO: Combine page report objects into a site report object
// TODO: Also, evaluate framework presence and other metrics.
var write = require('./file-io.js');


function report(siteObj, callback){
  writeSiteJSON(siteObj, end, callback)
}
function checkFrameworks(identifiers, site, callback){
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
  }
}

function siteStats (siteObj, callback){


}

function writeSiteJSON (siteObj, callback, passiveCallback){
  var c = function(){
    callback(siteObj, passiveCallback);
  };
  write.siteJSON(siteObj,console.log,c);
}
function end(siteObj, callback){
  var newObj = {
    "host name": siteObj["host name"],
    "page rank": siteObj["page rank"],
    "report"   : "dummy"
  };
  return callback(newObj);
}


exports.site        = function(siteObj, callback){return report(siteObj, callback);};