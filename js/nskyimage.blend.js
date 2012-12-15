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