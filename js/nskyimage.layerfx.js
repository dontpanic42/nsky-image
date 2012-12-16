
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

	// Create lookup table for gamma values 0..255
	// this reduces the time for an 640*480 image from
	// 640ms to 30ms (!)
	var gamma_lookup = [0];
	for(var i = 1; i <= 255; i++)
		gamma_lookup[i] = 255 * Math.pow((i / 255), gamma);

	for(var x = 0; x < options.size.width; x++) {
		out[x] = [];
		for(var y = 0; y < options.size.height; y++) {
			color = options.data[x][y];
			out[x][y] = Math.floor(
							(gamma_lookup[(color >>> 24)] << 24) +
							(gamma_lookup[(color >>> 16) & 0xFF] << 16) + 
							(gamma_lookup[(color >>> 8)  & 0xFF] << 8) +
							(color & 0xFF));
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

	options = $.extend({
		hue : 100,
		saturation : 100,
		luminance : 100
	}, options);

	var hp = (options.hue == 0)? 0 : options.hue / 100;
	var sp = (options.saturation == 0)? 0 : options.saturation / 100;
	var lp = (options.luminance == 0)? 0 : options.luminance / 100;

	var hsl;
	var out = [];

	for(var x = 0; x < options.size.width; x++) {
		out[x] = [];
		for(var y = 0; y < options.size.height; y++) {
			hsl = this.toHSL(options.data[x][y]);

			hsl.h *= hp;
			hsl.l *= lp;
			hsl.s *= sp;

			out[x][y] = this.fromHSL(hsl);;
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
	r = (color >>> 24);
	g = (color >>> 16) & 0xFF;
	b = (color >>> 8 ) & 0xFF;
	a = color & 0xFF;

	r = (r==0)? 0 : r/255;
	g = (g==0)? 0 : g/255;
	b = (b==0)? 0 : b/255;

	var max, min;
	max = Math.max(r, g, b);
	min = Math.min(r, g, b);

	l = (max + min);
	l = (l==0)? 0 : l / 2;

	if(max == min) {
		h = s = 0;
	} else {
		var delta = max - min;
		
		s = ((l > 0.5)? delta / (2 - max - min) : delta / (max + min));

		switch(max) {
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

		var q = hsl.l < 0.5 ? hsl.l * (1 + hsl.s) : hsl.l + hsl.s - hsl.l * hsl.s;
        var p = 2 * hsl.l - q;
        r = this.hueToRGB(p, q, hsl.h + 1/3);
        g = this.hueToRGB(p, q, hsl.h);
        b = this.hueToRGB(p, q, hsl.h - 1/3);
	}

	return 	(Math.floor(r * 255) << 24) +
			(Math.floor(g * 255) << 16) +
	 		(Math.floor(b * 255) <<  8) +
	 		(hsl.a);
}

/**
 * Helper method 
 */
nsky.FxLayer.HSLModulate.prototype.hueToRGB = function(p, q, t) {
	if(t < 0) t += 1;
    if(t > 1) t -= 1;
    if(t < 1/6) return p + (q - p) * 6 * t;
    if(t < 1/2) return q;
    if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
}

/*****************************************************************************************
 * Simply negates the image colors (255 - channel)
 *
 ****************************************************************************************/

nsky.FxLayer.Negate = function() {}
nsky.FxLayer.Negate.prototype = new nsky.FxLayer();
nsky.FxLayer.Negate.prototype.doEffect = function(options) {

	var color, tmp;
	var out = [];

	for(var x = 0; x < options.size.width; x++) {
		out[x] = [];
		for(var y = 0; y < options.size.height; y++) {
			color = options.data[x][y];
			out[x][y] = (~color & ~0xFF) + (color & 0xFF);
		}
	}

	return {
		size : options.size,
		offset : options.offset,
		data : out
	};
}

/*****************************************************************************************
 * Fast grayscale conversion
 ****************************************************************************************/

nsky.FxLayer.Grayscale = function() {}
nsky.FxLayer.Grayscale.prototype = new nsky.FxLayer();
nsky.FxLayer.Grayscale.prototype.doEffect = function(options) {


	var out = [];
	var color, intensity;
	for(var x = 0; x < options.size.width; x++) {
		out[x] = [];
		for(var y = 0; y < options.size.height; y++) {
			color = options.data[x][y];
			intensity =   0.3  * ((color >>> 24))
						+ 0.59 * ((color >> 16) & 0xFF)
						+ 0.11 * ((color >> 8) & 0xFF);
			out[x][y] = 
				(intensity << 24) + (intensity << 16) + (intensity << 8) + (color & 0xFF);

		}
	}

	return {
		size : options.size,
		offset : options.offset,
		data : out
	};
}

/*****************************************************************************************
 * Returns a new, one-color image with the same dimension and offset as the original
 *
 * Parameters: 
 *		'fillcolor' : color (default: red) 
 ****************************************************************************************/

nsky.FxLayer.TmpImage = function() {}
nsky.FxLayer.TmpImage.prototype = new nsky.FxLayer();
nsky.FxLayer.TmpImage.prototype.doEffect = function(options) {

	options = $.extend({
		fillcolor : nsky.Util.RGBAtoColor(255, 0, 0, 255)
	}, options);

	var out = [];

	for(var x = 0; x < options.size.width; x++) {
		out[x] = [];
		for(var y = 0; y < options.size.height; y++) {
			out[x][y] = options.fillcolor;
		}
	}

	return {
		size : options.size,
		offset : options.offset,
		data : out
	};
}

nsky.FxLayer.Colortone = function() {}
nsky.FxLayer.Colortone.prototype = new nsky.FxLayer();
nsky.FxLayer.Colortone.prototype.doEffect = function(options) {
	options = $.extend({
		color : nsky.Util.RGBAtoColor(255, 255, 255, 255),
		mask_image : null,
		mask_negate : false
	}, options);

	//1. create mask.
	var mask;

	if(options.mask_image == null) {
		var tmpFx = new nsky.FxLayer.TmpImage();
		mask = tmpFx.blend($.extend({
			fillcolor : nsky.Util.RGBAtoColor(128, 128, 128, 255)
		}, options));
	} else {
		console.time("Grayscale");
		mask = options.mask_image;
		var grayFx = new nsky.FxLayer.Grayscale();
		mask = grayFx.blend(mask);
		console.timeEnd("Grayscale");
	}

	console.time("Negation");
	if(options.mask_negate) {
		var negFx = new nsky.FxLayer.Negate();
		mask = negFx.blend(mask);
	}
	console.timeEnd("Negation");

	//3. blend solid color and original image using the mask

	console.time("Blending");
	var mixed = [];
	var cadd = nsky.Layer.Blend.plus;

	for(var x = 0; x < options.size.width; x++) {
		mixed[x] = [];
		for(var y = 0; y < options.size.height; y++) {
			mcolor = (mask.data[x][y] >>> 24);
			mixed[x][y] = cadd(options.data[x][y], options.color, ((mcolor == 0)? 0 : (mcolor / 255)));
		}
	}
	console.timeEnd("Blending");

	return {
		size : options.size,
		offset : options.offset,
		data : mixed
	};
}