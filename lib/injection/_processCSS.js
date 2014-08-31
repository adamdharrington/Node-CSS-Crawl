(function(w){
  // TODO: keep this object clean of external references, only use values
  w.__STYLES = {
    "url"          : w.location.href,
    "summary"      : {
      "sheets"           : 0
    },
    "style sheets" : [],
    "selectors"    : {

    },
    "used selectors": [],
    "errors": []
  };
  // TODO: Wrapper function, don't access window.__STYLES directly
  w.__SF = (function(page){
    var helpers = {
        // Used to extract only the unique objects in an array
        uniqueOnly : function(array){
          return array.filter(function(i){return array.indexOf(i) == array.lastIndexOf(i)});
        },
        // Used to remove duplicates from an array
        uniquify :function(array){
          return array.sort().filter(function(elem, pos, self) {
            return self.indexOf(elem) == pos;
          });
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
          var sels = page.selectors,
            sumOfScopes = 0,selCount = 0;
          for(var s = 0, sls=Object.keys(sels),len=sls.length;s<len;s+=1){ //FIXME: for in loops will not work with prototype.js
            var selector = sls[s];
            if (!sels.hasOwnProperty(selector)) break;
            selCount    += sels[selector].references.length;
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
        protectedQuery: function(query){
          var q;
          try {
            q = w.document.body.querySelectorAll(query);
          } catch (err){
            page.errors.push({query: query, error: err});
            q = [];
          }
          return q;
        },
        sellOut : function(selector){
          // Clean key selector of pseudo elements and classes prior to search
          var scopeArr   = selector.split(/[\s\>~\+]+/),
            key          = scopeArr.pop(),
            pseudoFix    = helpers.pseudo(key),
            scopeTxt     = selector.substr(0, (selector.length - key.length)),
            combinator   = scopeTxt.substr(
              scopeTxt.lastIndexOf(scopeArr[scopeArr.length-1])+1
            ),
            comType = "NONE",
          // search pseudo elements as elements
            qs = helpers.protectedQuery(scopeTxt + pseudoFix).length || 0;

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
            "scope size"       : helpers.protectedQuery(scopeTxt + " *").length
          }
        },
        countChildren : function(parent){
          var count,pa;
          !parent ? count = 2 : count = 0;
          pa = parent || document.body;
          return count + pa.getElementsByTagName("*").length;
        },
        elementsWithClassOrId : function(){
          return helpers.protectedQuery("*[id], *[class]").length;
        },
        listIDs : function(){
          var ids = helpers.protectedQuery("*[id]"),
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
          var classes = helpers.protectedQuery("*[class]"),
            list = [], unique;
          for (var c = 0; c < classes.length;c++){
            var tmp = Array.prototype.map.call(classes[c].classList, function(e){return e;});
            list = list.concat(tmp);
          }
          unique = helpers.uniquify(list);
          return {
            "classes"               : list.sort(),
            "elements with classes" : list.length,
            "unique classes"        : unique
          };
        }
      },
      addSheet = function(sheet){
        var i = page["style sheets"].push({"href": sheet.href});
        page.summary.sheets += 1;
        return i - 1;
      },
      addSheetInfo= function(index, obj){
        var ps = Object.keys(obj);
        for (var p =0;p<ps.length;p+=1){ //FIXME: for in loops will not work with prototype.js
          var property = ps[p];
          if (obj.hasOwnProperty(property))
            page["style sheets"][index][property] = (obj[property]);
        }
      },
      editSheet= function(index, property, value){
        if (property == "@imports")
          page["style sheets"][index][property].push(value);
        else
          page["style sheets"][index][property] += value;
      },
      addSelector = function(st, si, ri, pl){
        var effective = false,
            keyType = "";
        if(page.selectors.hasOwnProperty(st)){
          // update existing selector
          var sel = page.selectors[st];
          if (sel["matched elements"]>0) effective=true;
          keyType = sel["key type"];
          sel.references.push({
            "sheet"          : si,
            "rule"           : ri,
            "property count" : pl.length
          });
          sel["properties set"] = helpers.uniquify(
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
          page.selectors[st] = {
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
      addSelectors = function(array){
        page["used selectors"] = page["used selectors"].concat(helpers.uniquify(array));
      },
      tally = function(){
        var de = helpers.countChildren(),
           dom = {
             "ids"             : helpers.listIDs(),
             "classes"         : helpers.listClasses()
           },
           tot = {
            "dom elements"     : de,
            "dom elements_attr": helpers.elementsWithClassOrId(),
            "c2p"              : 0,
            "sheets"           : page.summary.sheets,
            "rules"            : 0,
            "used rules"       : 0,
            "unused rules"     : 0,
            "selectors"        : 0,
            "unique selectors" : Object.keys(page.selectors).length,
            "used selectors"   : 0,
            "unused selectors" : 0,
            "element selectors": 0,
            "class selectors"  : 0,
            "universality"     : 0,
            "universalityK"    : 0,
            "average scope"    : helpers.scopeCalc(de),
            "abstractness"     : 0
          },
          s= page["style sheets"],
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

        page["used selectors"]     = helpers.uniquify(page["used selectors"]);
        page["selectors"]          = helpers.uniquify(Object.keys(page["selectors"]));

        tot["used selectorsU"]     = page["used selectors"].length;
        tot["universality"]        = (tot["element selectors"] + (tot["class selectors"] * .5)) / tot["selectors"];
        tot["universalityK"]       = tot["element selectors"] / tot["selectors"];
        tot["abstractness"]        = Math.min(tot["universalityK"],tot["average scope"]);
        tot["selector redundancy"] = tot["unused selectors"] / tot["selectors"];
        tot["selector redundancyU"]= 1 - (tot["used selectorsU"] / tot["unique selectors"]);
        tot["rule redundancy"]     = tot["unused rules"] / tot["rules"];
        tot.c2p = (
          (Math.sqrt(de*tot["dom elements_attr"])/de)
          );
        page.summary  = tot;
        page.document = dom;
      },
      findTemplates = function(){
        //FEATURE: Must be called once all processes are complete, check all selectors for well known UI template identifiers
        var templates =
        {// get unique identifiers from lib/templates/unique.json by running the templates.js module

          "animate": [".animated.infinite", ".animated.hinge", ".rubberBand", ".shake", ".swing", ".tada", ".wobble", ".bounceOutUp", ".fadeInDownBig", ".fadeInRightBig", ".fadeOutLeft", ".fadeOutUpBig", ".animated.flip", ".flipInY", ".flipOutX", ".rotateInDownLeft", ".rotateInDownRight", ".zoomOutLeft"],
          "blueprint-v1": ["tbody tr:nth-child(even) td", ".removed", "#IE8#HACK", ".showgrid", "textarea.span-1", "input.span-24", "textarea.span-24", ".append-23", ".prepend-1", ".prepend-23", ".colborder", ".pull-24", "div.prepend-top", "div.append-bottom", "hr.space"],
          "320andup-v3": ["ins", "time", ".visuallyhidden.focusable:focus", ".header h2 a", ".header .a-rss", ".header .a-rss:hover", "::-moz-selection", ".swatch-base span:nth-child(2)", ".greygrad", ".infograd", ".inversegrad", ".successgrad", ".warninggrad", "li[class^=\"icon-\"]", ".icon-large::before", ".btn [class^=\"icon-\"]", ".icon-text-height::before", ".furniture-letter", ".full .grids"],
          "bootstrap-v2": [".img-polaroid", ".navbar-fixed-top .container", "a.muted:hover", "ul.inline > li", "ol.inline > li", ".uneditable-input:focus", "textarea::-webkit-input-placeholder", ".control-group.warning textarea:focus", ".form-horizontal .input-append", "legend + .control-group", ".table-bordered colgroup + tbody tr:first-child td:first-child", ".icon-question-sign", ".navbar-inverse .nav li.dropdown.active > .dropdown-toggle", ".carousel-caption p", ".hero-unit li"],
          "bootstrap-v1": [".container-fluid > .sidebar", ".container-fluid > .content", ".span24", ".row > .offset1", ".span-two-thirds", "form .clearfix::before", "form .clearfix.error > label", "form .clearfix.warning .help-inline", ".alert-message.block-message.info p a", ".pagination .disabled a:hover", ".twipsy.left .twipsy-arrow", ".popover.below .arrow", ".media-grid::before", ".media-grid::after", ".media-grid li", ".media-grid a", ".media-grid a img", ".media-grid a:hover"],
          "bootstrap-v3": [".glyphicon-tree-deciduous::before", ".sr-only-focusable:focus", "h1 .small", "blockquote footer", ".blockquote-reverse small::before", ".col-xs-offset-0", ".table > tbody > tr > th", "input[type=\"datetime-local\"].input-lg", ".form-horizontal .has-feedback .form-control-feedback", ".open > .dropdown-toggle.btn-default", ".carousel-control .glyphicon-chevron-left", ".dl-horizontal dd::before", ".btn-group-vertical > .btn-group::after", ".navbar-header::after", ".visible-print-inline-block"],
          "flat-ui-v2": [".fui-plus", ".fui-chat", ".fui-checkbox-unchecked", ".open .dropdown-toggle.btn-inverse", "fieldset[disabled] .btn-inverse", ".has-switch > div.switch-animate", ".prx"],
          "foundation-v3":[".hide-override", "#googlemap img", ".row form .row .columns", "form.custom div.custom.dropdown ul li.selected::after", ".row .offset-by-five", ".button.dropdown.split.alert > span:focus", ".top-bar ul > li.has-dropdown a::after", ".joyride-tip-guide span.joyride-nub.bottom", ".clearing-blackout ul.block-grid[data-clearing].ten-up > li:nth-child(10n+1)", ".tabs.pill dd.active a", ".tabs.four-up li a", "ul.side-nav li", "ul.breadcrumbs li:first-child::before", "table thead tr th:last-child", "div.progress.round .meter", "table.hide-for-medium"],
          "foundation-v4":["table.hide-for-large-up", "td.show-for-small", ".input-group.round > :first-child *", ".button-bar", ".split.button span::before", ".section-container.vertical-nav > section > [data-section-content]", ".section-container.accordion > .section.active > .content", ".no-js .section-container > section > .content > :first-child", "form.custom .custom.dropdown ul li.selected", "form.custom .custom.dropdown ul li.selected:hover", "form.custom .custom.dropdown ul.show", "a.th"],
          "foundation-v5": [".row.collapse > .column", ".accordion .accordion-navigation.active > a", ".breadcrumbs > .current:hover", ".f-dropdown.content", ".postfix.button", "div.icon-bar > * img + label", ".orbit-container .orbit-next", ".reveal-modal .close-reveal-modal", ".touch th.show-for-touch"],
          "hint-v1-3": [".hint", "[data-hint]", ".hint:hover::after", ".hint:focus::before", ".hint:focus::after", "[data-hint]:hover::before", "[data-hint]:hover::after", "[data-hint]:focus::before", "[data-hint]:focus::after", ".hint--top::before", ".hint--bottom::before", ".hint--left::before", ".hint--right::before"],
          "kendo-ui-v2": [".k-window-action", ".k-editable-area", ".k-colorpicker .k-i-arrow-s", ".k-textbox > input", ".k-dropdown-wrap", ".k-picker-wrap.k-state-active", ".k-scheduler-times th", ".k-secondary .k-autocomplete.k-state-focused", ".k-scheduler-table .k-state-hover .k-icon"],
          "jquery-ui-v1-11": [".ui-helper-clearfix", ".ui-helper-zfix", ".ui-accordion .ui-accordion-header", ".ui-accordion .ui-accordion-icons", ".ui-progressbar", ".ui-resizable-disabled .ui-resizable-handle",  ".ui-icon-squaresmall-close", ".ui-icon-grip-dotted-vertical", ".ui-corner-br", ".ui-widget-shadow"],
          "metro-bootstrap": [ ".metro .place-left", ".metro .place-bottom-right", ".metro #element .selected::before", ".metro .rotate45", ".metro .breadcrumbs ul .active::before", ".metro .input-control.checkbox.text-left .check", ".metro .ribbed-blue"],
          "pure-v0-5": [".pure-g", ".pure-g [class*=\"pure-u\"]", ".pure-u-1", ".pure-u-22-24", ".pure-button-hover", ".pure-button:hover", ".pure-form input[type=\"search\"]:focus", ".pure-form textarea[disabled]", ".pure-form-stacked textarea"],
          "ratchet-v2": [".bar-header-secondary ~ .content", ".btn-negative.active", ".bar .title .icon.icon-caret",".badge-negative.badge-inverted", ".content > .table-view:first-child", ".input-group input", ".segmented-control-negative .control-item.active", ".control-content.active", ".popover::before", ".content.sliding",".push-right::after",".icon-caret::before"],
          "skeleton": [".container .columns", ".column.alpha", ".column.omega", ".container .eight.columns", ".container .eleven.columns", ".container .sixteen.columns", ".container .one-third.column", ".container .offset-by-thirteen"],
          "typeplate": [".tera", ".giga", ".mega", ".alpha", ".beta", ".icons", ".gamma", "#drawer::after", ".botDivider:not(.base-type)::after", ".lining dd + dt::before", ".token.punctuation", ".lede > p:not(.no-indent)", ".toc ol li::before", ".typeplate-code-block code"],
          "unsemantic-grid-responsive": [".grid-container::before", ".mobile-grid-5::before", ".grid-10::before", ".grid-70::before", ".grid-75::after", ".mobile-grid-66 > *"]
        },
          fwkNames = Object.keys(templates).sort(),
          found = {},
          templateCheck = function(selectors){
            fwkNames.map(function(f){
              var ids = templates[f].length,
                matches=0;
              templates[f].map(function(id){
                if (selectors.indexOf(id)>=0) matches+=1;
              });
              if (matches){
                found[f] = matches/ids;
                return f;
              }
              else {
                found[f] = false;
                return null;
              }
            });
            return found;
          };
        page["templates"] = templateCheck(page["selectors"]);
      };
    return {
      addSheet        : function(s){return addSheet(s)},
      addSheetInfo    : function(i,info){return addSheetInfo(i,info)},
      addSelectors    : function(array){return addSelectors(array);},
      editSheet       : function(i,p,v){return editSheet(i,p,v)},
      addSelector     : function(selectorText, sheetIndex, ruleIndex, propertyList){
        return addSelector(selectorText, sheetIndex, ruleIndex, propertyList);
      },
      complete        : function(){return tally();},
      templates      : function(){return findTemplates();}
    };
  })(w.__STYLES);

  var processSheet = function(report, sheet, sheetIndex){
      /*
       TODO: Convert style sheet to an array of rules, DONE
       TODO:
       */
      var allRules = Array.prototype.map.call(sheet.cssRules,function(r){return r}),
        usedSelectors = [],
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
      processRules = function(array, info, usedSels){

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
            info[at+" rules"] +=1;
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
            for(var seli = 0,bl=sellBlock.length;seli<bl;seli+=1) {
              info["selector count"]++;
              var sel = sellBlock[seli].toString().trim();
              // Ignore escaped characters in selectors, that's just weird.
              if(sel.indexOf("\\") >= 0) break;
              if (sel.length>0) {
                var result = report.addSelector(sel,sheetIndex,ri,props);
                if(result.eff) {
                  effective = true;
                  usedSels.push(sel);
                  info["used selectors"]++;
                }
                else info["unused selectors"]++;
                if (result.keyType != "") info[""+result.keyType+" keys"]++;
              }
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
      processRules(allRules, sheetInfo, usedSelectors);
      w.__SF.addSheetInfo(sheetIndex, sheetInfo);
      w.__SF.addSelectors(usedSelectors);
    },
    calculateSummary = function(report){
      report.complete();
      report.templates();
    },
    processSheets = function(){
      for (var sheet = 0,stys= w.__styleSheets.length;sheet<stys;sheet+=1){
        var sheetIndex = w.__SF.addSheet(w.__styleSheets[sheet]);
        processSheet(w.__SF, w.__styleSheets[sheet], sheetIndex);
      }
      calculateSummary(w.__SF);
  };

//  console.log(Date.now());
  // CALL Function - after timeout for ajax
  w.setTimeout(function(){
//    console.log(Date.now());
    processSheets();
  },1200);

})(window);