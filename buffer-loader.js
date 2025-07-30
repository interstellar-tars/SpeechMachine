function BufferLoader(context, urlList, callback) {
	this.context = context;
	this.urlList = urlList;
	this.onload = callback;
	this.bufferList = new Array(urlList.length);
	this.loadCount = 0;
}

BufferLoader.prototype.loadBuffer = function (url, index) {
	const request = new XMLHttpRequest();
	request.open("GET", url, true);
	request.responseType = "arraybuffer";

	const loader = this;

	request.onload = function () {
		if (request.status < 200 || request.status >= 300) {
			console.error(`Failed to load ${url} (status ${request.status})`);
			return;
		}

		loader.context.decodeAudioData(
			request.response,
			function (buffer) {
				if (!buffer) {
					console.error(`Error decoding audio file: ${url}`);
					return;
				}
				loader.bufferList[index] = buffer;
				loader.loadCount++;

				if (loader.loadCount === loader.urlList.length) {
					loader.onload(loader.bufferList);
				}
			},
			function (error) {
				console.error(`decodeAudioData error for ${url}:`, error);
			}
		);
	};

	request.onerror = function () {
		console.error(`XHR error while loading ${url}`);
	};

	request.send();
};

BufferLoader.prototype.load = function () {
	for (let i = 0; i < this.urlList.length; i++) {
		this.loadBuffer(this.urlList[i], i);
	}
};
