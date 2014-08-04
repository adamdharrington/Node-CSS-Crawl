var fs = require('fs'),
    u = require("url"),
    mkdirp = require("mkdirp");


function pageCSV (url, content, callback){
  //if (typeof url == 'undefined') url = parent.url;
  var page = u.parse(url),
      path = "data/"+ page.hostname +
        "/" + (page.pathname.substr(1) || "index"),
      filename = "selectors.csv",
      file = "Selector, Used, Reference.Count\n";

  console.log("writing to " + path);
  console.log(content.stylesheets);
  for (selector in content.usedStyles){
    var so = content.usedStyles[selector];
    file += selector+","+so.usedBy+","+so.referenced+"\n";
  }
  for (selector in content.unusedStyles){
    so = content.unusedStyles[selector];
    file += selector+","+0+","+so.referenced+"\n";
  }

  mkdirp(path, function (err) {
    if (err) console.error(err)
    else {
      fs.writeFile(path + "/" +filename, file, function(err) {
        if(err) {
          console.log(err);
        } else {
          console.log("The file was saved!");
          callback("end: "+path+filename);
        }
      });
    }
  });
}
function siteJSON (siteObj, log, callback){
  //if (typeof url == 'undefined') url = parent.url;
  var path = "data/"+ siteObj["host name"],
      filename = "site.json";

  mkdirp(path, function (err) {
    if (err) console.error(err);
    else {
      fs.writeFile(path + "/" +filename,
        JSON.stringify(siteObj),
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
function siteLog (host){
  // Constructor
  var path        = "data/" + host,
      filename    = "site.log",
      file        = path +"/"+filename,
      logCount    = 0;
  create (host, path,file,filename);


  this.write = function(message){
    var log = fs.createWriteStream(file, {'flags': 'a'});
    logCount++;
    log.end('log '+logCount+':\n'+message+'\n');
  };

  /* Private*/
  function create (h, p,f,fn){
    mkdirp(p, function (err) {
      if (err) console.error(err);
      else {
        fs.writeFile(f,
          "\/* \nLog for "+h+"\n*\/\n",
          function(err) {
            if(err)
              console.error("Error writing "+ fn +" to "+ p , err);
          }
        );
      }
    });
  }
}

function dataCSV (options, done){
  // Constructor
  var path        = "data",
      filename    = "data.csv",
      file        = path +"/"+filename,
      pages       = options.pageDepth || 10,
      _lines      = 0;
  create (pages, file, done);
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
      end =[
        site.summary["pages crawled"] || 0,
        site.summary["avg sheets"] || 0,
        site.summary["avg abstractness"] || 0,
        site.summary["tot avg scope"] || 0,
        site.summary["tot rule redundancy"] || 0,
        site.summary["avg rules"] || 0,
        site.summary["tot selector redundancy"] || 0,
        site.summary["avg selectors"] || 0,
        site.summary["tot universality"] || 0,
        site.summary["tot universalityK"] || 0,
        site.summary["avg unused rules"] || 0,
        site.summary["sd unused rules"] || 0,
        site.summary["avg unused selectors"] || 0,
        site.summary["sd unused selectors"] || 0,
        site.summary["avg used rules"] || 0,
        site.summary["avg used selectors"] || 0,
        site.summary["sd used rules"] || 0,
        site.summary["sd used selectors"] || 0,
        site.frameworks["bootv3"] || "NA",
        site.frameworks["bootv2"] || "NA",
        site.frameworks["foundv5"] || "NA",
        site.frameworks["foundv4"] || "NA"
      ],
      line = beg.concat(pageArray,end).join(", ")+"\n",
      buffer = new Buffer(line);
      //log = fs.createWriteStream(file, {'flags': 'a'});
    //log.end(buffer);
    fs.appendFile(file, buffer, function (err) {
      if (err) throw err;
      _lines++;
      if(callback) callback();
    });
  };

  /* Private*/
  function create (pc, f,callback){

    var pages = [];
    for (var i = 0; i < pc; i++){
      pages.push("Page "+i);
    }

    var beg = [
        "Page Rank",
        "Host"],
      end = [
        "pages crawled",
        "avg sheets",
        "avg abstractness",
        "tot avg scope",
        "tot rule redundancy",
        "avg rules",
        "tot selector redundancy",
        "avg selectors",
        "tot universality",
        "tot universalityK",
        "avg unused rules",
        "sd unused rules",
        "avg unused selectors",
        "sd unused selectors",
        "avg used rules",
        "avg used selectors",
        "sd used rules",
        "sd used selectors",
        "Bootstrap v3",
        "Bootstrap v2",
        "Foundation v5",
        "Foundation v4"
      ],
      head = beg.concat(pages,end).join(", ")+"\n",
      buffer = new Buffer(head);
    fs.writeFile(f, buffer, function (err) {
      if (err) throw err;
      if(callback) callback();
    });
  }
}

exports.phantomPage = function(obj, callback){
  var page = u.parse(pageObj.url),
    path = "data/"+ page.hostname, //+
  //"/" + (page.pathname.substr(1) || "index"),
  //var path = "data/"+host,
    filename = (page.pathname.substr(1).split("/").join("_") || "index") +".json";
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
};

exports.pageFilename= function(url){
  var thisPage = u.parse(url);
  return ('data/pages/'+thisPage.hostname +"-"+ thisPage.pathname.split('/').pop()+'.json');
};

exports.StreamJSON= function(filename){
  return fs.createWriteStream(filename);
};




exports.pageCSV   = function(){};
exports.pageJSON  = function(host, pageObj, log, callback){return pageJSON(host, pageObj, log, callback);};
exports.siteJSON  = function(siteObj, log, callback){ return siteJSON (siteObj, log, callback);};
exports.siteLog   = function(host){ return siteLog(host);};
exports.dataCSV   = function(opts, done){ return new dataCSV(opts, done);};
exports.crawlLog  = function(){};
//exports.create = function(pc, p, f, fn){return create(pc, p,f,fn)};