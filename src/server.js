import http from "http";
import SocketIO from "socket.io";
import express from "express";

const app = express();

app.set('view engine', 'ejs');
app.set("views", `${__dirname}/public/views`);
app.use(express.static(__dirname + "/public"));
app.get("/", (req, res) => res.render("index"));




const httpServer = http.createServer(app),
wsServer = SocketIO(httpServer),
roomName = "room";

let prevSocketId = "";


wsServer.on("connection", socket => {
	socket.on("join", () => {
		socket.join(roomName);
	});
	socket.on("click", info => {
		socket.to(roomName).emit("boxClick", info);
	});
	if(true) {
	
		socket.on("play", () => {
			console.log(1);
			socket.broadcast.emit("play");
		});
		socket.on("pause", () => {
			console.log(2);
			socket.broadcast.emit("pause");
		});
	}
	if(false) {
		let limit = 0;
		function onPlay() {
			console.log("play");
			if(limit <= 3) {
				socket.to(roomName).emit("play");
			}
			else {
				socket.to(roomName).emit("play");
				socket.off("play", onPlay);
				socket.on("play", onPlay);
				limit = 0;
			}
			console.log(limit);
			limit++;
		}
		function onPause() {
			console.log("pause");
			if(limit <= 3) {
				socket.to(roomName).emit("pause");
			}
			else {
				socket.to(roomName).emit("pause");
				socket.off("pause", onPause);
				socket.on("pause", onPause);
				limit = 0;
			}
		}
		
		socket.on("play", onPlay);
		socket.on("pause", onPause);
	}


	if(false) {
		socket.on("seeked", time => {
			socket.to(roomName).emit("seeked", time);
		});
		socket.on("seeked", () => {
			socket.to(roomName).emit("seeked");
		});
	}

	if(false) {
		socket.on("seeked", info => {
			socket.to(roomName).emit("seeked", {
				time: info.time,
				isUserControl: info.id === prevSocketId
			});
			prevSocketId = info.id;
		});
		// socket.on("seeked", info => {
		// 	socket.to(roomName).emit("seeked", {
		// 		time: info.time,
		// 		isUserControl: false
		// 	});
		// });
	}
	if(false) {
		socket.on("seeked", info => {
			info.count++;
			if(info.count <= 6) {
				console.log(info.count);
				socket.to(roomName).emit("seeked", info);
			}
		});
	}
	if(false) {
		let count = 0;
		socket.on("seeked", time => {
			console.log(count, time);
			if(count < 2) {
				socket.to(roomName).emit("seeked", time);
			}
			else {
				count = 0;
			}
			count++;
		}); 
	}

});

const handleListen = () => console.log("Listening on http://localhost:3000");
httpServer.listen(3000, handleListen);