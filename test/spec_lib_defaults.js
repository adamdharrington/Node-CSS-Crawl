var expect = require("chai").expect,
    defaults  = require("../lib/defaults.js");

describe('Can be called with no arguments', function(){
  var opts;
  before('call load',function(done){
    opts = defaults.load([]);
    done();
  });
  it('expect default declaration', function(){
    expect(opts.list).to.equal("alexa");
  });
  it('expect well known sampleMethod value', function(){
    expect(opts.sampleMethod).to.equal("TOP");
  });
});

describe('Can change values', function(){
  var opts;
  before('call defaults with new args',function(done){
    opts = defaults.load(["otherlist", 10, 20, "random"]);
    done();
  });
  it('expect new list declaration', function(){
    expect(opts.list).to.equal("otherlist");
  });
  it('expect well known sampleMethod value', function(){
    expect(opts.sampleMethod).to.equal("RANDOM");
  });
});

describe('Cannot use unrecognised sampleMethod value', function(){
  var opts;
  before('call defaults with new args',function(done){
    opts = defaults.load(["otherlist", 10, 20, "hello"]);
    done();
  });
  it('expect revert to default sampleMethod value', function(){
    expect(opts.sampleMethod).to.equal("TOP");
  });
});