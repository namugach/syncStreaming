const 
socket = io(),
app = {
	handle: {
		changeBgColor(e) {
			const targetStyle = e.target.style;
			targetStyle.backgroundColor = targetStyle.backgroundColor === "red" ? "#333" : "red";
		}
	},
	get: {
		bgColor(e) {
			return e.target.style.backgroundColor;
		}
	}
};


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