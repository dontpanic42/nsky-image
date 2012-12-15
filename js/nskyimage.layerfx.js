
/*****************************************************************************************
 * Gamma Correction Filter
 *
 * Parameters: 
 *		'gamma' : 0.0 < gamma < N
 ****************************************************************************************/

nsky.FxLayer.GammaCorrect = function() { }
nsky.FxLayer.GammaCorrect.prototype = new nsky.FxLayer();
nsky.FxLayer.GammaCorrect.prototype.doEffect = function(options) {

	options = $.extend({
		gamma: 0.5
	}, options);

	var gamma = 1 / options.gamma;
	
	if(gamma == 1) return {
		size : options.size,
		data : options.data,
		offset : options.offset
	};

	var color, tmp;
	var out = [];

	for(var x = 0; x < options.size.width; x++) {
		out[x] = [];
		for(var y = 0; y < options.size.height; y++) {

			color = options.data[x][y];
			tmp  = ( 255 * Math.pow((nsky.Util.Channel('r', color) / 255), gamma) ) << 24;
			tmp += ( 255 * Math.pow((nsky.Util.Channel('g', color) / 255), gamma) ) << 16;
			tmp += ( 255 * Math.pow((nsky.Util.Channel('b', color) / 255), gamma) ) <<  8;
			tmp += nsky.Util.Channel('a', color);
			out[x][y] = tmp;
		}
	}

	return {
		size : options.size,
		offset : options.offset,
		data : out
	};
}

/*****************************************************************************************
 * HSL Correction Filter
 *
 * Parameters: 
 *		'hue' : 0 <= gamma < N as percentage
 *		'saturation' : 0 <= saturation < N as percentage
 *		'luminance' : 0 <= luminance < N as percentage
 ****************************************************************************************/

nsky.FxLayer.HSLModulate = function() { }
nsky.FxLayer.HSLModulate.prototype = new nsky.FxLayer();
nsky.FxLayer.HSLModulate.prototype.doEffect = function(options) {

	$.extend({
		hue : 100,
		saturation : 100,
		luminance : 100
	}, options);

	var hp = (options.hue == 0)? 0 : options.hue / 100;
	var sp = (options.saturation == 0)? 0 : saturation / 100;
	var lp = (options.luminance == 0)? 0 : luminance / 100;

	var color, tmp, hsl;
	var out = [];

	for(var x = 0; x < options.size.width; x++) {
		out[x] = [];
		for(var y = 0; y < options.size.height; y++) {

			color = options.data[x][y];

			hsl = this.toHSL(color);

			hsl.h *= hp;
			hsl.l *= lp;
			hsl.s *= sp;

			color = this.fromHSL(hsl);

			tmp  = nsky.Util.Channel('r', color) << 24;
			tmp += nsky.Util.Channel('g', color) << 16; 
			tmp += nsky.Util.Channel('b', color) <<  8; 
			tmp += nsky.Util.Channel('a', color); 
			out[x][y] = tmp;
		}
	}

	return {
		size : options.size,
		offset : options.offset,
		data : out
	};
}

/**
 * Converts RGB Colorspace to HSL.
 * Algorithm adapted from 
 * http://mjijackson.com/2008/02/rgb-to-hsl-and-rgb-to-hsv-color-model-conversion-algorithms-in-javascript
 */
nsky.FxLayer.HSLModulate.prototype.toHSL = function(color) {
	var r, g, b, a, h, s, l;
	r = nsky.Util.Channel('r', color);
	g = nsky.Util.Channel('g', color);
	b = nsky.Util.Channel('b', color);
	a = nsky.Util.Channel('a', color);

	var max, min;
	max = Math.max(r, g, b);
	min = Math.min(r, g, b);

	l = (max + min);
	l = (l==0)? 0 : l / 2;

	if(max == min) {
		h = s = 0;
	} else {
		var delta = max - min;
		s = (l > 0.5)? delta / (2 - max - min) : delta / (max + min);
		swtich(max) {
			case r : 
				h = (g - b) / delta + ((g < b)? 6 : 0);
				break;
			case g : 
				h = (b - r) / delta + 2;
				break;
			case b : 
				h = (r - g) / delta + 4;
				break;
		}

		h /= 6;
	}

	return {
		h : h,
		s : s,
		l : l,
		a : a
	};
}

/**
 * Converts HSL Colorspace to RGB.
 * Algorithm adapted from 
 * http://mjijackson.com/2008/02/rgb-to-hsl-and-rgb-to-hsv-color-model-conversion-algorithms-in-javascript
 */
nsky.FxLayer.HSLModulate.prototype.fromHSL = function(hsl) {
	var r, g, b;

	if(hsl.s == 0) {
		r = g = b = hsl.l;
	} else {
		var hueToRGB = function(p, q, t) {
			if(t < 0) t += 1;
            if(t > 1) t -= 1;
            if(t < 1/6) return p + (q - p) * 6 * t;
            if(t < 1/2) return q;
            if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
		}

		var q = hsl.l < 0.5 ? hsl.l * (1 + hsl.s) : hsl.l + hsl.s - hsl.l * hsl.s;
        var p = 2 * hsl.l - q;
        r = hueToRGB(p, q, hsl.h + 1/3);
        g = hueToRGB(p, q, hsl.h);
        b = hueToRgb(p, q, hsl.h - 1/3);
	}

	var out;
	out  = (r * 255) << 24;
	out += (g * 255) << 16;
	out += (b * 255) <<  8;
	out += (hsl.a);

	return out;
}