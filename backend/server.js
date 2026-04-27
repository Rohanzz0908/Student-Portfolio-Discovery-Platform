const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Adjust this to your frontend URL in production
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// Make io accessible to our routes
app.set('io', io);

// Socket.io connection logic
io.on('connection', (socket) => {
  console.log('⚡ A user connected:', socket.id);

  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`👤 User ${userId} joined their room`);
  });

  socket.on('disconnect', () => {
    console.log('🔥 A user disconnected');
  });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/profiles', require('./routes/profiles'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/certifications', require('./routes/certifications'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/jobs', require('./routes/jobs'));

// Health check
app.get('/', (req, res) => {
  res.json({ message: '🚀 Student Portfolio API is running...' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

