var expect = require("chai").expect,
  fs       = require("fs"),
  getList  = require("../lib/get-sources-list.js");

describe('file: \/lib\/get-sources.js, list of URLs related operations: ', function(){

  describe("Parsing CSV file to common object: ",function(){
    describe("Test sampling from TOP: ",function(){
      var o;
      before("Options",function(done){
        var options = {
          list         : "test/lib/sampledata.csv",
          samples      : 1,
          sampleSize   : 1,
          sampleMethod : "TOP"
        };
        var d = function(err, obj){
          if(err) throw err;
          o = obj;
          done();
        };
        getList.readList(options, d);
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
        expect(o.samples.sample1.length).to.equal(1);
        done();
      });
      it("top result is 'google'",function(done){
        expect(o.samples.sample1[0]["host name"]).to.equal("google.com");
        done();
      });
    });

    describe("Test sampling from MID: ",function(){
      var o;
      before("Options",function(done){
        var options = {
          list         : "test/lib/sampledata.csv",
          samples      : 4,
          sampleSize   : 4,
          sampleMethod : "MID"
        };
        var d = function(err, obj){
          if(err) throw err;
          o = obj;
          done();
        };
        getList.formatLists(options, d);
      });
      it("Correct number of samples",function(done){
        expect(Object.keys(o.samples).length).to.equal(4);
        done();
      });
      it("Correct number of results",function(done){
        expect(o.samples.sample1.length).to.equal(4);
        done();
      });
      it("first MID result is 'yahoo.com'",function(done){
        expect(o.samples.sample1[0]["host name"]).to.equal("yahoo.com");
        done();
      });
    });

    describe("Test sampling from RANDOM: ",function(){
      var o;
      before("Options",function(done){
        var options = {
          list         : "test/lib/sampledata.csv",
          samples      : 1,
          sampleSize   : 1,
          sampleMethod : "RANDOM"
        };
        var d = function(err, obj){
          if(err) throw err;
          o = obj;
          done();
        };
        getList.formatLists(options, d);
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
});
