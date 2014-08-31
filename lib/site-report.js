// TODO: Combine page report objects into a site report object
// TODO: Also, evaluate template presence and other metrics.
var write       = require('./file-io.js'),
    async       = require('async'),
    templates  = require('./template-utilisation.js');


// FEATURE: examine and report usage of the following templates, ensure exact name
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

  if (siteObj["pages"] && siteObj["pages"][0] && siteObj["pages"][0]["summary"] ){
    var newObj = {
      "host name"    : siteObj["host name"],
      "page rank"    : siteObj["page rank"],
      "pages"        : siteObj["pages"].map(function(p){return p.url})
    };

    format1 (siteObj, newObj, endCallback)

  }
  else {
    var r = {
      "host name"    : siteObj["host name"],
      "page rank"    : siteObj["page rank"],
      "error"        : true
    };
    end(r, endCallback)
  }

}

function format1 (site, newObj, endCallback){
  async.parallel([
    function(callback){
      totalUsed (site, callback);
    },
    function(callback){
      siteTemplates(site, callback);
    }
  ], function(err, results){
    if(err) throw err;
    site["selectors"] = results[0];
    site.templates = results[1];
    format2(newObj, site, endCallback);
  });
}

function format2(newObj, site, endCallback){
  async.parallel([
    function(callback){
      siteStats(site, callback);
    },
    function(callback){
      checkTemplates(site, callback);
    }
  ], function(err, results){
    if(err) throw err;
    newObj.summary    = results[0];
    newObj.templates = results[1];
    end(newObj, endCallback);
  });
}

function combine(array){
  var a = array.filter(function(n){return !isNaN(n) ? parseFloat(n).toFixed(5) : false}),
      l = a.length,
      tot = a.reduce(function(a,b){
        return a+b}, 0),
      mean = tot/ l,
      variance=0;
  // Account for single page sites
  if (l>1){
    a.map(function(i){
      variance+=Math.pow(i - mean, 2);
    });
    variance = variance/(l-1);
  }
  var sd = Math.sqrt(variance);
  return {
    m           : mean.toFixed(3),
    v           : variance.toFixed(5),
    sd          : sd.toFixed(5)
  };
}

function siteTemplates (site, callback){
  var siteTemplates = {},
      templateNames,
    p = site.pages.length;
  for (var i = 0; i<p;i+=1){
    if (site.pages[i].hasOwnProperty("templates")) {
      templateNames = Object.keys(site.pages[i].templates).sort();
      break;
    }
  }
  templateNames.map(function(f){
    siteTemplates[f] = 0;
    for (var i = 0; i<p;i+=1){
      // Take the largest template match value
      if (site.pages[i].hasOwnProperty("templates") &&
        site.pages[i].templates[f] &&
        site.pages[i].templates[f] > siteTemplates[f])
          siteTemplates[f] = site.pages[i].templates[f];
    }
    siteTemplates[f] = (siteTemplates[f] * 100).toFixed();
  });
  callback(null, siteTemplates);
}

function checkTemplates(site, callback){
  // TODO: compare pages to template identifiers
  var fwks = site.templates,
    setTemplate = function(template, percentage, callback){
      //fwks[template] = percentage;
      callback();
    },
    found = false,
    fwkQ = async.queue(function(task, callback){
      templates.record(site["host name"],
        site["page rank"],
        task.name,
        site.selectors["unique used selectors"],
        { callback: setTemplate,
          queue   : callback}
      );
    }, 4);
  fwkQ.drain = function(){
    callback(null, fwkToArray(fwks));
  };
  for (var i = 0,e=examine.length; i<e;i+=1){
    var f = examine[i];
    if (fwks[f] && fwks[f] >= 30) {
      found = true;
      fwkQ.push({name: f});
    }
  }
  // if there are no matches to queue proceed with empty
  setTimeout(function(){
    if (!found && fwkQ.length() == 0) callback(null, fwkToArray(fwks));
  }, 200);
}

function fwkToArray(fwks){
  var templates = Object.keys(fwks).sort(); // alphabetical
  return templates.map(function(f){return fwks[f] || 0}); // two decimal places
}

function totalUsed (site, callback){
  var pages = site.pages.length,
      u_unique = [], u_variance = [], u_singleOccurances,
      a_unique = [], a_variance = [], a_singleOccurances;

  site.pages.map(function(p){
    u_unique = u_unique.concat(p["used selectors"]);
    a_unique = a_unique.concat(p["selectors"]);
  });
  u_singleOccurances = u_unique.filter(function(o){
    // Get all used selectors that were only used once (only on a single page)
    return u_unique.indexOf(o) == u_unique.lastIndexOf(o);
  });
  a_singleOccurances = a_unique.filter(function(o){
    // Get all used selectors that were only used once (only on a single page)
    return a_unique.indexOf(o) == a_unique.lastIndexOf(o);
  });
  for (var i = 0;i<pages;i++){
    // Record for each page how many selectors only occur on that page
    u_variance.push(u_singleOccurances.filter(function(s){
      return site.pages[i]["used selectors"].indexOf(s) >= 0;
    }).length);
    a_variance.push(a_singleOccurances.filter(function(s){
      return site.pages[i]["selectors"].indexOf(s) >= 0;
    }).length);
  }

  var r = {
    "used selector variance" : {selectors: u_variance, stats: combine(u_variance)},
    "unique used selectors"  : u_unique.sort().filter(function(elem, pos, self) {
      return self.indexOf(elem) == pos;
    }),
    "selector variance" : {selectors: a_variance, stats: combine(a_variance)},
    "unique selectors"  : a_unique.sort().filter(function(elem, pos, self) {
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
      "tot used sels"             : site.selectors["unique used selectors"].length,
      "tot sels"                  : site.selectors["unique selectors"].length,
      "sheets"                    : m("sheets"),
      "abstractness"              : m("abstractness"),
      "average scope"             : m("average scope"),
      "selectors"                 : m("unique selectors"),
      "dom elements"              : m("dom elements"),
      "c2p"                       : m("c2p"),
      "selector redundancy"       : m("selector redundancyU"),
      "rule redundancy"           : m("rule redundancy"),
      "universality"              : m("universality"),
      "universalityK"             : m("universalityK"),
      "used rules"                : m("used rules"),
      "used selectors"            : m("used selectorsU")
    };
  /* -- Sample order expected by file-io
  summary = [
    "pages crawled",
    "tot used sels",
    "tot sels",
    "site selector redundancy",
    "site-wide style variability",

    "sheets_m",
    "sheets_sd",

    "dom elements_m",
    "dom elements_sd",

    "c2p_m",
    "c2p_sd",

    "abstractness_m",
    "abstractness_sd",

    "avg scope_m",
    "avg scope_sd",

    "universality_m",
    "universality_sd",

    "universalityK_m",
    "universalityK_sd",

    "rule redundancy_m",
    "rule redundancy_sd",

    "selector redundancy_m",
    "selector redundancy_sd",

    "selectors_m",
    "selectors_sd",

    "used rules_m",
    "used rules_sd",

    "used selectors_m",
    "used selectors_sd"
  ]
  */

  var report = [
    site["page count"],
    c["tot used sels"],
    c["tot sels"],
    (100 * (1 - (c["tot used sels"]/ c["tot sels"]))).toFixed(2),
    (100*(c.selectors.sd/c.selectors.m)).toFixed(2),

    c.sheets.m,
    c.sheets.sd,

    c["dom elements"].m,
    c["dom elements"].sd,

    (c["c2p"].m * 100).toFixed(2),
    (c["c2p"].sd * 100).toFixed(2),

    c.abstractness.m,
    c.abstractness.sd,

    c["average scope"].m,
    c["average scope"].sd,

    c.universality.m,
    c.universality.sd,

    c.universalityK.m,
    c.universalityK.sd,
    
    (c["rule redundancy"].m * 100).toFixed(2),
    (c["rule redundancy"].sd * 100).toFixed(2),

    (c["selector redundancy"].m * 100).toFixed(2),
    (c["selector redundancy"].sd * 100).toFixed(2),

    c.selectors.m,
    c.selectors.sd,

    c["used rules"].m,
    c["used rules"].sd,

    c["used selectors"].m,
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
  checkTemplates : checkTemplates,
  totalUsed       : totalUsed
}};