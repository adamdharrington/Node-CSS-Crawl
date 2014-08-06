var expect  = require("chai").expect,
    fw      = require("../lib/identify-frameworks.js"),
    fs      = require("fs");
 
describe('should create file that does not exist', function(){
  var sampleFW = ["html", "body", "article", "aside", "details", "figcaption", "figure", "footer", "header"];
  it('Test "bootstrap-v3"', function(done){

    fw.record ("test.com", 2, "bootstrap-v3", sampleFW, function(){
      expect(fs.existsSync("./data/frameworks/bootstrap-v3.csv")).to.not.equal(false);
      done();
    });
  });
});// TODO: Match Frameworks