(function(window){
  var makeReadable = (function(){
    var wait = 0;
    Array.prototype.map.call(window.document.styleSheets, function(t,i){
      if(t.hasOwnProperty("cssRules") && t.cssRules === null && t.href !== null){
        wait +=1 ;
        var source = t.href;
        microAjax(source, function (res) {
          var style_tag = document.createElement('style');
          style_tag.appendChild(document.createTextNode(res));
          document.head.appendChild(style_tag);
          wait -=1;
          process([style_tag.sheet],aggregated, source, depth +1);
        });
      }
    });
    var iteration = 0;
    do {
      setTimeout(function(){
        iteration++
      },300);
    }while(wait > 0 || iteration < 3);


  })();



  var allStyles = function(){
    var _url = window.location.href || null,
      info = {
        _used : {},
        _unused : {},
        _sheets : [],
        _complexity : null,
        _abstractness : null,
        _scope : null,
        _universality : null,
        _DOMElements: 0,
        _countSimpleSelectors: 0,
        _countScopeSize: []
      },
      addSelector = function(selector){
        var qs = window.document.querySelectorAll(selector) || [];
        //_used["only one"] = "Helllllllo";

        if (qs.length > 0 ){
          if (info._used.hasOwnProperty(selector)){
            info._used[selector].referenced = info._used[selector].referenced + 1;
          }
          else {
            info._used[selector] = {
              referenced : 1,
              usedBy : qs.length
            }
          }
        } else {
          if (info._unused.hasOwnProperty(selector))
            info._unused[selector].referenced = info._unused[selector].referenced + 1;
          else {
            info._unused[selector] = {
              referenced : 1,
              usedBy : 0
            };
          }
        }
      },
      complexity = function(){
        info._complexity = 1;
        return info._complexity;
      },
      abstractness = function(){
        info._abstractness = 2;
        return info._abstractness;
      },
      scope = function(){
        info._scope = 2;
        return info._scope;
      },
      universality = function(){
        info._universality = 2;
        return info._universality;
      },
      countChildren = function(parent){
        var count,pa;
        !parent ? count = 2 : count = 0;
        pa = parent || document.body;
        return count + pa.getElementsByTagName("*").length;
      },
      addSheetCheck = function(obj){
        info._sheets.push(obj)
      };

    /*
     *   == Initial document functions
     * */
    info._DOMElements = countChildren();
    /*
     *  == End Initial document functions
     * */
    return {
      addStylesheet  :  function(x){addSheetCheck(x)},
      addSelector    :  function(selector){addSelector(selector)},
      getStylesheets :  function(){return info._sheets},
      getUnused      :  function(){return info._unused},
      getUsed        :  function(){return info._used},
      getUniversality:  function(){ if (info._universality) return info._universality; else return universality()},
      getScope       :  function(){ if (info._scope) return info._scope; else return scope()},
      getAbstractness:  function(){ if (info._abstractness) return info._abstractness; else return abstractness();},
      getComplexity  :  function(){ if (info._complexity) return info._complexity; else return complexity();}
    };
  };


  var document = window.document;

  // where we will put all the styles
  window._all_styles = new allStyles();

  (function process(sheets,aggregated, h, depth){
    h = h || null;
    if(depth > 3) return;
    var convertToArray = function(CSSRuleList){
        var array = [];
        for (var r = 0; r < CSSRuleList.length;r++)
          array.push(CSSRuleList[r]);
        return array;
      },
      waitingForStyles = [];

    // Iterate over each stylesheet
    iterateSheetsI:
      for (var i = 0; i < sheets.length; i++) {

        // Iterate on individual lists of rules
        var rules = convertToArray(sheets[i].cssRules);

        iterateRulesJ:
          for(var j = 0; j < rules.length; j++){
            var rule = rules[j],
              rType = rule.constructor.name;
            if(rType === "CSSSupportsRule")rules.concat(convertToArray(rule.cssRules));
            else if(rType === "CSSMediaRule")rules.concat(convertToArray(rule.cssRules));
            else if(rule.styleSheet || rType === "CSSImportRule"){
              process([rule.styleSheet], aggregated, rule.href, depth + 1);
            }
            else if(rule.hasOwnProperty("selectorText") && rule.selectorText !== null){
              var selectorsArray = rule.selectorText.split(",");
              for (var s = 0; s < selectorsArray.length;s++){//(var s in selectorsArray){
                var selector = selectorsArray[s].trim().toString();
                aggregated.addSelector(selector);
              }
            }
            else if(rule.hasOwnProperty("cssText") && rule.cssText !== null && rule.cssText[0]!="@"){
              var selectors = rule.cssText.substr(0,rule.cssText.indexOf("{"));
              var selectorsArray = selectors.split(",");
              for (var s = 0; s < selectorsArray.length;s++){//(var s in selectorsArray){
                var selector = selectorsArray[s].trim().toString();
                aggregated.addSelector(selector);
              }
            }
          }
        aggregated.addStylesheet({
          href:sheets[i]["href"] || h || "NA",
          ruleCount: rules.length || 0
        });
      }
    if (waitingForStyles.length > 0){
      setTimeout(function(){return false}, 1000);
    }
  })(document.styleSheets,window._all_styles,null,0);

})(window);