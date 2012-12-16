nsky.Layer.Blend = {};
nsky.Layer.Blend.multiply = function(rgba1, rgba2) {

	var out = 0;
	//r
	out += (( rgba1 >>> 24) * (rgba2 >>> 24) / 255) << 24;
	//g
	out += (((rgba1 >>> 16) & 0xFF) * ((rgba2 >>> 16) & 0xFF) / 255) << 16;
	//b
	out += (((rgba1 >>> 8) & 0xFF) * ((rgba2 >>> 8) & 0xFF) / 255) << 8;
	//ignore a for now...
	out += 255;
	return out;
}

nsky.Layer.Blend.screen = function(rgba1, rgba2) {
	var out = 0;
	var tmp1, tmp2;

	tmp1 = rgba1 >>> 24;
	tmp2 = rgba2 >>> 24;
	out += ( tmp1 + tmp2 - tmp1 * tmp2 / 255 ) << 24;

	tmp1 = (rgba1 >>> 16) & 0xFF;
	tmp2 = (rgba2 >>> 16) & 0xFF;
	out += ( tmp1 + tmp2 - tmp1 * tmp2 / 255 ) << 16;

	tmp1 = (rgba1 >>> 8 ) & 0xFF;
	tmp2 = (rgba2 >>> 8 ) & 0xFF;
	out += ( tmp1 + tmp2 - tmp1 * tmp2 / 255 ) << 8;

	//ignore alpha for now...
	out += 255;

	return out;
}

nsky.Layer.Blend.burn = function(rgba1, rgba2) {

	var out = 0;
	var tmp1, tmp2;

	tmp1 = rgba1 >>> 24;
	tmp2 = rgba2 >>> 24;
	out += ((rgba1 == 0)? rgba1 : Math.max(0, (255 - ((255 - rgba2) << 8) / rgba1))) << 24;

	tmp1 = (rgba1 >>> 16) & 0xFF;
	tmp2 = (rgba2 >>> 16) & 0xFF;
	out += ((rgba1 == 0)? rgba1 : Math.max(0, (255 - ((255 - rgba2) << 8) / rgba1))) << 16;

	tmp1 = (rgba1 >>> 8 ) & 0xFF;
	tmp2 = (rgba2 >>> 8 ) & 0xFF;
	out += ((rgba1 == 0)? rgba1 : Math.max(0, (255 - ((255 - rgba2) << 8) / rgba1))) << 8;

	//ignore alpha for now...
	out += 255;

	return out;
}

/**
 * This works like the imagemagick's 'plus', that is, the r, g, b, AND a
 * simply get added. The alpha addition weight can be controlled via the 
 * blend_weight_p1 and belnd_weight_p2 parameters. If the last parameter
 * is omitted 100 - p1 will be used.
 * If no parameter is given, the values will be added equaly (50% each).
 */
nsky.Layer.Blend.plus = function(rgba1, rgba2, p1) {
	// var opt = $.extend({
	// 	blend_weight_p1 : 0.5,
	// 	blend_weight_p2 : 1 - this.blend_weight_p1
	// }, options);
	var p2 = 1 - p1;
	// var p1 = opt.blend_weight_p1;
	// var p2 = opt.blend_weight_p2;

	// var out = 0;

	// out += Math.min(
	// 	(p1*nsky.Util.Channel('r', rgba1)) + 
	// 	(p2*nsky.Util.Channel('r', rgba2)),
	// 	255) << 24;
	// out += Math.min(
	// 	(p1*nsky.Util.Channel('g', rgba1)) + 
	// 	(p2*nsky.Util.Channel('g', rgba2)),
	// 	255) << 16;
	// out += Math.min(
	// 	(p1*nsky.Util.Channel('b', rgba1)) + 
	// 	(p2*nsky.Util.Channel('b', rgba2)),
	// 	255) << 8;
	// out += Math.min(
	// 	(p1 * nsky.Util.Channel('a', rgba1)) + 
	// 	(p2 * nsky.Util.Channel('a', rgba2)),
	// 	255);

	// return out;

	return (Math.min(
			(p1 * (rgba1 >>> 24)) + (p2 * (rgba2 >>> 24)),
			255) << 24) + 
		(Math.min(
			(p1 * ((rgba1 >>> 16) & 0xFF)) + (p2 * ((rgba2 >>> 16) & 0xFF)),
			255) << 16) + 
		(Math.min(
			(p1 * ((rgba1 >>>  8) & 0xFF)) + (p2 * ((rgba2 >>>  8) & 0xFF)),
			255) <<  8) + 
		(Math.min(
			(p1 * ((rgba1 & 0xFF))) + (p2 * ((rgba2 & 0xFF))),
			255));
}