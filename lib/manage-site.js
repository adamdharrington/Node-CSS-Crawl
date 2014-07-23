// TODO: Manage Site
//var fs               = require('fs');
//var shell            = require('child_process').execFile;
//var phantomjs        = require('phantomjs').path;

// require scripts
//var phantomScript    = __dirname + '\\phantom-read-page.js';

var manageProcess = function(url){
  var pagesChecked = 0;





  return {
    url:url,
    pagesChecked:pagesChecked
  };
};

exports.process = function(url){return manageProcess(url);};