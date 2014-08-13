var fs = require('fs'),
    u = require("url"),
    mkdirp = require("mkdirp");

function createEnvironment(callback){
  var ok = 4,
    cb = function(err) {
      if (err) console.error(err);
      ok--;
      if (ok == 0) callback("ready");
    };
  mkdirp("data/frameworks",cb);
  mkdirp("data/pages",cb);
  mkdirp("data/sources",cb);
  mkdirp("data/logs",cb);
}


function pageJSON (host, pageObj, log, callback){
  //if (typeof url == 'undefined') url = parent.url;
  var page = u.parse(pageObj.url),
    path = "data/"+ page.hostname, //+
      //"/" + (page.pathname.substr(1) || "index"),
    //var path = "data/"+host,
    filename = (page.pathname.substr(1).split("/").join("_") || "index") +".json";
  log("Writing "+host+" to "+path);
  mkdirp(path, function (err) {
    if (err) console.error(err);
    else {
      fs.writeFile(path + "/" +filename,
        JSON.stringify(pageObj),
        function(err) {
          if(err) {
            console.log("Error writing "+filename +" to "+path, err);
          } else {
            if (callback) callback();
          }
        }
      );
    }
  });
}
function Log (callback){
  // Constructor
  var file        = "data/logs/crawl.log",
      logCount    = 0,
      _writable;

  if (_writable) callback();
  else {
    fs.exists(file, function(exists){
      if(exists) {
        _writable = fs.createWriteStream(file, {'flags': 'a'});
        if(callback) callback();
      }
      else create (callback);
    });
  }
  this.write = function(type, message, callback){
    logCount++;
    var a = new Date();
    _writable.write('Event '+logCount+':\t'+type+
      '\r\nTime:\t'+ a.toLocaleTimeString() + '\r\n' +
      message+'\r\n---------\r\n',
      'utf8', function(){
      if(callback) callback();
    });
  };

  /* Private*/
  function create (callback){
    _writable = fs.createWriteStream(file, {'flags': 'a'});
    if (callback) callback();
  }

}

function dataCSV (options, done){
  // Constructor
  var path        = "data",
      filename    = "data.csv",
      file        = path +"/"+filename,
      pages       = options.pageDepth || 10,
      _lines      = 0,
      _writable;
  fs.exists(file, function(exists){
    if(exists) {
      _writable = fs.createWriteStream(file, {'flags': 'a'});
      if(done) done();
    }
    else create (pages, file, done);
  });

  this.sites   = function(){
    return _lines;
  };
  this.addLine = function(site, callback){
    /* create an array of content and turn it into a comma separated list */
    /* TODO: make sure heading always match items*/
    var pageArray = [];
    for (var i = 0; i<pages;i++){
      if (site.pages[i])
        pageArray.push(site.pages[i]);
      else pageArray.push("NA");
    }

    var beg = [
        site["page rank"],
        site["host name"]
      ],
      line = beg.concat(pageArray,site.summary, site.frameworks).join(", ")+"\n";
//      buffer = new Buffer(line);
      //log = fs.createWriteStream(file, {'flags': 'a'});
    //log.end(buffer);
    _writable.write(line, 'utf8', function () {
      _lines++;
      if(callback) callback();
    });
  };
  this.end = function(){
    _writable.end();
    return _writable.path;
  };
  /* Private*/
  function create (pc, f,callback){

    var pages = [];
    for (var i = 0; i < pc; i++){
      pages.push("Page "+i);
    }
    /* -- Sample order expected by file-io

     */
    var beg = [
        "Page Rank",
        "Host"],
      summary = [
        "pages crawled",
        "tot used sels",
        "site selector redundancy",

        "m  sheets",
        "v  sheets",
        "sd sheets",

        "m  dom elements",
        "v  dom elements",
        "sd dom elements",

        "m  abstractness",
        "v  abstractness",
        "sd abstractness",

        "m  avg scope",
        "v  avg scope",
        "sd avg scope",

        "m  rule redundancy",
        "v  rule redundancy",
        "sd rule redundancy",

        "m  selector redundancy",
        "v  selector redundancy",
        "sd selector redundancy",

        "m  selector redundancyU",
        "v  selector redundancyU",
        "sd selector redundancyU",

        "m  selectors",
        "v  selectors",
        "sd selectors",

        "m  selectorsU",
        "v  selectorsU",
        "sd selectorsU",

        "m  universality",
        "v  universality",
        "sd universality",

        "m  universalityK",
        "v  universalityK",
        "sd universalityK",

        "m  used rules",
        "v  used rules",
        "sd used rules",

        "m  used selectors",
        "v  used selectors",
        "sd used selectors",

        "m  used selectorsU",
        "v  used selectorsU",
        "sd used selectorsU"

      ],
      frameworks = [
        "320andup-v3",
        "animate",
        "blueprint-v1",
        "bootstrap-v1",
        "bootstrap-v2",
        "bootstrap-v3",
        "flat-ui-v2",
        "foundation-v3",
        "foundation-v4",
        "foundation-v5",
        "hint-v1-3",
        "jquery-ui-v1-11",
        "kendo-ui-v2",
        "metro-bootstrap",
        "pure-v0-5",
        "ratchet-v2",
        "skeleton",
        "typeplate",
        "unsemantic-grid-responsive"
      ],
      _writable = fs.createWriteStream(f, {'flags': 'a'}),
      head = beg.concat(pages,summary,frameworks).join(", ")+"\n";
    _writable.write(head, 'utf8', function () {
      if(callback) callback();
    });
  }
}

exports.pageFilename= function(url){
  var thisPage = u.parse(url),
      nameIt = (function(path){
        var r = path.pathname; // FEATURE: deal with trailing slashes
        r[r.length-1] == "\/" ? r=r.substring(0, r.length-1).split("/").pop() : r=r.split("/").pop();
        return r || "index";
      })(thisPage);
  return ('data/pages/'+thisPage.hostname +"-"+ nameIt +'.json');
};

exports.StreamJSON = function(filename){
  return fs.createWriteStream(filename);
};



exports.siteJSON  = function(siteObj, log, callback){ return siteJSON (siteObj, log, callback);};
exports.Log       = function(callback){ return new Log(callback);};
exports.dataCSV   = function(opts, done){ return new dataCSV(opts, done);};
exports.setup     = function(callback){return createEnvironment(callback)};