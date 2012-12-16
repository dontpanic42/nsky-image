
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

	options = $.extend({
		hue : 100,
		saturation : 100,
		luminance : 100
	}, options);

	var hp = (options.hue == 0)? 0 : options.hue / 100;
	var sp = (options.saturation == 0)? 0 : options.saturation / 100;
	var lp = (options.luminance == 0)? 0 : options.luminance / 100;

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

			// tmp  = nsky.Util.Channel('r', color) << 24;
			// tmp += nsky.Util.Channel('g', color) << 16; 
			// tmp += nsky.Util.Channel('b', color) <<  8; 
			// tmp += nsky.Util.Channel('a', color); 
			out[x][y] = color;
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
        b = hueToRGB(p, q, hsl.h - 1/3);
	}

	var out;
	out  = (r * 255) << 24;
	out += (g * 255) << 16;
	out += (b * 255) <<  8;
	out += (hsl.a);

	return out;
}



/*****************************************************************************************
 * Simply negates the image colors (255 - channel)
 *
 * Parameters: 
 *		'negate_alpha' : false|true (default: false) if true the alpha value will be negated
 													 too.
 ****************************************************************************************/

nsky.FxLayer.Negate = function() {}
nsky.FxLayer.Negate.prototype = new nsky.FxLayer();
nsky.FxLayer.Negate.prototype.doEffect = function(options) {

	options = $.extend({
		negate_alpha : false
	}, options);

	var color, tmp;
	var out = [];

	for(var x = 0; x < options.size.width; x++) {
		out[x] = [];
		for(var y = 0; y < options.size.height; y++) {

			color = options.data[x][y];

			out[x][y] = nsky.Util.RGBAtoColor(
					(255 - nsky.Util.Channel('r', color)),
					(255 - nsky.Util.Channel('g', color)),
					(255 - nsky.Util.Channel('b', color)),
					(options.negate_alpha)?
						(255 - nsky.Util.Channel('a', color)) : 
							   nsky.Util.Channel('a', color)
				);

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
		mask = options.mask_image;
		//convert to grayscale...
		var hslFx = new nsky.FxLayer.HSLModulate();
		mask = hslFx.blend($.extend({
			saturation : 0
		}, mask));
	}

	if(options.mask_negate) {
		var negFx = new nsky.FxLayer.Negate();
		mask = negFx.blend(mask);
	}

	//2. create solid color image

	var colFx = new nsky.FxLayer.TmpImage();
	var color = colFx.blend($.extend({
		fillcolor : options.color
	}, options));

	//3. blend solid color and original image using the mask

	var mixed = [];
	var fillweight = 0;
	var cadd = nsky.Layer.Blend.plus;

	for(var x = 0; x < options.size.width; x++) {
		mixed[x] = [];
		for(var y = 0; y < options.size.height; y++) {
			//original color
			ocolor = options.data[x][y];
			//mask color
			mcolor = nsky.Util.Channel('r', mask.data[x][y]);
			//fill color
			fcolor = color.data[x][y];

			fillweight = (mcolor == 0)? 0 : ((mcolor / 255) * 100);

			mixed[x][y] = cadd(ocolor, fcolor, {'blend_weight_p1' : fillweight});
		}
	}

	return {
		size : options.size,
		offset : options.offset,
		data : mixed
	};
}