const 
socket = io(),
app = {
	util: {
		cut(source, string) {
			source = source.split(string)
			source.shift();
			return source[0];
		}
	},
	state: {
		isFirst: true
	},
	elem: {
		video: document.getElementById("videoDisplay"),
		select: document.getElementById("videoList")
	},
	methods: {
		setIsFirstEmit(emitType) {
			const root = app;
			root.state.isFirst 
			? socket.emit(emitType, root.elem.video.currentTime)
			: root.state.isFirst = true;
		},
		setIsFirstVideoElemTimeAction(info, type) {
			const root = app, videoElem = root.elem.video;
			root.state.isFirst = info.isFirst;
			videoElem.currentTime = info.time;
			videoElem[type]();
		},
		setVideoListSelect() {
			const root = app, videoElem = root.elem.video, videoList = root.elem.select,
			selectVideoElemValue = root.util.cut(
				videoElem.src, `${videoElem.baseURI}content/`
			),
			selectVideoElem = Array.from(videoList.children)
			.filter(elem => elem.value === selectVideoElemValue)[0];
			selectVideoElem.selected = true;
		}
	},
	event: {
		methods: {
			changeBgColor(e) {
				const targetStyle = e.target.style;
				targetStyle.backgroundColor = targetStyle.backgroundColor === "red" ? "#333" : "red";
			},
			bgColor(e) {
				return e.target.style.backgroundColor;
			},
		},
		set: {
			box: {
				click() {
					const root = app;
					box.addEventListener("click", e => {
						e.preventDefault();
						root.event.methods.changeBgColor(e);
						socket.emit("click", {
							id: e.target.id,
							color: root.event.methods.bgColor(e)
						});
					})
					
					socket.on("boxClick", info => {
						const box = document.getElementById(info.id);
						box.style.backgroundColor = info.color;
					});
				}
			},
			video: {
				play() {
					const root = app, videoElem = root.elem.video;

					videoElem.addEventListener("play", e => {
						console.log(1, "play");
						root.methods.setIsFirstEmit("play");
					});
					socket.on("play", info => {
						root.methods.setIsFirstVideoElemTimeAction(info, "play");
					});
				},
				pause() {
					const root = app, videoElem = root.elem.video;

					videoElem.addEventListener("pause", e => {
						console.log(2, "pause");
						root.methods.setIsFirstEmit("pause");
					});
					socket.on("pause", info => {
						root.methods.setIsFirstVideoElemTimeAction(info, "pause");
					});
				},
				/**
				 * 이거 넣으면 싱크가 묘하게 맞질 않네
				 */
				seeked() {
					const root = app, videoElem = root.elem.video;

					videoElem.addEventListener("seeked", e => {
						console.log(3, "seeked");
						root.methods.setIsFirstEmit("seeked");
					});
					socket.on("seeked", info => {
						const root = app, videoElem = root.elem.video;
						root.state.isFirst = info.isFirst;
						videoElem.currentTime = info.time;
					});
				},
				main() {
					this.play();
					this.pause();
					this.seeked();
				}
			},
			select: {
				change() {
					const root = app, 
					videoList = root.elem.select, 
					videoElem = root.elem.video;
					videoList.addEventListener("change", e => {
						const value = `${location.href}content/${e.target.value}`
						videoElem.src = value;
						socket.emit("change", value);
					});
					
					socket.on("change", value => {
						videoElem.src = value;
						root.methods.setVideoListSelect();
					});
				}
			}
		},
		main() {
			this.set.box.click();
			this.set.video.main();
			this.set.select.change();
		}
	},

	main() {
		this.methods.setVideoListSelect();
		this.event.main();
	}
}
app.main();