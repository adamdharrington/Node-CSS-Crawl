// TODO: External Style Sheet HTTP Requests

// Dependencies
var fs              = require('fs');
var url             = require('url');
var http            = require('http');
var mkdirp          = require('mkdirp');



// Function to download file using HTTP.get
function getFile(getUrl, writeDir, progress, callback) {
  if (writeDir) mkdirp(writeDir);
  var options = {
    host: url.parse(getUrl).host,
    port: 80,
    path: url.parse(getUrl).pathname
  };

  var file_name = url.parse(getUrl).pathname.split('/').pop();
  var file = fs.createWriteStream(writeDir + file_name);

  http.get(options, function(response) {
    var len = response.headers[ 'content-length' ],
        cur = 0;
    if (progress) {
      process.stdout.write('Downloading, please wait...\n');
      var p = progress({total : len});
    }
    response.on('data', function(chunk) {
      cur += chunk.length;
      if (p) p.op(cur);
      file.write(chunk);
    }).on('end', function() {
        file.end();
        callback(null, writeDir + file_name);
      });
  });
}


exports.getFile = function(getUrl, writeDir, callback, progress){
  return getFile(getUrl, writeDir, progress, callback);
};


exports.unitTests   = function(){return{

}};