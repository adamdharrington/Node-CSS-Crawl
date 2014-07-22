// TODO: External Style Sheet HTTP Requests
 
// Dependencies
var fs              = require('fs');
var url             = require('url');
var http            = require('http');
var mkdirp          = require('mkdirp');
//var exec            = require('child_process').exec;
//var spawn           = require('child_process').spawn;

// App variables
var file_url = 'http://upload.wikimedia.org/wikipedia/commons/4/4f/Big%26Small_edit_1.jpg';
var DOWNLOAD_DIR = './data/sources/';


// Function to download file using HTTP.get
function getFile(getUrl, writeDir, callback) {
  if (writeDir) mkdirp(writeDir);
  var options = {
    host: url.parse(getUrl).host,
    port: 80,
    path: url.parse(getUrl).pathname
  };

  var file_name = url.parse(getUrl).pathname.split('/').pop();
  var file = fs.createWriteStream(DOWNLOAD_DIR + file_name);

  http.get(options, function(response) {
    response.on('data', function(data) {
      file.write(data);
    }).on('end', function() {
        file.end();
        callback(DOWNLOAD_DIR + file_name);
      });
  });
};

getFile(file_url, DOWNLOAD_DIR, function(str){console.log(str);});

exports.getFile = function(getUrl, writeDir, callback){
	return getFile(getUrl, writeDir, callback);
};
