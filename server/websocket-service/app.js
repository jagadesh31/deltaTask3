const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { createClient } = require('redis');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:8000',
    methods: ['GET', 'POST']
  }
});

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const redisClient = createClient({ url: redisUrl });
const redisSubscriber = createClient({ url: redisUrl });

redisClient.on('error', err => console.error('Redis Client Error', err));
redisSubscriber.on('error', err => console.error('Redis Subscriber Error', err));

Promise.all([redisClient.connect(), redisSubscriber.connect()]).then(() => {
  console.log('Connected to Redis');
  // Subscribe to expired keys
  redisSubscriber.subscribe('__keyevent@0__:expired', (message, channel) => {
    // message is the key that expired, e.g., roomSeats:roomName:seatId
    if (message.startsWith('roomSeats:')) {
      const parts = message.split(':');
      if (parts.length === 3) {
        const roomName = parts[1];
        const seatId = parts[2];
        io.to(roomName).emit('seatDeselected', { seatId, by: 'timeout' });
        console.log(`Seat ${seatId} auto-deselected in room ${roomName} due to TTL timeout`);
      }
    }
  });
}).catch(console.error);

app.get('/', (req, res) => {
  res.send('WebSocket Service Running (Redis Powered)');
});

app.get('/health', (req, res) => {
  res.json({ port: Number(process.env.PORT) || 8005, health: true });
});

io.on('connection', (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);

  socket.on('joinRoom', async (roomName) => {
    socket.join(roomName);
    console.log(`${socket.id} joined room: ${roomName}`);
    
    try {
      const keys = await redisClient.keys(`roomSeats:${roomName}:*`);
      if (keys.length > 0) {
        const selectedSeats = keys.map(k => k.split(':')[2]);
        socket.emit('initialState', selectedSeats);
      }
    } catch (err) {
      console.error('Error fetching initial state:', err);
    }
  });

  socket.on('leaveRoom', async (roomName) => {
    socket.leave(roomName);
    await clearUserSeats(socket.id, roomName);
    console.log(`${socket.id} left room: ${roomName}`);
  });

  socket.on('seatSelected', async ({ roomName, seatId }) => {
    try {
      const lockKey = `roomSeats:${roomName}:${seatId}`;
      // Set key only if it doesn't exist, expire in 300 seconds (5 mins)
      const acquired = await redisClient.set(lockKey, socket.id, { NX: true, EX: 300 });
      if (acquired) {
        // Track the lock for this user
        await redisClient.sAdd(`userLocks:${socket.id}`, lockKey);
        socket.to(roomName).emit('seatSelected', { seatId, by: socket.id });
        console.log(`Seat ${seatId} locked in room ${roomName} by ${socket.id}`);
      }
    } catch (err) {
      console.error('Error locking seat:', err);
    }
  });

  socket.on('seatDeselected', async ({ roomName, seatId }) => {
    try {
      const lockKey = `roomSeats:${roomName}:${seatId}`;
      const owner = await redisClient.get(lockKey);
      if (owner === socket.id) {
        await redisClient.del(lockKey);
        await redisClient.sRem(`userLocks:${socket.id}`, lockKey);
        socket.to(roomName).emit('seatDeselected', { seatId, by: socket.id });
        console.log(`Seat ${seatId} unlocked in room ${roomName} by ${socket.id}`);
      }
    } catch (err) {
      console.error('Error unlocking seat:', err);
    }
  });

  const clearUserSeats = async (socketId, specificRoom = null) => {
    try {
      const userLocksKey = `userLocks:${socketId}`;
      const locks = await redisClient.sMembers(userLocksKey);
      
      for (const lockKey of locks) {
        const parts = lockKey.split(':');
        const roomName = parts[1];
        const seatId = parts[2];

        // If specificRoom is provided, only clear locks for that room
        if (specificRoom && roomName !== specificRoom) continue;

        const owner = await redisClient.get(lockKey);
        if (owner === socketId) {
          await redisClient.del(lockKey);
          await redisClient.sRem(userLocksKey, lockKey);
          io.to(roomName).emit('seatDeselected', { seatId, by: socketId });
          console.log(`Seat ${seatId} auto-deselected in room ${roomName} due to disconnect/leave by ${socketId}`);
        }
      }
    } catch (err) {
      console.error('Error clearing user seats:', err);
    }
  };

  socket.on('disconnect', async () => {
    console.log(`Client disconnected: ${socket.id}`);
    await clearUserSeats(socket.id);
  });
});

const PORT = process.env.PORT || 8005;

server.listen(PORT, () => {
  console.log(`WebSocket Service is listening on http://localhost:${PORT}`);
});
