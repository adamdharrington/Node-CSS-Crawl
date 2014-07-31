var _AJAX=function(a){return _AJAX.get(a)};_AJAX.n=function(a){return a?"string"==typeof a?{url:a}:a:!1},_AJAX.json=function(a){return(a=_AJAX.n(a))?(a.json=!0,new _AJAX.r(a)):void 0},_AJAX.get=function(a){return new _AJAX.r(a)},_AJAX.post=function(a){return(a=_AJAX.n(a))?(a.method="POST",new _AJAX.r(a)):void 0},_AJAX.r=function(a){if(!a)return!1;if("string"==typeof a&&(a={url:a}),"POST"===a.method){var b="?";for(var c in a.options)b+=a.options.hasOwnProperty(c)?"&"+c+"="+a.options[c]:""}else{a.method="GET",a.url+=a.url.indexOf("?")<0?"?":"";for(var c in a.options)a.url+=a.options.hasOwnProperty(c)?"&"+c+"="+a.options[c]:""}this.x=window.XMLHttpRequest?new XMLHttpRequest:new ActiveXObject("Microsoft.XMLHTTP"),this.x.o=a,this.x.c={t:[],e:[]},this.then=function(a){return this.x.c.t.push(a),this},this.error=function(a){return this.x.c.e.push(a),this},this.x.l=function(a,b){for(var c=0;c<this.c[a].length;c++)"function"==typeof this.c[a][c]&&this.c[a][c](b)},this.x.y=function(a){this.l("t",a)},this.x.z=function(a){this.l("e",a)},this.x.onreadystatechange=function(){if(4===this.readyState&&200==this.status){var a={data:this.responseText,url:this.o.url};if(this.o.json)try{a=JSON.parse(a)}catch(b){return this.z("invalid json"),!1}this.y(a)}else 4===this.readyState&&404==this.status?this.z("404"):4===this.readyState&&this.z("unknow")},this.x.open(a.method,a.url,!0),this.x.setRequestHeader("Content-type","application/x-www-form-urlencoded"),this.x.send("undefined"!=typeof b?b:null)};
(function(w){
  w.__styleSheets = new Array();
  var a = w.document.styleSheets;
  for (var i=0;i<a.length;i++){
    var t = a[i];
    if(t.hasOwnProperty("cssRules") && t.cssRules === null && t.href !== null){
      var source = t.href;
      _AJAX(source).then(function (res) {
        var url = res.url.split("?")[0];
        var style_tag = document.createElement('style');
        style_tag.appendChild(document.createTextNode(res.data));
        document.head.appendChild(style_tag);
        w.__styleSheets.push({
          remote: true,
          href: url,
          cssRules: style_tag.sheet.cssRules
        });
      });
    }
    else if (t.hasOwnProperty("cssRules") && t.cssRules !== null){
      w.__styleSheets.push({
        remote: false,
        href: t.href,
        cssRules: t.cssRules
      })
    }
  }
})(window);
(function(w){
  // TODO: keep this object clean of external references, only use values
  w.__STYLES = {
    "url"          : w.location.href,
    "summary"      : {
      "sheets"           : 0
    },
    "style sheets" : [],
    "selectors"    : {

    }
  };
  // TODO: Wrapper function, don't access window.__STYLES directly
  w.__SF = (function(site){
    var helpers = {
        uniqueOnly : function(array){
          return array.filter(function(i){return array.indexOf(i) == array.lastIndexOf(i)});
        },
        pseudo : function(key){
          // TODO: take in key selector, return same minus any problematic pseudo elements
          var pR = /(\:.*)/,
            newKey, pseudo;
          pseudo = pR.exec(key);
          if (pseudo){
            if (!(/(?:empty)|(?:-child)|(?:-of-type)|(?:\:not)/.test(pseudo))){
              newKey = key.substr(0,key.length - pseudo[0].length);
              return newKey.length > 0 ? newKey : "*";
            }
            return key;
          }
          else return key;
        },
        scopeCalc : function(domCount){
          var sels = site.selectors,
            sumOfScopes = 0,selCount = 0;
          for(var selector in sels){
            if (!sels.hasOwnProperty(selector)) break;
            selCount += sels[selector].references.length;
            sumOfScopes += sels[selector]["scope size"] * sels[selector].references.length;
          }
          return (sumOfScopes/(selCount*domCount));
        },
        sellType: function(key){
          if (key.indexOf("#")>=0) return "id";
          if (key.indexOf(".")>=0) return "class";
          if (key.indexOf("*")>=0) return "universal";
          else return "element";
        },
        sellOut : function(selector){
          // feature: Must clean key selector of pseudo elements and classes prior to search
          var scopeArr   = selector.split(/[\s\>~\+]+/),
            key          = scopeArr.pop(),
            pseudoFix    = helpers.pseudo(key),
            scopeTxt     = selector.substr(0, (selector.length - key.length)),
            combinator   = scopeTxt.substr(
              scopeTxt.lastIndexOf(scopeArr[scopeArr.length-1])+1
            ),
            comType = "NONE",
          // search pseudo elements as elements
            qs = w.document.querySelectorAll(scopeTxt + pseudoFix).length || 0;

          if (/[\>]/.test(combinator))      comType = "CHILD";
          else if (/[~]/.test(combinator))  comType = "GSIB";
          else if (/[\+]/.test(combinator)) comType = "NSIB";
          else if (/\*\s/.test(combinator)) comType = "GCHILD";
          else if (/\s/.test(combinator))   comType = "DESC";
          return {
            "key selector"     : key,
            "key type"         : helpers.sellType(pseudoFix),
            "matched elements" : qs,
            "scope text"       : scopeTxt,
            "combinator type"  : comType,
            "scope length"     : scopeArr.length,
            "scope size"       : document.querySelectorAll(scopeTxt + "*").length
          }
        },
        countChildren : function(parent){
          var count,pa;
          !parent ? count = 2 : count = 0;
          pa = parent || document.body;
          return count + pa.getElementsByTagName("*").length;
        },
        listIDs : function(){
          var ids = document.body.querySelectorAll("*[id]"),
            idList = [], nonUniqueIds = [];
          for (var id = 0; id< ids.length;id++){
            var tmp = ids[id].id;
            if (idList.indexOf(tmp) < 0)idList.push(tmp);
            else nonUniqueIds.push(tmp);
          }
          return {
            "elements with ids": ids.length,
            "ids" : idList,
            "repeated ids" : nonUniqueIds
          };
        },
        listClasses : function(){
          var classes = document.body.querySelectorAll("*[class]"),
            list = [], unique;
          for (var c = 0; c < classes.length;c++){
            var tmp = Array.prototype.map.call(classes[c].classList, function(e){return e;});
            list = list.concat(tmp);
          }
          unique = helpers.uniqueOnly(list);
          return {
            "classes"               : list.sort(),
            "elements with classes" : list.length,
            "unique classes"        : unique.sort()
          };
        }
      },
      addSheet = function(sheet){
        var i = site["style sheets"].push({"href": sheet.href});
        site.summary.sheets += 1;
        return i - 1;
      },
      addSheetInfo= function(index, obj){
        for (var property in obj){
          if (obj.hasOwnProperty(property))
            site["style sheets"][index][property] = (obj[property]);
        }
      },
      editSheet= function(index, property, value){
        if (property == "@imports")
          site["style sheets"][index][property].push(value);
        else
          site["style sheets"][index][property] += value;
      },
      addSelector = function(st, si, ri, pl){
        var effective = false,
          keyType = "";
        if(site.selectors.hasOwnProperty(st)){
          // update existing selector
          var sel = site.selectors[st];
          if (sel["matched elements"]>0) effective=true;
          keyType = sel["key type"];
          sel.references.push({
            "sheet"          : si,
            "rule"           : ri,
            "property count" : pl.length
          });
          sel["properties set"] = helpers.uniqueOnly(
            sel["properties set"].concat(pl)
          );
          sel["property count"] += pl.length;
          sel["avg properties"] = sel["property count"] / sel.references.length;
        }
        else {
          // create a new selector entry

          var scope = helpers.sellOut(st);
          if (scope["matched elements"]>0) effective=true;
          keyType = scope["key type"];
          site.selectors[st] = {
            "references"       : [
              {
                "sheet"          : si,
                "rule"           : ri,
                "property count" : pl.length
              }
            ],
            "matched elements" : scope["matched elements"],
            "key selector"     : scope["key selector"],
            "key type"         : keyType,
            "scope text"       : scope["scope text"],
            "combinator type"  : scope["combinator type"],
            "scope length"     : scope["scope length"],
            "scope size"       : scope["scope size"],
            "properties set"   : pl,
            "property count"   : pl.length,
            "avg properties"   : pl.length
          }
        }
        return {eff:effective,keyType: keyType};
      },
      tally = function(){
        var de = helpers.countChildren(),
          dom = {
            "dom elements"    : de,
            "ids"             : helpers.listIDs(),
            "classes"         : helpers.listClasses(),
            "c2p"             : 1
          },
          tot = {
            "sheets"           : site.summary.sheets,
            "rules"            : 0,
            "used rules"       : 0,
            "unused rules"     : 0,
            "selectors"        : 0,
            "used selectors"   : 0,
            "unused selectors" : 0,
            "element selectors": 0,
            "class selectors"  : 0,
            "dom elements"     : de,
            "universality"     : 0,
            "universalityK"    : 0,
            "avgerage scope"   : helpers.scopeCalc(de),
            "abstractness"     : 0
          },
          s= site["style sheets"],
          i,l= s.length;

        for (i=0;i<l;i++){
          tot["rules"]             += s[i]["all rules"];
          tot["used rules"]        += s[i]["effective rules"];
          tot["unused rules"]      += (s[i]["all rules"] - s[i]["effective rules"]);
          tot["selectors"]         += s[i]["selector count"];
          tot["used selectors"]    += s[i]["used selectors"];
          tot["unused selectors"]  += s[i]["unused selectors"];
          tot["element selectors"] += s[i]["element keys"];
          tot["class selectors"]   += s[i]["class keys"];
        }
        tot["universality"]        = (tot["element selectors"] + (tot["class selectors"] * .5)) / tot["selectors"];
        tot["universalityK"]       = tot["element selectors"] / tot["selectors"];
        tot["abstractness"]        = Math.min(tot["universalityK"],tot["avgerage scope"]);
        tot["selector redundancy"] = tot["unused selectors"] / tot["selectors"];
        tot["rule redundancy"]     = tot["unused rules"] / tot["rules"];
        dom.c2p = (
          (Math.sqrt(de*(
            dom.ids["elements with ids"] + dom.classes["elements with classes"]
            ))/de)
          );
        site.summary  = tot;
        site.document = dom;
      };
    return {
      addSheet        : function(s){return addSheet(s)},
      addSheetInfo    : function(i,info){return addSheetInfo(i,info)},
      editSheet       : function(i,p,v){return editSheet(i,p,v)},
      addSelector     : function(selectorText, sheetIndex, ruleIndex, propertyList){
        return addSelector(selectorText, sheetIndex, ruleIndex, propertyList);
      },
      complete        : function(){return tally();}
    };
  })(w.__STYLES);

  var processSheet = function(report, sheet, sheetIndex){
      /*
       TODO: Convert style sheet to an array of rules, DONE
       TODO:
       */
      var allRules = Array.prototype.map.call(sheet.cssRules,function(r){return r}),
        sheetInfo = {
          "all rules"      : allRules.length,
          "ignored rules"  : 0,
          "rule count"     : 0,
          "effective rules": 0,
          "unused rules"   : 0,
          "@import rules"  : 0,
          "@imports"       : [],
          "@media rules"   : 0,
          "@media inner"   : 0,
          "@charset rules" : 0,
          "@keyframe rules": 0,
          "@font-face rules": 0,
          "@supports rules": 0,
          "@supports inner": 0,
          "selector count" : 0,
          "used selectors" : 0,
          "unused selectors": 0,
          "id keys"        : 0,
          "class keys"     : 0,
          "universal keys" : 0,
          "element keys"   : 0,
          "declarations"   : 0,
          "selector redundancy" : 0,
          "rule redundancy" : 0
        },
        processRules = function(array, info){

          for (var ri = 0; ri < array.length; ri++){
            var rule = array[ri];
            if (rule.type === 3 && rule.styleSheet) {
              // TODO: add import rule to current sheet count
              info["@import rules"]+=1;
              info["rule count"]+=1;
              info["@imports"].push(ri);
              // TODO: add style sheet to global list
              var newIndex = report.addSheet(rule.styleSheet);
              processSheet(report, rule.styleSheet, newIndex);
            }
            else if (rule.cssRules && rule.cssRules !== null){
              // TODO: Add media and supports rule to count
              var ruleLen = rule.cssRules.length,
                at;
              if(rule.type === 4)  at = "@media"; //media
              if(rule.type === 12) at = "@supports"; //@supports
              info[at+" rules"]+=1;
              info["rule count"]+=1;
              info["all rules"] += ruleLen;
              info[at+" inner"] += ruleLen;
              array.concat(rule.cssRules);
            }
            else if (rule.selectorText){
              // TODO: divide into selectors
              // TODO: add selector function with rule and sheet index
              // TODO: list properties, advance properties[property]++
              info["rule count"]+=1;
              var props = getProperties(rule),
                sellBlock = rule.selectorText.split(","),
                effective = false;
              info.declarations += props.length;
              for(var seli in sellBlock) {
                info["selector count"]++;
                var sel = sellBlock[seli].trim().toString();
                //TODO: check is selector was used
                if (sel.length>0) var result = report.addSelector(sel,sheetIndex,ri,props);
                if(result.eff) {
                  effective = true;
                  info["used selectors"]++;
                }
                else info["unused selectors"]++;
                if (result.keyType != "") info[""+result.keyType+" keys"]++;
              }
              // single used selector constitutes used rule
              if(effective) info["effective rules"] +=1;
            }
            else if(rule.type === 7 || rule.type === 8) {
              // Keyframes have two types - ignore, no declarations
              info["@keyframe rules"]+=1;
              info["ignored rules"]+=1;
            }
            else if(rule.type === 5) {
              // Font-face Rule - ignore, no declarations
              info["@font-face rules"]+=1;
              info["ignored rules"]+=1;
            }
            else if(rule.type === 2) {
              // Charset Rule - ignore, no declarations
              info["@charset rules"]+=1;
              info["ignored rules"]+=1;
            }
            else {
              // Ignore all others but record skipped rules
              info["ignored rules"]++;
            }
          }
          // AFTER all rules are calculated
          //TODO: Add sheet stats
          info["unused rules"] = info["all rules"] - info["effective rules"];
          info["selector redundancy"] = info["unused selectors"] / info["selector count"];
          info["rule redundancy"] = info["unused rules"] / info["all rules"];
        },
        getProperties = function(rule){
          var props = [];
          if (rule.hasOwnProperty("style") && rule.style.length > 0){
            for (var propi = 0, len = rule.style.length; propi < len; propi++){
              props.push(rule.style[propi]);
            }
          }
          return props;
        };
      processRules(allRules, sheetInfo);
      w.__SF.addSheetInfo(sheetIndex, sheetInfo);
    },
    calculateSummary = function(report){
      report.complete();
    },
    processSheets = function(){
      for (var sheet in w.__styleSheets){
        var sheetIndex = w.__SF.addSheet(w.__styleSheets[sheet]);
        processSheet(w.__SF, w.__styleSheets[sheet], sheetIndex);
      }
      calculateSummary(w.__SF);
    };


  // CALL Function - after timeout for ajax
  setTimeout(function(){
    processSheets();
  },400);

})(window);