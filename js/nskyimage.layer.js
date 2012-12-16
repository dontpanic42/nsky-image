nsky.Layer = function(options) {
	var opt = $.extend({
		offset : {
			x : 0,
			y : 0
		},

		image : null

	}, options);

	this.offset = opt.offset;
	
	this.size = (opt.size)? opt.size : {
		width : 0,
		height : 0
	};

	this.data = (opt.data)? opt.data : [];
}

nsky.Layer.prototype.setDataFromImage = function(image) {
	var tmpCanvas = $('<canvas></canvas>')
	.width(this.size.width = image.width)
	.height(this.size.height = image.height);
	tmpCanvas.get(0).width = this.size.width;
	tmpCanvas.get(0).height = this.size.height;
	var context = tmpCanvas.get(0).getContext("2d");

	context.drawImage(image, 0, 0);
	var imageData = context.getImageData(0, 0, this.size.width, this.size.height);
	var index = 0;

	for(var ix = 0; ix < this.size.width; ix++) this.data[ix] = [];  

	for(var y = 0; y < this.size.height; y++) {
		for(var x = 0; x < this.size.width; x++) {
			this.data[x][y] =
				(imageData.data[index++] << 24) +	
				(imageData.data[index++] << 16) +
				(imageData.data[index++] <<  8) +
				(imageData.data[index++]);
		}
	}

	console.log(image.width, image.height, this.size);
}

nsky.Layer.prototype.blend = function(options) {
	var opt = $.extend({
		offset : {
			x : 0, 
			y : 0
		},
		data : [],
		size : {
			width : 0,
			height : 0
		},
		blend : function() { return 0; }
	}, options);

	var result = [];

	var sz2 = opt.size;
	var of2 = opt.offset;

	var sz1 = this.size;
	var of1 = this.offset;

	var can = nsky.Global.canvas;
	// right-bottom coordinates of the resulting area...
	// the maximal size is defined by the canvas size.
	var bo2 = {
		x : Math.max(
				((of1.x + sz1.width)>can.width())? can.width() : of1.x + sz1.width,
				((of2.x + sz2.width)>can.width())? can.width() : of2.x + sz2.width
			),
		y : Math.max(
				((of1.y + sz1.height)>can.height())? can.height() : of1.y + sz1.height, 
				((of2.y + sz2.height)>can.height())? can.height() : of2.y + sz2.height
			)
	};

	// top-left coordinates of the resulting area
	// the minimal size is (0, 0)
	var bo1 = {
		x : Math.min(
				((of1.x<0)? 0 : of1.x), 
				((of2.x<0)? 0 : of2.x)
			),
		y : Math.min(
				((of1.y<0)? 0 : of1.y), 
				((of2.y<0)? 0 : of2.y)
			) 
	};

	var inImage = function(x, y, of, sz) {
		return (
			(x >= of.x && x < (of.x + sz.width)) &&
			(y >= of.y && y < (of.y + sz.height))
			);
	};

	var inTranslate = function(x, y, of, sz) {
		return {
			x : ((of.x * -1) + x),
			y : ((of.y * -1) + y)
		};
	}

	console.log("In image 1: " + ((inImage(5, 5, of1, sz1))? "yes" : "no") + " " + 
				"In image 2: " + ((inImage(5, 5, of2, sz2))? "yes" : "no"));

	var ii1, ii2, it1, it2;
	for(var x = bo1.x; x < bo2.x; x++) {
		result[x] = [];
		for(var y = bo1.y; y < bo2.y; y++) {
			ii1 = inImage(x, y, of1, sz1);
			ii2 = inImage(x, y, of2, sz2);

			if(ii1 && ii2) {
				it1 = inTranslate(x, y, of1, sz1);
				it2 = inTranslate(x, y, of2, sz2);
				result[x][y] = opt.blend(
						this.data[it1.x][it1.y],
						opt.data[it2.x][it2.y]
					);
			} else if(ii1) {
				it1 = inTranslate(x, y, of1, sz1);
				result[x][y] = this.data[it1.x][it1.y];
			} else if(ii2) {
				it2 = inTranslate(x, y, of2, sz2);
				result[x][y] = opt.data[it2.x][it2.y];
			} else {
				result[x][y] = 0;
			}
		}

		result[x] = result[x].slice(bo1.y);
	}
	result = result.slice(bo1.x);

	return {
		data : result,
		offset : bo1,
		size : {
			width : (bo2.x - bo1.x),
			height : (bo2.y - bo1.y)
		}
	};
}



nsky.FxLayer = function() { }
nsky.FxLayer.prototype = new nsky.Layer();

/**
 * To stay consistent with the default, imagebased layer,
 * this method will be called to invoke the effect. It
 * simply extends the options object to incorporate defaults
 * and delegates to the main effect method, doEffect.
 */
nsky.FxLayer.prototype.blend = function(options) { 
		var opt = $.extend({
		offset : {
			x : 0, 
			y : 0
		},
		data : [],
		size : {
			width : 0,
			height : 0
		}
	}, options);

	return this.doEffect(opt);
}

/**
 * This is the main effect method, which the effect implementation
 * overrides. The returnvalue is an object with the images size, offset
 * and pixeldata.
 */
nsky.FxLayer.prototype.doEffect = function(options) { }