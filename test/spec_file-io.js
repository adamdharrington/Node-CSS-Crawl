var chai = require('chai'),
    sinon = require("sinon"),
    sinonChai = require("sinon-chai"),
    write  = require('../lib/file-io.js'),
    fs     = require('fs'),
    expect = chai.expect;
chai.use(sinonChai);


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
describe("Create CSV file for writing", function(){
  var options = {
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
});
describe("Add Site data to crawl CSV file", function(){
  this.timeout(4000);
  var siteObj = {

      "host name" : "test1.com",
      "page rank" : 1,
      "pages" : ["url1", "url2", "url3", "url4"],
      "summary" : [
        4,
        4,
        0.06626506024096386,
        0.7924313533202578,
        0.5666666666666667,
        240,
        0.6054216867469879,
        332,
        0.44728915662650603,
        0.06626506024096386,
        136,
        2,
        201,
        2,
        104,
        131,
        2,
        2
      ],
      "frameworks" : [
       100,
       false,
       false,
       false,
       false,
       false,
       false,
       false,
       false,
       false,
       false
      ]
    },
    siteObj2 = {

      "host name" : "test2.com",
      "page rank" : 2,
      "pages" : ["url1", "url2", "url3", "url4"],
      "summary" : [
       4,
       4,
       0.06626506024096386,
       0.7924313533202578,
       0.5666666666666667,
       240,
       0.6054216867469879,
       332,
       0.44728915662650603,
       0.06626506024096386,
       136,
       2,
       201,
       2,
       104,
       131,
       2,
       2
      ],
      "frameworks" : [
       false,
       false,
       false,
       1,
       false,
       2,
       false,
       false,
       99,
       false,
       false
      ]
    },
    options = {
      "pageDepth" : 8
    },
    file = "./data/data.csv",
    data;
  before("Create writable stream from existing CSV file",function(done){
    var callback = function(){
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

describe("Set up environment correctly: ", function(){
  it("Spying on environment setup", function(done){
    var cb = function(arg){
      expect(arg).to.equal("ready");
      done();
    };
    write.setup(cb);
  });
});