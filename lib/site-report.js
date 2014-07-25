// TODO: Combine page report objects into a site report object
// TODO: Also, evaluate framework presence and other metrics.

function report(sitObj, callback){
  var newObj = {"host name": sitObj["host name"], "report" : "dummy"};
  return callback(newObj);
}

exports.site        = function(sitObj, callback){return report(sitObj, callback);};