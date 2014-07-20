// TODO: Manage Process
//var fs               = require('fs');
//var shell            = require('child_process').execFile;
//var phantomjs        = require('phantomjs').path;

// require scripts
//var phantomScript    = __dirname + '\\phantom-read-page.js';

var readGlobal = function(){
	return Opts.ho;
}


exports.readGlobal = function(){ return readGlobal();}