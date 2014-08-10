#!/usr/bin/env node
var util = require('util');

function setUp(){
  console.log("\n=============================================\n\t\tCSS Crawl\n");

  process.stdin.resume();
  process.stdin.setEncoding('utf8');

  process.stdin.on('data', function (text) {
    console.log('received data:', util.inspect(text));
    if (text === 'quit\n') {
      done();
    }
  });

  function done() {
    console.log('Now that process.stdin is paused, there is nothing more to do.');
    process.exit();
  }
}

setUp();