var _AJAX=function(a){return _AJAX.get(a)};_AJAX.n=function(a){return a?"string"==typeof a?{url:a}:a:!1},_AJAX.json=function(a){return(a=_AJAX.n(a))?(a.json=!0,new _AJAX.r(a)):void 0},_AJAX.get=function(a){return new _AJAX.r(a)},_AJAX.post=function(a){return(a=_AJAX.n(a))?(a.method="POST",new _AJAX.r(a)):void 0},_AJAX.r=function(a){if(!a)return!1;if("string"==typeof a&&(a={url:a}),"POST"===a.method){var b="?";for(var c in a.options)b+=a.options.hasOwnProperty(c)?"&"+c+"="+a.options[c]:""}else{a.method="GET",a.url+=a.url.indexOf("?")<0?"?":"";for(var c in a.options)a.url+=a.options.hasOwnProperty(c)?"&"+c+"="+a.options[c]:""}this.x=window.XMLHttpRequest?new XMLHttpRequest:new ActiveXObject("Microsoft.XMLHTTP"),this.x.o=a,this.x.c={t:[],e:[]},this.then=function(a){return this.x.c.t.push(a),this},this.error=function(a){return this.x.c.e.push(a),this},this.x.l=function(a,b){for(var c=0;c<this.c[a].length;c++)"function"==typeof this.c[a][c]&&this.c[a][c](b)},this.x.y=function(a){this.l("t",a)},this.x.z=function(a){this.l("e",a)},this.x.onreadystatechange=function(){if(4===this.readyState&&200==this.status){var a={data:this.responseText,url:this.o.url};if(this.o.json)try{a=JSON.parse(a)}catch(b){return this.z("invalid json"),!1}this.y(a)}else 4===this.readyState&&404==this.status?this.z("404"):4===this.readyState&&this.z("unknow")},this.x.open(a.method,a.url,!0),this.x.setRequestHeader("Content-type","application/x-www-form-urlencoded"),this.x.send("undefined"!=typeof b?b:null)};
(function(){
  window.__styleSheets = new Array();
  var a = window.document.styleSheets;
  for (var i=0;i<a.length;i++){
    var t = a[i];
    if(t.hasOwnProperty("cssRules") && t.cssRules === null && t.href !== null){
      var source = t.href;
      _AJAX(source).then(function (res) {
        var url = res.url.split("?")[0];
        var style_tag = document.createElement('style');
        style_tag.appendChild(document.createTextNode(res.data));
        document.head.appendChild(style_tag);
        window.__styleSheets.push({
          remote: true,
          href: url,
          cssRules: style_tag.sheet.cssRules
        });
      });
    }
    else if (t.hasOwnProperty("cssRules") && t.cssRules !== null){
      window.__styleSheets.push({
        remote: false,
        href: t.href,
        cssRules: t.cssRules
      })
    }
  }
})();