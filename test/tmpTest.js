var expect = require('chai').expect,
  create  = require('../lib/file-io.js').create,
  fs     = require('fs');

describe("test that create creates: ",function(){

  create(8,"./test/data","./test/data/head.csv","head.csv");
  it("should exist",function(){
    setTimeout(function(){
      expect(fs.existsSync("./test/data/head.csv")).to.be.true;
    },200);
  });

});