// TODO: Need to employ child process to test
//var expect      = require("chai").expect,
//    requireFrom = require("require-from");
//    cleanUrls   = requireFrom("testexports", "../lib/site-process-init.js").cleanUrls;
//
//describe('Test RegExpressions', function(){
//  var dirtyUrls = [
//    "http://example.com/",
//    "http://example.com/fdd?primary-nav",
//    "http://example.com/fdd",
//    "http://example.com/#integrated-approach",
//    "http://example.com/gdfdffd#integrated-approach?primary-nav",
//    "http://example.com/gdfdffd?integrated-approach#primary-nav",
//    "http://example.com/gdfdffd#integrated-approach"
//  ],
//    cleanedUrls = [
//    "http://example.com/",
//    "http://example.com/fdd",
//    "http://example.com/fdd",
//    "http://example.com/",
//    "http://example.com/gdfdffd",
//    "http://example.com/gdfdffd",
//    "http://example.com/gdfdffd"
//  ];
//  it('Query should remove queries and anchors', function(){
//      expect(cleanUrls(dirtyUrls)).to.equal(cleanedUrls);
//  });
//});