import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import logger from '../utils/logger';

interface RoomUser {
    socketId: string;
    username: string;
    userId: string;
}

export const setupVideoCallServer = (server: HTTPServer) => {
    const io = new SocketIOServer(server, {
        path: '/video-call',
        cors: {
            origin: process.env.FRONTEND_URL,
            methods: ["GET", "POST"]
        }
    });

    const rooms = new Map<string, Map<string, RoomUser>>();

    io.on('connection', (socket) => {
        logger.info(`Client connected from VideoCallServer: ${socket.id}`);

        socket.on('join-room', ({ roomId, username, userId }) => {
            // Initialize room if it doesn't exist
            if (!rooms.has(roomId)) {
                rooms.set(roomId, new Map());
            }

            const room = rooms.get(roomId)!;

            const existingConnections = Array.from(room.entries())
                .filter(([_, user]) => user.userId === userId);

            for (const [oldSocketId, user] of existingConnections) {
                if (oldSocketId !== socket.id) {
                    logger.info(`Cleaning up existing connection for ${user.username} (${oldSocketId})`);
                    room.delete(oldSocketId);
                    io.to(roomId).emit('user-disconnected', {
                        socketId: oldSocketId,
                        disconnectedUser: user
                    });
                }
            }

            room.set(socket.id, { socketId: socket.id, username, userId });
            socket.join(roomId);

            // Log current room state
            logger.info(`Room ${roomId} current users: ${Array.from(room.values())
                .map(u => `${u.username} (${u.socketId})`)
                .join(', ')}`);

            // Notify others in the room
            socket.to(roomId).emit('user-joined', {
                peerId: socket.id,
                username
            });

            logger.info(`VideoCallServer: Emitted user-joined event for user ${username} to room ${roomId}`);

            // Send existing users to the new user
            const existingUsers = Array.from(room.entries())
                .filter(([id]) => id !== socket.id)
                .map(([id, user]) => ({
                    peerId: id,
                    username: user.username
                }));

            if (existingUsers.length > 0) {
                socket.emit('existing-users', existingUsers);
                logger.info(`VideoCallServer: Sent existing users to ${username}: ${existingUsers.map(u => u.username).join(', ')}`);
            }
        });

        // Handle WebRTC signaling
        socket.on('offer', ({ offer, peerId, roomId, username }) => {
            socket.to(peerId).emit('offer', {
                offer,
                peerId: socket.id,
                username
            });
        });

        socket.on('answer', ({ answer, peerId, roomId }) => {
            socket.to(peerId).emit('answer', {
                answer,
                peerId: socket.id
            });
        });

        socket.on('ice-candidate', ({ candidate, peerId, roomId }) => {
            socket.to(peerId).emit('ice-candidate', {
                candidate,
                peerId: socket.id
            });
        });

        socket.on("disconnect", () => {
            rooms.forEach((users, roomId) => {
                if (users.has(socket.id)) {
                    const disconnectedUser = users.get(socket.id);
                    users.delete(socket.id);
                    io.to(roomId).emit("user-disconnected", { socketId: socket.id, disconnectedUser });
                    logger.info(`User ${disconnectedUser?.username} disconnected from room ${roomId}`);

                    if (users.size === 0) {
                        rooms.delete(roomId);
                        logger.info(`Room ${roomId} deleted - no users remaining`);
                    }
                }
            });
        });
    });

    logger.info(`Video Call WebSocket server is set up on /video-call`);
};
