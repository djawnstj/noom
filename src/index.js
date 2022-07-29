import http from "http";
import SocketIO from "socket.io";
// import WebSocket from "ws"; 
import express from "express";

const app = express(); 

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));

app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));

const handleListen = () => console.log(`Listening on http://localhost:3000`);

// app.listen(3000);  

const server = http.createServer(app);
const io = SocketIO(server);

io.on("connection", socket => {

    socket.onAny(event => console.log(`Socket Event: ${event}`));

    socket.on("room", (roomNo, callback) => {
        socket.join(roomNo);
        callback();
        socket.to(roomNo).emit("welcome");
    });

    socket.on("disconnecting", () => {
        socket.rooms.forEach(room => socket.to(room).emit("bye"));
    });

    socket.on("chat", (roomNo, msg, callback) => {
        socket.to(roomNo).emit("chat", msg);
        callback();
    });

});

/* 
const wss = new WebSocket.Server({ server });

const sockets = [];

wss.on("connection", (socket) => {

    sockets.push(socket);
    socket["nickName"] = "Anon"

    console.log("Connect to Browser");

    socket.on("close", () => console.log("Disconnect from Browser"));

    socket.on("message", (msg) => {
        const params = JSON.parse(msg.toString("utf8"));
        console.log(params)

        switch (params.type) {
            case "message":
                sockets.forEach(aSocket => aSocket.send(`${socket.nickName}: ${params.value}`));
            case "nickName":
                socket["nickName"] = params.value;
        }
        
        // socket.send(msg.toString("utf8"))
    });
});
 */

server.listen(3000, handleListen);
