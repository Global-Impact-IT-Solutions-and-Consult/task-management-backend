// server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

const sequelize = require('./config/db');
const { deleteSeenOlderThanOneHour } = require('./services/notificationService');
const User = require('./models/User');
const Role = require('./models/Role');

sequelize.sync({ force: false }).then(() => {
  console.log('Database synced');
});

const app = express();
app.use(cors({ origin: process.env.CLIENT_ORIGIN || '*', credentials: true }));
app.use(express.json());

app.get('/', (req, res) => { res.send('Task Manager API running...'); });

// ==== Socket.IO bootstrap ====
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.CLIENT_ORIGIN || '*', credentials: true }
});

// Socket auth + room joins
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token
      || (socket.handshake.headers?.authorization || '').split(' ')[1];

    if (!token) return next(new Error('No token on socket handshake'));

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id, { include: { model: Role, as: 'role' } });
    if (!user) return next(new Error('User not found'));

    socket.user = { id: user.id, role: user.role?.name };
    // join personal + role room(s)
    socket.join(`user:${user.id}`);
    if (user.role?.name) socket.join(`role:${user.role.name}`);

    return next();
  } catch (e) {
    return next(new Error('Socket auth failed'));
  }
});

io.on('connection', (socket) => {
  // Optional: log or handle pings
  socket.on('disconnect', () => {});
});

// Make io available to routes/controllers via req.app.get('io')
app.set('io', io);

// ==== ROUTES ====
app.get('/', (req, res) => { res.send('API is running...'); });
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/tasks", require("./routes/taskRoutes"));
app.use("/api/roles", require("./routes/roleRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));

// ==== Cleanup timer: delete notifications seen > 1hr ago ====
setInterval(async () => {
  try { await deleteSeenOlderThanOneHour(); }
  catch (e) { console.error('Notification cleanup failed:', e.message); }
}, 5 * 60 * 1000); // every 5 minutes

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
