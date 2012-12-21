
/**
 * Adds Function.bind() for browsers without native
 * support, i.e. IE < 9, Safari Mobile, IE Mobile
 *
 * This code was ripped from MDN
 * (https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Function/bind)
 */
if (!Function.prototype.bind) {  
	console.log("Adding Function.bind support");
	Function.prototype.bind = function (oThis) {  
		if (typeof this !== "function") {  
			// closest thing possible to the ECMAScript 5 internal IsCallable function  
			throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");  
		}  

		var aArgs = Array.prototype.slice.call(arguments, 1),   
	    	fToBind = this,   
	    	fNOP = function () {},  
	    	fBound = function () {  
	          return fToBind.apply(this instanceof fNOP  
	                                 ? this  
	                                 : oThis || window,  
	                               aArgs.concat(Array.prototype.slice.call(arguments)));  
	    };  

		fNOP.prototype = this.prototype;  
		fBound.prototype = new fNOP();  

		return fBound;  
	};  
} 

/************************************************/

var nsky = {};

nsky.Global = {};
nsky.Util = {};
nsky.Canvas = {};

nsky.Init = function(options) {
	var opt = $.extend({
		width : 600,
		height : 500
	}, options);

	nsky.Global.stage = $('#stage');
	nsky.Global.canvas = $('<canvas></canvas>')
	nsky.Global.canvas.width(opt.width);
	nsky.Global.canvas.height(opt.height);

	nsky.Global.canvas.get(0).width = opt.width;
	nsky.Global.canvas.get(0).height = opt.height;

	nsky.Global.stage.append(nsky.Global.canvas);
}

nsky.Util.RGBAtoString = function(rgba) {
	return "rgba(" + 
		( rgba >>> 24) + ", " + 
		((rgba >>> 16) & 0xFF) + ", " + 
		((rgba >>> 8 ) & 0xFF) + ", " + 
		( rgba         & 0xFF) + ")";
}

nsky.Util.RGBAtoColor = function(r, g, b, a) {
	return 	((r & 0xFF) << 24) + 
			((g & 0xFF) << 16) + 
			((b & 0xFF) << 8)  +
			((a & 0xFF)) ;
}

nsky.Util.Channel = function(name, color) {
	switch(name) {
		case 'red':
		case 'r':
			return (color >>> 24) & 0xFF;
		case 'green':
		case 'g':
			return (color >>> 16) & 0xFF;
		case 'blue':
		case 'b':
			return (color >>> 8)  & 0xFF;
		case 'alpha':
		case 'a':
			return (color & 0xFF);
		default:
			return 0;
	}
}

nsky.Canvas.flip = function(options) {
	var opt = $.extend({
		data : [],
		size : {
			width : 0,
			height : 0
		},
		offset : {
			x : 0,
			y : 0
		}
	}, options);

	var canvas = nsky.Global.canvas;
	var context = canvas.get(0).getContext("2d");

	var bo1 = {
		x : (opt.offset.x<0)? 0 : opt.offset.x,
		y : (opt.offset.y<0)? 0 : opt.offset.y
	};
	var bo2 = {
		x : (opt.offset.x + opt.size.width > canvas.width())? canvas.width() : opt.offset.x + opt.size.width,
		y : (opt.offset.y + opt.size.height > canvas.height())? canvas.height() : opt.offset.y + opt.size.height
	};

	if(bo1.x > canvas.width() || bo1.y > canvas.height()) return;
	if(bo2.x < 0 || bo2.y < 0) return;

	var imageData = context.createImageData(bo2.x - bo1.x, bo2.y - bo1.y);

	/** The 'old' blitting method **/

	// var x, y, ox = -opt.offset.x, oy = -opt.offset.y, index = 0;
	// for(var y = bo1.y; y < bo2.y; y++) {
	// 	for(var x = bo1.x; x < bo2.x; x++) {
	// 		color = opt.data[ox+x][oy+y];
	// 		imageData.data[index++] = (color >>> 24);
	// 		imageData.data[index++] = (color >>> 16) & 0xFF;
	// 		imageData.data[index++] = (color >>> 8 ) & 0xFF;
	// 		imageData.data[index++] = (color       ) & 0xFF;
	// 	}
	// }

	/** new 32 blitting starts here **/
	/** this is much faster (2x) in chrome and firefox. Small performance
		plus in safari. **/
	var data = imageData.data;
	var buffer = new ArrayBuffer(data.length);
	var buffer8 = new Uint8ClampedArray(buffer);
	var data32 = new Uint32Array(buffer);

	data32[1] = 0x0a0b0c0d;
    var littleEndian = true;
    if (buffer[4] === 0x0a && buffer[5] === 0x0b && buffer[6] === 0x0c && buffer[7] === 0x0d)
      littleEndian = false;

	var index = 0;
	var x, y, ox = -opt.offset.x, oy = -opt.offset.y, color;
	if(littleEndian) {
		for(y = bo1.y; y < bo2.y; y++) {
		 	for(x = bo1.x; x < bo2.x; x++) {
		 		//TODO: It's quite late and i'm not sure how this
		 		//behaves if the device is bigEndian (ARM Devices??)
		 		color = opt.data[ox+x][oy+y];
		    	data32[index++] = (color >>> 24) |
		    		((color >>> 8) & 0xFF00) |
		    		((color << 8) & 0xFF0000) |
		    		((color << 24));
		    }
		}
	} else {
		for(y = bo1.y; y < bo2.y; y++) {
		 	for(x = bo1.x; x < bo2.x; x++) {
		 		//TODO: It's quite late and i'm not sure how this
		 		//behaves if the device is bigEndian (ARM Devices??)
		    	data32[index++] = opt.data[ox+x][oy+y];
		    }
		}
	}

	data.set(buffer8);
    
	/** ends here **/


	context.putImageData(imageData, bo1.x, bo1.y);

}
