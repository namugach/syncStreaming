import http from "http";
import SocketIO from "socket.io";
import express from "express";

const server = {
	instance: {
		app: express(),
		httpServer: null,
		wsServer: null
	},
	init() {
		let
		root 				= server, 
		instance		= root.instance,
		app 				= instance.app;

		app.set('view engine', 'ejs');
		app.set("views", `${__dirname}/public/views`);
		app.use(express.static(__dirname + "/public"));
		app.get("/", (req, res) => res.render("index"));

		instance.httpServer = http.createServer(app);
		instance.wsServer = SocketIO(instance.httpServer);
	},
	set: {
		socket: {
			on: {
				box: {
					click(socket) {
						socket.on("click", info => {
							socket.broadcast.emit("boxClick", info);
						});
					}
				},
				video: {
					add(socket, type) {
						socket.on(type, time => {
							console.log(type);
							socket.broadcast.emit(type, {
								time, isFirst: false
							});
						});
					}
				},
				select: {
					change(socket) {
						socket.on("change", value => {
							socket.broadcast.emit("change", value);
						});
					}
				}
			},
			main() {
				const root = server;
				root.instance.wsServer.on("connection", socket => {
					this.on.box.click(socket);
					this.on.video.add(socket, "play");
					this.on.video.add(socket, "pause");
					this.on.video.add(socket, "seeked");
					this.on.select.change(socket);
				});
			}
		},
	},
	methods: {
		serverStart() {
			const root = server;
			root.instance.httpServer.listen(
				3000, () => console.log("Listening on http://localhost:3000")
			);
		}
	},
	main() {
		this.init();
		this.set.socket.main();
		this.methods.serverStart();
	}
}

server.main();
