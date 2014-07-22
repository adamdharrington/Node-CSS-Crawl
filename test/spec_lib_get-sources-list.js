var expect = require("chai").expect,
  getList  = require("../lib/get-sources-list.js");

describe("test sampling from top",function(){
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

  it("Correct number of results",function(done){
    expect(o.sample1.length).to.equal(Opts.sampleSize);
    done();
  });
  it("top result is 'google'",function(done){
    expect(o.sample1[0]).to.equal("google.com");
    done();
  });
});

describe("test sampling from mid",function(){
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
    expect(o.sample1.length).to.equal(Opts.sampleSize);
    done();
  });
  it("MID result is 'yahoo.co.jp'",function(done){
    expect(o.sample1[0]).to.equal("yahoo.co.jp");
    done();
  });
});

describe("test sampling from RANDOM",function(){
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
    expect(o.sample1.length).to.equal(1);
    done();
  });
  it("Is a result with string type",function(done){
    expect(typeof o.sample1[0]).to.equal("string");
    done();
  });
  it("Is a non-empty result",function(done){
    expect(o.sample1[0].length).to.be.above(1);
    done();
  });
});