// FEATURE: Server to accept incoming http requests on a given port, respond to get requests with appropriate stylesheet
var express = require('express');
var app = express();
var page = function(title){
  return '<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><link rel="stylesheet" type="text/css" href="/stylesheets/' +
    title + '.css"><title>' + title + '</title></head><body><h1>'+ title +'</h1>'+
    '<script src="/script/frameworks.js"></script>'+
    '</body></html>'
};
var server;


app.use('/stylesheets', express.static(__dirname + '/stylesheets'));
app.use('/script', express.static(__dirname + '/script'));

app.get('/fw/:css', function(req, res) {
  var title = req.params.css;
  res.send(page(title));

});

exports.start = function(){
 server = app.listen(3000);
};

exports.end = function(){
  if (server) server.close();
};