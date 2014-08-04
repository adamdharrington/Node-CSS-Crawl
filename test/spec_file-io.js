var expect = require('chai').expect,
    write  = require('../lib/file-io.js'),
    fs     = require('fs');

function deleteFile(file, dir, callback){
  if  (fs.existsSync(file)){
    fs.unlink(file, function(){
      if (dir) {
        fs.rmdir(dir, function(err){
          if (err)throw err;
          return callback();
        });
      }
      else return callback();
    });
  }
  else return callback();
}


describe("Write site data to JSON", function(){
  this.timeout(4000);
  var jsonObj = {
    "site info" : {
      "host name" : "test.com",
      "page rank" : 2
    },
    "hi":"hello",
    "bye":"goodbye"
    },
    file = "./data/test.com/site.json";
  before("delete test data and directory",function(done){
    deleteFile(file, "./data/test.com", done);
  });
  it("should write sample data to file",function(){
    var t = function(){
      return expect(fs.existsSync(file)).to.be.true;
    };
    write.siteJSON(jsonObj, t)
  });
  after("delete test data and directory",function(done){
    deleteFile(file, "./data/test.com", done);
  });
});

//describe("Write site logs to siteLog", function(){
//  var jsonObj = {
//      "site info" : {
//        "host name" : "test.com",
//        "page rank" : 2
//      },
//      "hi":"hello",
//      "bye":"goodbye"
//    },
//    file = "./data/test.com/site.json";
//  it("should write sample data to file",function(){
//    var t = function(){
//      return expect(fs.existsSync(file)).to.be.true;
//    };
//    write.siteJSON(jsonObj, t)
//  });
//  afterEach("delete test data and directory",function(){
//    deleteFile(file);
//  });
//});

describe("Add Site data to crawl CSV file", function(){
  this.timeout(4000);
  var siteObj = {

      "host name" : "test1.com",
      "page rank" : 1,
      "pages" : ["url1", "url2", "url3", "url4"],
      "summary" : {
        "pages crawled": 4,
        "avg sheets": 4,
        "avg abstractness": 0.06626506024096386,
        "tot avg scope": 0.7924313533202578,
        "tot rule redundancy": 0.5666666666666667,
        "avg rules": 240,
        "tot selector redundancy": 0.6054216867469879,
        "avg selectors": 332,
        "tot universality": 0.44728915662650603,
        "tot universalityK": 0.06626506024096386,
        "avg unused rules": 136,
        "sd unused rules": 2,
        "avg unused selectors": 201,
        "sd unused selectors": 2,
        "avg used rules": 104,
        "avg used selectors": 131,
        "sd used rules": 2,
        "sd used selectors": 2
      },
      "frameworks" : {
        bootv3   :false,
        bootv2   :false,
        bootv1   :false,
        found5   :false,
        found4   :false,
        found3   :false,
        found2   :false,
        found1   :false,
        pureCSS  :false,
        jquertUI :false,
        normalizr:false
      }
    },
    siteObj2 = {

      "host name" : "test2.com",
      "page rank" : 2,
      "pages" : ["url1", "url2", "url3", "url4"],
      "summary" : {
        "pages crawled": 4,
        "avg sheets": 4,
        "avg abstractness": 0.06626506024096386,
        "tot avg scope": 0.7924313533202578,
        "tot rule redundancy": 0.5666666666666667,
        "avg rules": 240,
        "tot selector redundancy": 0.6054216867469879,
        "avg selectors": 332,
        "tot universality": 0.44728915662650603,
        "tot universalityK": 0.06626506024096386,
        "avg unused rules": 136,
        "sd unused rules": 2,
        "avg unused selectors": 201,
        "sd unused selectors": 2,
        "avg used rules": 104,
        "avg used selectors": 131,
        "sd used rules": 2,
        "sd used selectors": 2
      },
      "frameworks" : {
        bootv3   :false,
        bootv2   :false,
        bootv1   :false,
        found5   :false,
        found4   :false,
        found3   :false,
        found2   :false,
        found1   :false,
        pureCSS  :false,
        jquertUI :false,
        normalizr:false
      }
    },
    options = {
      "pageDepth" : 8
    },
    file = "./data/data.csv",
    data;
  before("if data.csv exists delete it", function(done){
    deleteFile(file, null, done);
  });
  it("Should create CSV file",function(done){
    var callback = function(){
      expect(fs.existsSync(file)).to.be.true;
      done();
    };
    data = new write.dataCSV(options, callback);
  });
  it("should write sample data to file",function(done){
    var callback = function(){
      expect(fs.existsSync(file)).to.be.true;
      expect(data.sites()).to.equal(1);
      done();
    };
    data.addLine(siteObj, callback);
  });
  it("should write more sample data to same file",function(done){
    var callback = function(){
      expect(fs.existsSync(file)).to.be.true;
      expect(data.sites()).to.equal(2);
      done();
    };
    data.addLine(siteObj2, callback);
  });
//  after("delete test data",function(done){
//    deleteFile(file, null, done);
//  });
});