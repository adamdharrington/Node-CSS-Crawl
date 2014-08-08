// TODO: Combine page report objects into a site report object
// TODO: Also, evaluate framework presence and other metrics.
var write      = require('./file-io.js'),
    async       = require('async'),
    frameworks = require('./identify-frameworks.js');


// FEATURE: examine and report usage of the following frameworks, ensure exact name
var examine = [
  "bootstrap-v1",
  "bootstrap-v2",
  "bootstrap-v3",
  "foundation-v3",
  "foundation-v4",
  "foundation-v5",
  "jquery-ui-v1-11",
  "kendo-ui-v2",
  "pure-v0-5"
];

function report(siteObj, endCallback){
  // TODO: create all unique selectors, recreate accurate redundancy metrics
  var newObj = {
    "host name"    : siteObj["host name"],
    "page rank"    : siteObj["page rank"],
    "pages"        : siteObj["pages"].map(function(p){return p.url})
  };


  format1 (siteObj, newObj, endCallback)

}

function format1 (site, newObj, endCallback){
  async.parallel([
    function(callback){
      totalUsed (site, callback);
    },
    function(callback){
      siteFrameworks(site, callback);
    }
  ], function(err, results){
    if(err) throw err;
    site["selector variance"] = results[0]["selector variance"];
    site["unique selectors"]  = results[0]["unique selectors"];
    site.frameworks = results[1];
    format2(newObj, site, endCallback);
  });
}

function format2(newObj, site, endCallback){
  async.parallel([
    function(callback){
      siteStats(site, callback);
    },
    function(callback){
      checkFrameworks(site, callback);
    }
  ], function(err, results){
    if(err) throw err;
    newObj.summary    = results[0];
    newObj.frameworks = results[1];
    end(newObj, endCallback);
  });
}

function combine(array){
  var l = array.length,
      tot = array.reduce(function(a,b){return a+b}),
      mean = tot/ l,
      variance=0;
  array.map(function(i){
    variance+=Math.pow(i - mean, 2);
  });
  var sd = Math.sqrt(variance = variance/(l-1));
  return {
    m           : mean.toFixed(3),
    v           : variance.toFixed(5),
    sd          : sd.toFixed(5)
  };
}

function siteFrameworks (site, callback){
  var siteFrameworks = {},
      frameworkNames = Object.keys(site.pages[0].frameworks),
    p = site.pages.length;
  frameworkNames.map(function(f){
    siteFrameworks[f] = 0;
    for (var i = 0; i<p;i+=1){
      if (site.pages[i].frameworks[f] && site.pages[i].frameworks[f] > siteFrameworks[f])
        siteFrameworks[f] = site.pages[i].frameworks[f];
    }
  });
  callback(null, siteFrameworks);
}

function checkFrameworks(site, callback){
  // TODO: compare pages to framework identifiers
  var fwks = site.frameworks,
    setFramework = function(framework, percentage, callback){
      fwks[framework] = percentage;
      callback();
    },
    fwkQ = async.queue(function(task, callback){
      frameworks(site["host name"],
        site["page rank"],
        task.name,
        site["unique selectors"],
        { callback: setFramework,
          queue   : callback}
      );
    }, 4);
  fwkQ.drain = function(){
    callback(null, fwkToArray(fwks));
  };
  for (var i = 0,e=examine.length; i<e;i+=1){
    var f = examine[i];
    if (fwks[f] && fwks[f] >= .5) {
      fwkQ.push({name: f});
    }
  }

  if (fwkQ.length() == 0) callback(null, fwkToArray(fwks));
}

function fwkToArray(fwks){
  var frameworks = Object.keys(fwks).sort(); // alphabetical
  return frameworks.map(function(f){return fwks[f].toFixed(2) || 0}); // two decimal places
}

function totalUsed (site, callback){
  var pages = site.pages.length,
      unique = [], variance = [], singleOccurances;

  site.pages.map(function(p){
    unique = unique.concat(p["used selectors"]);
  });
  singleOccurances = unique.filter(function(o){
    return unique.indexOf(o) == unique.lastIndexOf(o);
  });
  for (var i = 0;i<pages;i++){
    variance.push(singleOccurances.filter(function(s){
      return site.pages[i]["used selectors"].indexOf(s) >= 0;
    }).length);
  }
  var r = {"selector variance" : {selectors: variance, stats: combine(variance)},
    "unique selectors"   : unique.sort().filter(function(elem, pos, self) {
      return self.indexOf(elem) == pos;
    })
  };
  callback(null, r);
}
function siteStats (site, callback){
  // TODO: Create a report object with summarised data
  var m = function(prop){
      return combine(site.pages.map(function(p){return p.summary[prop]}));
    },
    c ={
      "sheets"                    : m("sheets"),
      "abstractness"              : m("abstractness"),
      "average scope"             : m("average scope"),
      "selectors"                 : m("selectors"),
      "dom elements"              : m("dom elements"),
      "tot used sels"             : site["unique selectors"].length,
      "selector redundancy"       : m("selector redundancy"),
      "rule redundancy"           : m("rule redundancy"),
      "universality"              : m("universality"),
      "universalityK"             : m("universalityK"),
      "used rules"                : m("used rules"),
      "used selectors"            : m("used selectors")
    };
  /* -- Sample order expected by file-io
  summary = [
    "pages crawled",
    "tot used sels",
    "site selector redundancy",

    "m  sheets",
    "v  sheets",
    "sd sheets",

    "m  dom elements",
    "v  dom elements",
    "sd dom elements",

    "m  abstractness",
    "v  abstractness",
    "sd abstractness",

    "m  avg scope",
    "v  avg scope",
    "sd avg scope",

    "m  rule redundancy",
    "v  rule redundancy",
    "sd rule redundancy",

    "m  selector redundancy",
    "v  selector redundancy",
    "sd selector redundancy",

    "m  selectors",
    "v  selectors",
    "sd selectors",

    "m  universality",
    "v  universality",
    "sd universality",

    "m  universalityK",
    "v  universalityK",
    "sd universalityK",

    "m  used rules",
    "v  used rules",
    "sd used rules",

    "m  used selectors",
    "v  used selectors",
    "sd used selectors"

  ]
  */

  var report = [
    site["page count"],
    c["tot used sels"],
    c["tot used sels"]/ c.selectors.m,

    c.sheets.m,
    c.sheets.v,
    c.sheets.sd,

    c["dom elements"].m,
    c["dom elements"].v,
    c["dom elements"].sd,

    c.abstractness.m,
    c.abstractness.v,
    c.abstractness.sd,

    c["average scope"].m,
    c["average scope"].v,
    c["average scope"].sd,

    c["rule redundancy"].m,
    c["rule redundancy"].v,
    c["rule redundancy"].sd,

    c["selector redundancy"].m,
    c["selector redundancy"].v,
    c["selector redundancy"].sd,

    c.selectors.m,
    c.selectors.v,
    c.selectors.sd,

    c.universality.m,
    c.universality.v,
    c.universality.sd,

    c.universalityK.m,
    c.universalityK.v,
    c.universalityK.sd,

    c["used rules"].m,
    c["used rules"].v,
    c["used rules"].sd,

    c["used selectors"].m,
    c["used selectors"].v,
    c["used selectors"].sd

  ];
  callback(null,report);
}

function end(report, callback){
  return callback(report);
}


exports.site        = function(siteObj, callback){return report(siteObj, callback);};
exports.unitTests   = function(){return{
  siteStats       : siteStats,
  combine         : combine,
  checkFrameworks : checkFrameworks,
  totalUsed       : totalUsed
}};