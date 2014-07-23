var expect = require("chai").expect,
  getList  = require("../lib/get-sources-list.js");

describe("Parsing CSV file to common object: ",function(){
  describe("Test sampling from TOP: ",function(){
    var o;
    before("setup globals",function(done){
      GLOBAL.Opts = {
        samples       : 1,
        sampleSize   : 1,
        sampleMethod : "TOP"
      };
      var d = function(err, obj){
        if(err) throw err;
        o = obj;
        done();
      };
      getList.formatLists("test/lib/sampledata.csv", d);
    });
    it("Format of object",function(done){
      expect(o).to.have.property("samples");
      expect(o).to.have.property("sampling info");
      expect(o["sampling info"]).to.have.property("sample size");
      expect(o["sampling info"]).to.have.property("sample count");
      expect(o["sampling info"]).to.have.property("sample method");
      done();
    });
    it("Correct number of results",function(done){
      expect(o.samples.sample1.length).to.equal(Opts.sampleSize);
      done();
    });
    it("top result is 'google'",function(done){
      expect(o.samples.sample1[0]["host name"]).to.equal("google.com");
      done();
    });
  });

  describe("Test sampling from MID: ",function(){
    var o;
    before("setup globals",function(done){
      GLOBAL.Opts = {
        samples       : 1,
        sampleSize   : 1,
        sampleMethod : "MID"
      };
      var d = function(err, obj){
        if(err) throw err;
        o = obj;
        done();
      };
      getList.formatLists("test/lib/sampledata.csv", d);
    });

    it("Correct number of results",function(done){
      expect(o.samples.sample1.length).to.equal(Opts.sampleSize);
      done();
    });
    it("MID result is 'yahoo.co.jp'",function(done){
      expect(o.samples.sample1[0]["host name"]).to.equal("yahoo.co.jp");
      done();
    });
  });

  describe("Test sampling from RANDOM: ",function(){
    var o;
    before("setup globals",function(done){
      GLOBAL.Opts = {
        samples       : 1,
        sampleSize   : 1,
        sampleMethod : "RANDOM"
      };
      var d = function(err, obj){
        if(err) throw err;
        o = obj;
        done();
      };
      getList.formatLists("test/lib/sampledata.csv", d);
    });

    it("Correct number of results",function(done){
      expect(o.samples.sample1.length).to.equal(1);
      done();
    });
    it("Is a result with string type",function(done){
      expect(typeof o.samples.sample1[0]["host name"]).to.equal("string");
      done();
    });
    it("Is a non-empty result",function(done){
      expect(o.samples.sample1[0]["host name"].length).to.be.above(1);
      done();
    });
  });
});