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
      "site info" : {
        "host name" : "test.com",
        "page rank" : 2
      },
      "crawl info" : {
        "pages crawled" : 8,
        "page urls"     : ["oneurl", "two urls", "final url"],
        "error count"   : 0,
        "time crawled"  : "today"
      },
      "site stats" : {

      },
      "page stats" : [

      ]
    },
    siteObj2 = {
      "site info" : {
        "host name" : "test2.com",
        "page rank" : 1
      },
      "crawl info" : {
        "pages crawled" : 6,
        "page urls"     : ["oneurl", "two urls", "final url"],
        "error count"   : 0,
        "time crawled"  : "today"
      },
      "site stats" : {

      },
      "page stats" : [

      ]
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
    data = write.dataCSV(options, callback);
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