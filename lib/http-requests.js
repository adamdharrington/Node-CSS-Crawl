// TODO: External Style Sheet HTTP Requests

// Dependencies
var fs              = require('fs');
var url             = require('url');
var http            = require('http');
var mkdirp          = require('mkdirp');



// Function to download file using HTTP.get
function getFile(getUrl, writeDir, callback) {
  if (writeDir) mkdirp(writeDir);
  var options = {
    host: url.parse(getUrl).host,
    port: 80,
    path: url.parse(getUrl).pathname
  };

  var file_name = url.parse(getUrl).pathname.split('/').pop();
  var file = fs.createWriteStream(writeDir + file_name);

  http.get(options, function(response) {
    response.on('data', function(data) {
      file.write(data);
    }).on('end', function() {
        file.end();
        callback(null, writeDir + file_name);
      });
  });
}


exports.getFile = function(getUrl, writeDir, callback){
  return getFile(getUrl, writeDir, callback);
};
