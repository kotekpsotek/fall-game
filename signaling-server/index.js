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

wss.on("connection", socket => {
    // FIXME: this is only for developement process REMOVE for production
    console.log(socket.id + " is connected!")
    
    // Map rooms to form of array
    const sRooms = [];
    for (const room of socket.rooms.keys()) {
        sRooms.push(room);
    }

    // Receive information about new candidate
    socket.on("new-candidate", (roomId, candData) => {
        if (sRooms.includes(roomId)) {
            // Add new candidate to room candidates list
            if (candData.type == "offer" && signalRoomsContent.has(roomId)) {
                const roomData = signalRoomsContent.get(roomId);
                signalRoomsContent.set(roomId, [...roomData, candData]);
            };
    
            // Pass data further: offer/answer event
            socket.in(roomId).emit(candData.type, candData);
        }
    })

    // Creating signaling channel
    socket.on("create-channel", (roomId, result) => {
        if (signalRoomsContent.has(roomId)) {
            signalRoomsContent.set(roomId, []);
            socket.join(roomId);
            result(true);
        }
        else result(false);
    })
    

});

httpServer.listen(8080, () => {
    console.log("http server is listening for connections")  
});
