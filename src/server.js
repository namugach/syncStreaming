import fs from "fs";
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
				connection: {
					main(socket) {
						// done([1,2,3,4]);
						socket.on("disconnec", done => {
							const dir = `${__dirname}/public/content`;
							fs.readdir(dir, (err, list) => {
								done(list);
							});
						});
					}
				},
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
							// console.log(type);
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
				},
				reload: {
					window(socket) {
						socket.on("reload", () => {
							socket.broadcast.emit("reload");
						});
					}
				}
			},
			main() {
				const root = server;
				root.instance.wsServer.on("connection", socket => {
					this.on.connection.main(socket);
					this.on.box.click(socket);
					this.on.video.add(socket, "play");
					this.on.video.add(socket, "pause");
					this.on.video.add(socket, "seeked");
					this.on.select.change(socket);
					this.on.reload.window(socket);
				});
			}
		},
	},
	methods: {
		port: 5000,
		serverStart() {
			const root = server;
			root.instance.httpServer.listen(
				this.port, () => console.log(`Listening on http://localhost:${this.port}`)
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
