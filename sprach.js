let context;
let bufferLoader;
const keyMap = {
	'0': 0, '1': 1, '2': 2, '3': 3, '4': 4,
	'5': 5, '6': 6, '7': 7, '8': 8, '9': 9,
	'A': 10, 'B': 11, 'C': 12, 'D': 13, 'E': 14, 'F': 15,
	'G': 16, 'H': 17, 'I': 18, 'J': 19, 'K': 20, 'L': 21,
	'M': 22, 'N': 23, 'O': 24, 'P': 25, 'Q': 26, 'R': 27,
	'S': 28, 'T': 29, 'U': 30, 'V': 31, 'W': 32, 'X': 33,
	'Y': 34, 'Z': 35,
	'*': 36, '/': 37, '+': 38
};

function init() {
	try {
		window.AudioContext = window.AudioContext || window.webkitAudioContext;
		context = new AudioContext();
	} catch (e) {
		alert('Web Audio API is not supported in this browser');
		return;
	}
	bufferLoader = new BufferLoader(
		context, [
		'./sounds/numbers/0.wav', './sounds/numbers/1.wav', './sounds/numbers/2.wav',
		'./sounds/numbers/3.wav', './sounds/numbers/4.wav', './sounds/numbers/5.wav',
		'./sounds/numbers/6.wav', './sounds/numbers/7.wav', './sounds/numbers/8.wav',
		'./sounds/numbers/9.wav',
		'./sounds/letters/A.wav', './sounds/letters/B.wav', './sounds/letters/C.wav',
		'./sounds/letters/D.wav', './sounds/letters/E.wav', './sounds/letters/F.wav',
		'./sounds/letters/G.wav', './sounds/letters/H.wav', './sounds/letters/I.wav',
		'./sounds/letters/J.wav', './sounds/letters/K.wav', './sounds/letters/L.wav',
		'./sounds/letters/M.wav', './sounds/letters/N.wav', './sounds/letters/O.wav',
		'./sounds/letters/P.wav', './sounds/letters/Q.wav', './sounds/letters/R.wav',
		'./sounds/letters/S.wav', './sounds/letters/T.wav', './sounds/letters/U.wav',
		'./sounds/letters/V.wav', './sounds/letters/W.wav', './sounds/letters/X.wav',
		'./sounds/letters/Y.wav', './sounds/letters/Z.wav',
		'./sounds/words/attention.wav', './sounds/words/danger.wav',
		'./sounds/words/end.wav', './sounds/words/operation.wav',
		'./sounds/words/warning.wav',
	],
		finishedLoading
	);
	bufferLoader.load();
}

function playSound(index, timeOffset) {
	if (!window.sounds || !window.sounds[index]) return;

	const source = context.createBufferSource();
	source.buffer = window.sounds[index];
	source.connect(context.destination);
	const when = context.currentTime + (timeOffset || 0);
	if (source.start) {
		source.start(when);
	} else {
		source.noteOn(when);
	}
}

function finishedLoading(bufferList) {
	window.sounds = bufferList;
}

function sendMessage() {
	const callRepeat = 4;
	const delay = 4;
	const speed = 0.8;

	const call = document.getElementById("call").value.toUpperCase();
	const body = document.getElementById("body").value.toUpperCase();

	for (let i = 0; i < callRepeat; i++) {
		for (let j = 0; j < call.length; j++) {
			const idx = keyMap[call[j]];
			if (idx !== undefined) {
				playSound(idx, (speed * j) + (delay * i));
			}
		}
	}

	// Separator (sound index 36 = "*")
	playSound(36, delay * callRepeat);

	for (let k = 0; k < body.length; k++) {
		const idx = keyMap[body[k]];
		if (idx !== undefined) {
			playSound(idx, (speed * k) + (delay * callRepeat) + 2);
		}
	}

	// Ending separator (sound index 37 = "/")
	playSound(37, (speed * body.length) + (delay * callRepeat) + 3);
}

window.onload = function () {
	init();

	document.forms[0].onsubmit = function (e) {
		e.preventDefault();
		sendMessage();
	};

	document.getElementById("keyboard").addEventListener("keypress", function (e) {
		const key = e.key.toUpperCase();
		const idx = keyMap[key];
		if (idx !== undefined) {
			playSound(idx, 0);
		}
	});
};

/* Required BufferLoader definition */
function BufferLoader(context, urlList, callback) {
	this.context = context;
	this.urlList = urlList;
	this.onload = callback;
	this.bufferList = new Array();
	this.loadCount = 0;
}

BufferLoader.prototype.loadBuffer = function (url, index) {
	const request = new XMLHttpRequest();
	request.open("GET", url, true);
	request.responseType = "arraybuffer";

	const loader = this;

	request.onload = function () {
		loader.context.decodeAudioData(
			request.response,
			function (buffer) {
				if (!buffer) {
					console.error('Error decoding file data: ' + url);
					return;
				}
				loader.bufferList[index] = buffer;
				if (++loader.loadCount === loader.urlList.length) {
					loader.onload(loader.bufferList);
				}
			},
			function (error) {
				console.error('decodeAudioData error:', error);
			}
		);
	};

	request.onerror = function () {
		console.error('BufferLoader: XHR error loading ' + url);
	};

	request.send();
};

BufferLoader.prototype.load = function () {
	for (let i = 0; i < this.urlList.length; ++i) {
		this.loadBuffer(this.urlList[i], i);
	}
};
