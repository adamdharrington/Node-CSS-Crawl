var expect = require("chai").expect,
    g      = require("../lib/http-requests.js").getFile;
    fs     = require("fs");

describe('file: \/lib\/http-requests.js, wrapper for get requests', function(){
  describe('Test small http requests', function(){
    var file = "http://assets.tumblr.com/images/default_avatar_40.png",
        directory = "./test/data/";
    before('do get and file write', function(done){
      g(file,directory,function(err,dir){done();})
    });
    after('Remove directory and file',function(done){
      fs.unlink(directory+"default_avatar_40.png", function(err){
        if (err)throw err;
         done();
      });
    });

    it('Test that file was downloaded and written to disk', function(done){
      expect(fs.existsSync(directory+"default_avatar_40.png")).to.equal(true);
      done();
    });
  });
});