var expect = require('chai').expect,
    write  = require('../lib/file-io.js'),
    fs     = require('fs');

function deleteFile(file, dir, callback){
  if  (fs.existsSync(file)){
    fs.unlinkSync(file);
    if (dir) {
      fs.rmdir(dir, function(err){
        if (err)throw err;
        return callback();
      });
    }
    else return callback();
  }
}


describe("Write site data to JSON", function(){
  var jsonObj = {
    "site info" : {
      "host name" : "test.com",
      "page rank" : 2
    },
    "hi":"hello",
    "bye":"goodbye"
    },
    file = "./data/test.com/site.json";
  it("should write sample data to file",function(){
    var t = function(){
      return expect(fs.existsSync(file)).to.be.true;
    };
    write.siteJSON(jsonObj, t)
  });
  afterEach("delete test data and directory",function(done){
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
    options = {
      "pageDepth" : 10
    },
    file = "./data/data.csv",
    data;
  before("if data.csv exists delete it", function(done){
    deleteFile(file, null, done);
  });
  it("Should create CSV file",function(){
    data = write.dataCSV(options);
    setTimeout(function(){
      return expect(fs.existsSync(file)).to.be.true;
    },200);
  });
  it("should write sample data to file",function(){
    data.addLine(siteObj);
    setTimeout(function(){
      expect(fs.existsSync(file)).to.be.true;
      expect(data.sites()).to.equal(1);
      return false;
    },200);
  });
  after("delete test data",function(done){
    deleteFile(file, null, done);
  });
});