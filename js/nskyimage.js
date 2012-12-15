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

	console.log("Data length: x(" + opt.data.length + ") y(" + opt.data[0].length + ")");
	console.log(opt.size);
	console.log(opt.offset);
	console.log(bo1);
	console.log(bo2);

	if(bo1.x > canvas.width() || bo1.y > canvas.height()) return;
	if(bo2.x < 0 || bo2.y < 0) return;

	var translate = function(x, y) {
		return {
			x : (opt.offset.x * -1) + x,
			y : (opt.offset.y * -1) + y
		};
	};

	var imageData = context.createImageData(bo2.x - bo1.x, bo2.y - bo1.y);
	console.log(imageData);
	var index = 0;
	var color, coord;
	for(var y = bo1.y; y < bo2.y; y++) {
		for(var x = bo1.x; x < bo2.x; x++) {
			coord = translate(x, y);
			color = opt.data[coord.x][coord.y];
			imageData.data[index++] = (color >>> 24);
			imageData.data[index++] = (color >>> 16) & 0xFF;
			imageData.data[index++] = (color >>> 8 ) & 0xFF;
			imageData.data[index++] = (color       ) & 0xFF;
		}
	}

	context.putImageData(imageData, bo1.x, bo1.y);

}