import express from "express";

const app = express();

app.use(express.static(__dirname + "/public"));
app.set("views", `${__dirname}/public/views`);
app.set('view engine', 'ejs');
app.get("/", (req, res) => res.render("index"));

const handleListen = () => console.log("Listening on http://localhost:3000");
app.listen(3000, handleListen);