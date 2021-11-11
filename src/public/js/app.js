const 
socket = io(),
app = {
	handle: {
		changeBgColor(e) {
			const targetStyle = e.target.style;
			targetStyle.backgroundColor = targetStyle.backgroundColor === "red" ? "#333" : "red";
		},
		seekedHandle(e) {
			socket.emit("seeked", e.target.currentTime);
		}
	},
	get: {
		bgColor(e) {
			return e.target.style.backgroundColor;
		},
		videoElem() {
			return document.getElementById("videoDisplay");
		}
	}
},
videoElem = app.get.videoElem();


socket.emit("join");

box.addEventListener("click", e => {
	e.preventDefault();
	app.handle.changeBgColor(e);
	socket.emit("click", {
		id: e.target.id,
		color: app.get.bgColor(e)
	});
})

socket.on("boxClick", info => {
	const box = document.getElementById(info.id);
	box.style.backgroundColor = info.color;
});


if(true) {
	function playHandle(e) {
		socket.emit("play", () => {
			const videoElem = document.getElementById("videoElem");
			// videoElem.play();
			console.log(1);
		});
	}
	function pauseHandle(e) {
		socket.emit("pause", () => {
			const videoElem = document.getElementById("videoElem");
			console.log(2);
			// videoElem.pause();
		});
	}
	videoElem.addEventListener("play", playHandle);
	videoElem.addEventListener("pause", pauseHandle);
	socket.on("play", () => {
		console.log("this is broadcast play");
		videoElem.play();
	});
	socket.on("pause", () => {
		console.log("this is broadcast pause");
		videoElem.pause();
	});
}

if(false) {
	function playHandle(e) {
		socket.emit("play");
	}
	function pauseHandle(e) {
		socket.emit("pause");
	}
	
	function onPlay() {
		if(videoElem.paused) {
			videoElem.play();
		}
	}
	function onPaues() {
		if(!videoElem.paused) {
			videoElem.pause();
		}
	}
	videoElem.addEventListener("play", playHandle);
	socket.on("play", onPlay);
	
	videoElem.addEventListener("pause", pauseHandle);
	socket.on("pause", onPaues);
}



if(false) {
	videoElem.addEventListener("seeked", app.handle.seekedHandle);
	
	if(false) {
		socket.on("seeked", time => {
			const videoElem = app.get.videoElem();
			videoElem.pause();
			setTimeout(() => {
				videoElem.currentTime = time;
			}, 200)
			// new Promise((res, rej) => {
			// 	res();
			// }).then(() => {
			// });
			// videoElem.paused
		});
	}
	
	if(false) {
		socket.on("seeked", time => {
			const videoElem = app.get.videoElem();
			videoElem.pause();
			if(time === undefined) {
				videoElem.addEventListener("seeked", app.handle.seekedHandle);
			}
			else {
				videoElem.removeEventListener("seeked", app.handle.seekedHandle);
				videoElem.currentTime = time;
			}
		});
	}
}


if(false) {
	videoElem.addEventListener("seeked", e => {
		socket.emit("seeked", {
			id: socket.id,
			time: e.target.currentTime
		});
	});
	socket.on("seeked", info => {
		if(info.isUserControl) {
			app.get.videoElem().currentTime = info.time;
		}
	});
}

if(false) {
	if(false) {
		function seekedHandle(e) {
			socket.emit("seeked", {
				count: 0, 
				time: e.target.currentTime
			});
		}
		videoElem.addEventListener("seeked", seekedHandle);
		socket.on("seeked", info => {
			info.count++;
			console.log(info.count);
			if(info.count <= 6) {
				switch(info.count) {
					case 2:
						videoElem.pause();
						videoElem.removeEventListener("seeked", seekedHandle);
						videoElem.currentTime = info.time;
					break;
					// case 4:
					case 6:
						videoElem.addEventListener("seeked", seekedHandle);
					break;
				}
				socket.emit("seeked", info);
			}
		});
	}
	
	function seekedHandle(e) {
		socket.emit("seeked", e.target.currentTime);
	}
	videoElem.addEventListener("seeked", seekedHandle);
	async function onSeeked(time) {
		await videoElem.pause();
		// videoElem.removeEventListener("seeked", seekedHandle);
		videoElem.currentTime = time;
		// videoElem.addEventListener("seeked", seekedHandle);
	}
	socket.on("seeked", onSeeked);
}

