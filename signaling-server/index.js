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

    // Receive signal unique and not ambiguous for this service
    socket.on("special-signal", (type, roomId, result) => {
        switch (type) {
            // Create room with specific id
            case "create-room":
                if (!signalRoomsContent.has(roomId)) {
                    signalRoomsContent.set(roomId, []);
                    result(true);
                }
                else result(false);
            break;

            // Join to room having determined identifier
            case "join-to-room":
                if (sRooms.has(roomId)) {
                    socket.join(roomId);
                    socket.in(roomId).emit("new-room-user");
                }
                else result(false);
            break;
        }
    })
    
    // Recive signal typical for WebRTC signaling server and send back to same channel
    socket.on("signal", (signal, result) => {
        const { type, content, roomId } = signal;

        switch (type) {
            case "offer":
            case "answer":
                // Down when recived room isn't on rooms content list
                if (!signalRoomsContent.has(roomId)) {
                    signalRoomsContent.set(roomId, []);
                };
        
                // Down when user isn't in recived room
                if (!sRooms.includes(roomId)) {
                    signalRoomsContent.set(roomId, []);
                    socket.join(roomId);
                };
        
                // Emit callback to room
                socket.in(roomId).emit("signal-recived", signal);

                result(true);
            break;

            default:
                result(false)
        }
    });
});

httpServer.listen(8080, () => {
    console.log("http server is listening for connections")  
});
