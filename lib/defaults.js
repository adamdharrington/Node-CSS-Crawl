// TODO: Set defaults

var opts;

function load(args){
  var list           = args[0] || "test/lib/sampledata.csv",
      samples        = args[1] || 2,
      sampleSize     = args[2] || 1,
      sampleMethod   = args[3] || "top",
      pageDepth      = args[4] || 2;
  sampleMethod = (function(){
    sampleMethod = sampleMethod.toLowerCase();
    var methods = ['top', 'mid', 'random'];
    if (methods.indexOf(sampleMethod) >= 0) return sampleMethod.toUpperCase();
    else return 'TOP';
  })();
	opts = {
    list           : list,
    samples        : samples,
    sampleSize     : sampleSize,
    sampleMethod   : sampleMethod,
    pageDepth      : pageDepth
	};
  return opts;
}
function getOpts(){
  if(opts) return opts;
  else
    return load();
}

exports.load = function(args){return load(args);};
exports.opts = function(){return getOpts();};