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
		prop: {
			isFirst: true,
			volume: 1,
		},
		get isFirst() {
			return this.prop.isFirst;
		},
		set isFirst(value) {
			this.prop.isFirst = value;
		},
		get volume() {
			return this.prop.volume;
		},
		set volume(value) {
			this.prop.volume = value;
		},
	},
	elem: {
		video: document.getElementById("videoDisplay"),
		select: document.getElementById("videoList"),
		fullScreenButton: document.getElementById("fullScreenButton"),
		reloadButton: document.getElementById("reloadButton"),
		volumeBar: document.getElementById("volumeBar"),
		soundSwitchButton: document.getElementById("soundSwitchButton"),
		soundSwitchValue: document.getElementById("soundSwitchValue"),
		captionButton: document.getElementById("captionButton")
		
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
			);
			selectVideoElem = Array.from(videoList.children)
			.filter(elem => elem.value === decodeURI(selectVideoElemValue))[0];
			selectVideoElem.selected = true;
		},
		reloadEmit() {
			socket.emit("reload");
			location.reload();
		},
		requestFullScreen() {
			const root = app, 
			videoElem = root.elem.video;
			if (videoElem.mozRequestFullScreen) {
				videoElem.mozRequestFullScreen();
			} else if (videoElem.webkitRequestFullScreen) {
				videoElem.webkitRequestFullScreen();
			}
		},
		isSetText(elem, isText, onText, offText) {
			const text = elem.childNodes[0],
			regex = new RegExp(isText);
			text.data = regex.test(text.data) ? onText : offText
		}
	},
	event: {
		methods: {
			changeBgColor(elem, firstColor, secondColor) {
				const targetStyle = elem.style;
				targetStyle.backgroundColor 
					= targetStyle.backgroundColor === secondColor 
					? firstColor : secondColor;
			},
			bgColor(e) {
				return e.target.style.backgroundColor;
			}
		},
		set: {
			connection: {
				regex: {
					mp4Regex: /\.mp4$/,
					is: {
						mp4Regex(string) {
							const root = app, parent = root.event.set.connection.regex;
							return parent.mp4Regex.test(string);
						}
					}
				},
				methods: {
					createtOptionElem(data) {
						let option = document.createElement("option");
						option.value = data;
						option.innerText = data;
						return option;
					},
					getAppendedFragments(elemArr = []) {
						const df = document.createDocumentFragment();
						elemArr.forEach(elem => {
							df.append(elem);
						})
						return df;
					},
					createVidoeList(list = []) {
						const root = app, 
						parent = root.event.set.connection,
						result = [];
						list.forEach(fileName => {
							if(parent.regex.is.mp4Regex(fileName)) {
								result.push(this.createtOptionElem(fileName));
							}
						})
						return result;
					}
				},
				main() {
					const root = app;
					videoList = root.elem.select;
					
					window.addEventListener("load", () => {
						socket.emit("disconnec", (arrData = []) => {
							arrData = this.methods.createVidoeList(arrData);
							arrData = this.methods.getAppendedFragments(arrData);
							videoList.appendChild(arrData);
							root.methods.setVideoListSelect();
						});
					});
				}
			},
			box: {
				click() {
					const root = app;
					box.addEventListener("click", e => {
						e.preventDefault();
						root.event.methods.changeBgColor(e.target, "#333", "red");
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
						const value = `content/${e.target.value}`
						videoElem.src = value;
						socket.emit("change", value);
					});
					
					socket.on("change", value => {
						videoElem.src = value;
						root.methods.setVideoListSelect();
					});
				}
			},
			reload: {
				button() {
					const root = app, 
					reloadButtonElem = root.elem.reloadButton;
					reloadButtonElem.addEventListener("click", e => {
						root.methods.reloadEmit();
					});
				},
				window() {
					const root = app;
					socket.on("reload", () => {
						console.log("reload!");
						location.reload();
					});
					window.addEventListener("keydown", e => {
						if(e.code === "F5") {
							e.returnValue = false;
							root.methods.reloadEmit();
						}
					});
				},
				main() {
					this.button();
					this.window();
				}
			},
			fullScreen() {
				const root = app, 
				fullScreenButton = root.elem.fullScreenButton;
				fullScreenButton.addEventListener("click", e => {
					root.methods.requestFullScreen();
				})
			},
			volumeBar: {
				main() {
					const root = app,
					videoElem = root.elem.video,
					volumeBar = root.elem.volumeBar,
					soundSwitchButton = root.elem.soundSwitchButton,
					soundSwitchValue = root.elem.soundSwitchValue;
					volumeBar.addEventListener("input", e => {
						if(videoElem.muted || e.target.value === "0") { soundSwitchButton.click(); }
						soundSwitchValue.childNodes[0].data = e.target.value;
						videoElem.volume = Number(e.target.value) / 100;
					});
				}
			},
			soundSwitch: {
				methods: {
					
					isSetVideoElemMute() {
						const root = app, videoElem = root.elem.video;
						videoElem.muted = videoElem.muted ? false : true;
					}
				},
				main() {
					const root = app,
					soundSwitchButton = root.elem.soundSwitchButton;
					soundSwitchButton.addEventListener("click", () => {
						root.event.methods.changeBgColor(
							soundSwitchButton, 
							"rgb(238, 17, 119)", 
							"rgb(75, 178, 102)"
						);
						root.methods.isSetText(soundSwitchButton, "Off", "Sound On", "Sound Off");
						this.methods.isSetVideoElemMute();
					});
				}
			},
			caption: {
				methods: {
					isSetCaptionOnOff() {
						const root = app,
						videoElem = root.elem.video,
						textTrack = videoElem.textTracks[0];
						textTrack.mode 
						= textTrack.mode === "showing"
						? "hidden" : "showing";
					}
				},
				main() {
					const root = app,
					captionButton = root.elem.captionButton;
					captionButton.addEventListener("click", e => {
						root.event.methods.changeBgColor(
							captionButton, 
							"rgb(238, 17, 119)", 
							"rgb(75, 178, 102)"
						);
						root.methods.isSetText(captionButton, "꺼짐", "자막 켜짐", "자막 꺼짐");
						this.methods.isSetCaptionOnOff();
					});
				}
			},
		},
		main() {
			this.set.connection.main();
			this.set.box.click();
			this.set.video.main();
			this.set.select.change();
			this.set.reload.main();
			this.set.fullScreen();
			this.set.volumeBar.main();
			this.set.soundSwitch.main();
			this.set.caption.main();
		}
	},
	main() {
		this.event.main();
	}
}
app.main();