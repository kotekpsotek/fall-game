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

// Store content for signaling rooms
const signalRoomsContent = new Map();

wss.on("connection", socket => {
    // Room
    socket.on("room", (action, roomId, cb) => {
        switch (action) {
            case "create":
                if (!signalRoomsContent.has(roomId)) {
                    socket.join(roomId);
                    signalRoomsContent.set(roomId, []);
                }
            break
            case "join":
                const srOffers = signalRoomsContent.get(roomId);

                if (srOffers) {
                    socket.join(roomId);
                    cb(srOffers);
                }
            break;
        }
    })

    // Signal
    socket.on("signal", (data, roomId) => {
        if (data.type == "offer") { // Create signaling room or update it content
            // Get room offers
            const offers = signalRoomsContent.get(roomId) || [];

            // Modify offers
            offers.push(data);
            
            // Update offers
            signalRoomsContent.set(roomId, offers);
        };
        
        socket.in(roomId).emit("signal-recv", data);
    });
});

httpServer.listen(8080, () => {
    console.log("http server is listening for connections")  
});
