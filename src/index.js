import http from "http";
import SocketIO from "socket.io";
// import WebSocket from "ws"; 
import express from "express";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));

app.get("/chat", (req, res) => res.render("chat"));
app.get("/video", (req, res) => res.render("video"));
app.get("/screen", (req, res) => res.render("screen"));
app.get("/", (req, res) => res.redirect("/screen"));
// app.get("/test", (req, res) => res.sendFile(__dirname + "/public/js/sample.xml"));

const handleListen = () => console.log(`Listening on http://localhost:3000`);

// app.listen(3000);  

const server = http.createServer(app);
const io = SocketIO(server);

const findPublicRoom = () => {
    const {
        sockets: {
            adapter: {
                sids,
                rooms
            }
        }
    } = io;

    const publicRooms = [];

    rooms.forEach((_, key) => {
        if (!sids.get(key)) publicRooms.push(key)
    });

    return publicRooms;
}

const countPerson = (roomName) => (io.sockets.adapter.room.get(roomName)?.size)

io.on("connection", socket => {
    socket.name = "anonymous";

    socket.onAny(event => console.log(`Socket Event: ${event}`));

    socket.on("enter_chat", (roomNo, name, callback) => {
        socket.join(roomNo);
        socket.name = name;
        callback();
        socket.to(roomNo).emit("join", socket.name);
        io.sockets.emit("room_change", findPublicRoom());
    });

    socket.on("enter_video", (roomId) => {
        socket.join(roomId);
        socket.to(roomId).emit("join_video");
    });

    socket.on("webRTC_offer", (offer, roomId) => {
        socket.to(roomId).emit("webRTC_offer", offer);
    }); 

    socket.on("webRTC_answer", (answer, roomId) => {
        socket.to(roomId).emit("webRTC_answer", answer);
    }); 

    socket.on("webRTC_ice", (ice, roomId) => {
        socket.to(roomId).emit("webRTC_ice", ice);
    });
    
    socket.on("disconnecting", () => {
        socket.rooms.forEach(room => socket.to(room).emit("quit", socket.name));
    });

    socket.on("chat", (roomNo, msg, callback) => {
        socket.to(roomNo).emit("chat", socket.name, msg);
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