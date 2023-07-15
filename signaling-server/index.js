const express = require("express");
const { Server } = require("socket.io");
const { createServer } = require("http");
const crypto = require("crypto");

const app = express();
const httpServer = createServer(app);
const wss = new Server(httpServer, {
    cors: {
        origin: "http://localhost:5173"
    }
});

const signalRoomsContent = new Map();
const offers = [];

wss.on("connection", socket => {
    const unvRoomName = "abc123456789";
    
    // Room
    socket.on("room", (action, cb) => {
        switch (action) {
            case "create":
                socket.join(unvRoomName);
            break
            case "join":
                socket.join(unvRoomName);
                cb(offers)
            break;
        }
    })

    // Signal
    socket.on("signal", (data) => {
        if (data.type == "offer") {
            offers.push(data);
        };
        
        socket.in(unvRoomName).emit("signal-recv", data);
    });
});

httpServer.listen(8080, () => {
    console.log("http server is listening for connections")  
});
