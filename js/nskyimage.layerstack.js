nsky.LayerStack = new function() {

}

nsky.LayerStack.prototype.invalidateCache = function(layer) {

}

nsky.LayerStack.prototype.getCompositeImage = function() {

}

nsky.LayerStack.prototype.select = function(layerArray) {

}

nsky.LayerStack.prototype.remove = function(layer) {

}

nsky.LayerStack.prototype.add = function(layer) {
	this.layers.push({
		layer : layer,
		cache : null,
		visible : true,
		selected : false
	});
}