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

wsServer.on("connection", socket => {
	socket.on("join", () => {
		socket.join(roomName);
	});
	socket.on("click", info => {
		socket.to(roomName).emit("boxClick", info);
	});
});

const handleListen = () => console.log("Listening on http://localhost:3000");
httpServer.listen(3000, handleListen);