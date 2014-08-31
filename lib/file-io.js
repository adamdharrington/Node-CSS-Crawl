var fs = require('fs'),
    u = require("url"),
    mkdirp = require("mkdirp");

function createEnvironment(callback){
  var ok = 4,
    cb = function(err) {
      if (err) console.error(err);
      ok = ok-1;
      if (ok == 0) callback();
    };
  mkdirp("data/templates",cb);
  mkdirp("data/pages",cb);
  mkdirp("data/sources",cb);
  mkdirp("data/logs",cb);
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

function SiteCSV (options, done){
  // Constructor
  var path        = "data",
      filename    = "data.csv",
      file        = path +"/"+filename,
      pages       = options.pageDepth || 10,
      _lines      = 0,
      _writable,
      _callback = function(){
        if (done) done();
      };
  fs.exists(file, function(exists){
    if(exists) {
      _writable = fs.createWriteStream(file, {'flags': 'a'});
      _callback()
    }
    else create (pages, file, _callback);
  });

  this.sites   = function(){
    return _lines;
  };
  this.addLine = function(site, callback){
    /* create an array of content and turn it into a comma separated list */
    /* TODO: make sure heading always match items*/
    var pageArray = [], beg, line;
    if (site["error"]){
      line = [
        site["page rank"],
        site["host name"],
        "Error"
      ].join(", ")+"\n";
    } else{
      for (var i = 0; i<pages;i++){
        if (site.pages[i])
          pageArray.push(site.pages[i]);
        else pageArray.push("NA");
      }

      beg = [
          site["page rank"],
          site["host name"]
      ];
      line = beg.concat(pageArray,site.summary, site.templates).join(", ")+"\n";
    }
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
        "tot sels",
        "site selector redundancy",
        "site-wide style variability",

        "sheets_m",
        "sheets_sd",

        "dom elements_m",
        "dom elements_sd",

        "c2p_m",
        "c2p_sd",

        "abstractness_m",
        "abstractness_sd",

        "avg scope_m",
        "avg scope_sd",

        "universality_m",
        "universality_sd",

        "universalityK_m",
        "universalityK_sd",

        "rule redundancy_m",
        "rule redundancy_sd",

        "selector redundancy_m",
        "selector redundancy_sd",

        "selectors_m",
        "selectors_sd",

        "used rules_m",
        "used rules_sd",

        "used selectors_m",
        "used selectors_sd"
      ],
       templates = [
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
      head = beg.concat(pages,summary,templates).join(", ")+"\n";
  _writable = fs.createWriteStream(f, {'flags': 'a'});
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
        if (r.length > 18){
          var s = "long"+Math.floor(Math.random(20)*10000);
          r = r.substring(0,18) + s;
        }
        return r || "index";
      })(thisPage);
  return ('data/pages/'+thisPage.hostname +"-"+ nameIt +'.json');
};

exports.StreamJSON = function(filename){
  return fs.createWriteStream(filename);
};



exports.siteJSON  = function(siteObj, log, callback){ return siteJSON (siteObj, log, callback);};
exports.Log       = function(callback){ return new Log(callback);};
exports.SiteCSV   = function(opts, done){ return new SiteCSV(opts, done);};
exports.setup     = function(callback){return createEnvironment(callback)};

exports.unitTests   = function(){return{

}};