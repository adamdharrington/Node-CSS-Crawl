var fw      = require("../lib/template-utilisation.js"),
    fs      = require("fs");


describe('file: \/lib\/template-utilisation.js, template related operations: ', function(){

  describe('Test identification ', function(){
    var sampleFW = ["html", "body", "article", "aside", "details", "figcaption", "figure", "footer", "header"];
    before("setup \"for-unit-tests-only\" ", function(done){
      var file = "data/templates/for-unit-tests-only.csv";
      fs.exists(file, function(exists){
        if(exists){
          fs.unlink(file, function(err){
            if (err)throw err;
            done();
          });
        }
        else done();
      })
    });

    it('Test unknown css Template', function(done){
      var cb = sinon.spy(function(){
        done();
      });

      fw.record ("test.com", 100, "makyuppy", sampleFW, {callback:cb, queue:"mock"});
      expect(cb.calledOnce).to.equal(true);
      expect(cb).to.have.been.calledWith("makyuppy", 0, "mock");
    });

    it('Test "for-unit-tests-only" make new and write', function(done){
      var cb = sinon.spy(function(){
        expect(fs.existsSync("./data/templates/for-unit-tests-only.csv")).to.be.ok;
        expect(cb).to.have.been.calledWith("for-unit-tests-only", (90).toFixed(2), "mock");
        done();
      });
      fw.record ("test.com", 2, "for-unit-tests-only", sampleFW, {callback:cb, queue:"mock"});

    });

    after("teardown \"for-unit-tests-only.csv\" ",function(done){
      var file = "data/templates/for-unit-tests-only.csv";
      fs.exists(file, function(exists){
        if(exists){
          fs.unlink(file, function(err){
            if (err)throw err;
            done();
          });
        }
        else done();
      })
    })
  });
});