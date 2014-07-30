(function(w){
  // TODO: keep this object clean of external references, only use values
  w.__STYLES = {
    "url" : w.location.href,
    "summary" : {
      "sheets" : 0,
      "rule count" : 0,
      "selector count" : 0,
      "unique selectors" : 0,
      "average scope"    : 0,
      "uniqueness"       : 0
    },
    "style sheets" : [],
    "selectors"   : {

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
      sellOut : function(selector){
        // FIXME: IMPORTANT
        /*
         feature: Must clean key selector of pseudo elements and classes prior to search
         */
        var scopeArr   = selector.split(/[\s\>~\+]+/),
            key        = scopeArr.pop(),
            pseudoFix  = helpers.pseudo(key),
            scopeTxt   = selector.substr(0, (selector.length - key.length)),
            combinator = scopeTxt.substr(
              scopeTxt.lastIndexOf(scopeArr[scopeArr.length-1])+1
            ),
            comType = "NONE";
        // feature: search pseudo elements as elements

        var qs = w.document.querySelectorAll(scopeTxt + pseudoFix).length || 0;


        if (/[\>]/.test(combinator))      comType = "CHILD";
        else if (/[~]/.test(combinator))  comType = "GSIB";
        else if (/[\+]/.test(combinator)) comType = "NSIB";
        else if (/\*\s/.test(combinator)) comType = "GCHILD";
        else if (/\s/.test(combinator))   comType = "DESC";
        return {
          "key selector"     : key,
          "matched elements" : qs,
          "scope text"       : scopeTxt,
          "combinator type"  : comType,
          "scope length"     : scopeArr.length,
          "scope size"       : document.querySelectorAll(scopeTxt + "*").length
        }
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

      if(site.selectors.hasOwnProperty(st)){
        // update existing selector
        var sel = site.selectors[st];
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
          "scope text"       : scope["scope text"],
          "combinator type"  : scope["combinator type"],
          "scope length"     : scope["scope length"],
          "scope size"       : scope["scope size"],
          "properties set"   : pl,
          "property count"   : pl.length,
          "avg properties"   : pl.length
        }
      }
    };
    return {
      addSheet        : function(s){return addSheet(s)},
      addSheetInfo    : function(i,info){return addSheetInfo(i,info)},
      editSheet       : function(i,p,v){return editSheet(i,p,v)},
      addSelector     : function(selectorText, sheetIndex, ruleIndex, propertyList){
        return addSelector(selectorText, sheetIndex, ruleIndex, propertyList);
      }
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
          "declarations"   : 0
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
                  sellBlock = rule.selectorText.split(",");
              info.declarations += props.length;
              for(var seli in sellBlock) {
                info["selector count"]++;
                var sel = sellBlock[seli].trim().toString();
                if (sel.length>0) report.addSelector(sel,sheetIndex,ri,props);
              }
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
  };
  var processRule = function(){
    var extractRules = function(rule, sheetIndex){};

  };
  var processSelector = function(){};

  var processSheets = function(){
    for (var sheet in w.__styleSheets){
      var sheetIndex = w.__SF.addSheet(w.__styleSheets[sheet]);
      processSheet(w.__SF, w.__styleSheets[sheet], sheetIndex);
    }
  };

  // CALL Function - after timeout for ajax
  setTimeout(function(){
    processSheets();
  },400);

})(window);