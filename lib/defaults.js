// TODO: Set defaults

function load(args){
	var len = args.length,
		hi,ho,silver;
	len > 0 ? hi = args[0] : hi = "hi";
	len > 1 ? ho = args[1] : ho = "hello";
	len > 2 ? silver = args[2] : silver = "oh the hokey";
	return {
		hi:hi,
		ho:ho,
		silver:silver
	}
}

exports.load = function(args){return load(args);};