const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Allow all origins (update this in production)
        methods: ["GET", "POST"],
    },
});

// Socket.IO connection handler
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Join a room based on user ID
    socket.on('join-room', (room) => {
        socket.join(room);
        console.log(`User ${socket.id} joined room ${room}`);
    });

    // Handle custom events
    socket.on('bid-placed', (data) => {
        console.log('Bid placed:', data);
        io.to(`user.${data.user_id}`).emit('bid-placed', data);
    });

    socket.on('auction-ended', (data) => {
        console.log('Auction ended:', data);
        io.to(`user.${data.user_id}`).emit('auction-ended', data);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Start the server
const PORT = 6001;
server.listen(PORT, () => {
    console.log(`Socket.IO server running on port ${PORT}`);
});