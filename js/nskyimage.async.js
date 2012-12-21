nsky.Async = {};

//this is fixed because f*cking javascript offers no way
//of letting me know how many cores your cpu has... assuming
//that dualcore+ht (4 logical cores) is ok for everyone.
nsky.Async.maxThreads = 4; //parseInt(prompt("How many (logical cores) does your cpu have?"));
nsky.Async.pool = [];
nsky.Async.path = 'js/nskyimage.layerfx.js';

nsky.Async.DoAsync = function(command, options, data, callback, forceSingleThread) {

	(new nsky.Async.AsyncTask(command, 
							  options, 
							  data, 
							  callback))
	.start((forceSingleThread)? 1 : nsky.Async.maxThreads);

}

nsky.Async.AsyncTask = function(command, options, data, callback) {
	this.command = command;
	this.data = data;
	this.callback = callback;
	this.fxoptions = options;
	this.finish = this.onFinish.bind(this);
}

nsky.Async.AsyncTask.prototype.start = function(numWorkers) {
	this.workers = this.getPooledWorkers(numWorkers);
	this.slices = this.sliceData(this.data, numWorkers);
	this.counter = 0;
	this.numWorkers = numWorkers;

	var self = this;

	for(var i = 0; i < numWorkers; i++) {
		this.workers[i].worker.addEventListener('message', this.finish);

		this.workers[i].worker.postMessage({
			cmd : self.command,
			data : self.slices[i],
			options : self.fxoptions,
			index : i
		});
	}
}

nsky.Async.AsyncTask.prototype.onFinish = function(event) {
	var result = event.data;
	var worker = this.workers[result.index];
	worker.worker.removeEventListener('message', this.finish);
	worker.free = true;

	this.slices[result.index] = result.data;

	if(++this.counter == this.numWorkers) {
		var result = [];
		for(var i = 0; i < this.numWorkers; i++) 
			result = result.concat(this.slices[i]);

		this.callback(result);
	}

}

//slices the array in num (mostly) equal sized parts
nsky.Async.AsyncTask.prototype.sliceData = function(arrayData, num) {
	var len = arrayData.length;
	var numSlices = (num > len)? arrayData.length : num;

	var sliceSize = Math.floor(len / numSlices);
	var slices = [];
	var offset = 0;
	for(var i = 0; i < numSlices - 1; i++) {
		slices[i] = arrayData.slice(offset, offset + sliceSize);
		offset += sliceSize;
	}

	slices.push(arrayData.slice(offset, len));
	return slices;
}

// Returns num webworkers from the pool
nsky.Async.AsyncTask.prototype.getPooledWorkers = function(num) {
	var pool = nsky.Async.pool;
	var lokl = [];

	if(pool.length > 0) {
		for(var i = 0; i < pool.length; i++) {
			if(pool[i].free) {
				pool[i].free = false;
				lokl.push(pool[i]);
				if(lokl.length == num)
					return lokl;
			}
		}
	}

	var tmp, max = (num - lokl.length);
	for(var i = 0; i < max; i++) {
		tmp = this.createPooledWorker();
		pool.push(tmp);
		lokl.push(tmp);
	}

	console.log("W-Pool size: ", nsky.Async.pool.length, " (+" + max + ")");
	return lokl;
}

// creates a new worker
nsky.Async.AsyncTask.prototype.createPooledWorker = function() {
	return {
		free : false,
		worker : new Worker(nsky.Async.path)
	};
}