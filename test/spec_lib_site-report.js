var expect   = require("chai").expect,
    report   = require("../lib/site-report.js");
 
describe('Test report method: ', function(){
  var tr = {
    "host name" : "google.com",
    "page rank" : 1,
    "page count": 5,
    "site stats": "todo",
    "frameworks": "todo",
    "pages"     : [{url:"",sels:"yes"},{url:"",sels:"yes"},{url:"",sels:"yes"}]
  };

  it('Should return object', function(){
    var ex = function(report){
      expect(report["host name"]).to.equal("google.com");
    };
    report.site(tr,ex);
  });
});