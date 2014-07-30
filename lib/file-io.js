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
  var path = "data/"+ siteObj["site info"]["host name"],
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

function dataCSV (options){
  // Constructor
  var path        = "data",
      filename    = "data.csv",
      file        = path +"/"+filename,
      pages       = options.pageDepth || 10,
      _lines      = 0;
  create (pages, path,file,filename);
  this.sites   = function(){
    return _lines;
  };
  this.addLine = function(site){
    /* create an array of content and turn it into a comma separated list */
    /* TODO: make sure heading always match items*/

    var pageArray = [];
    for (var i = 0; i<pages;i++){
      if (site["crawl info"]["page urls"][i])
        pageArray.push(site["crawl info"]["page urls"][i]);
      else pageArray.push("NA");
    }

    var beg = [
        site["site info"]["page rank"],
        site["site info"]["host name"]
      ],
      end =[
        site["Avg. Style Sheets"] || null,
        site["Total Style Rules"] || null,
        site["Bootstrap v3"] || null,
        site["Bootstrap v2"] || null,
        site["Foundation v5"] || null,
        site["Foundation v4"] || null,
        site["Abstractness"] || null,
        site["Used Style Rules"] || null,
        site["Unused Style Rules"] || null
      ],
      line = beg.concat(pageArray,end);
    var log = fs.createWriteStream(file, {'flags': 'a'});
    log.end(line.toString()+'\n');
    _lines++;
  };

  /* Private*/
  function create (pc, p,f,fn){

    var pages = "";
    for (var i = 0; i < pc; i++){
      pages += "Page "+i+", ";
    }

    var head = 
      "Page Rank, " +
      "Host, " +
      pages +
      "Avg. Style Sheets, " +
      "Total Style Rules, " +
      "Bootstrap v3, " +
      "Bootstrap v2, " +
      "Foundation v5, " +
      "Foundation v4, " +
      "Abstractness, " +
      "Used Style Rules, " +
      "Unused Style Rules\n";
    mkdirp(p, function (err) {
      if (err) console.error(err);
      else {
        fs.writeFile(f,
          head,
          function(err) {
            if(err)
              console.error("Error writing "+ p +" to "+ fn , err);
          }
        );
      }
    });
  }
}


exports.pageCSV   = function(){};
exports.siteJSON  = function(siteObj, log, callback){ return siteJSON (siteObj, log, callback);};
exports.siteLog   = function(host){ return siteLog(host);};
exports.dataCSV   = function(opts){ return new dataCSV(opts);};
exports.crawlLog  = function(){};