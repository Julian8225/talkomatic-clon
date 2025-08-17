const path = require('path');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
  const { room = 'lobby', name = 'Anónimo' } = socket.handshake.query;
  socket.join(room);
  socket.data.name = name;

  io.to(room).emit('system', `${socket.data.name} se conectó`);

  socket.on('chat', (msg) => {
    const trimmed = String(msg || '').slice(0, 500);
    io.to(room).emit('chat', { name: socket.data.name, msg: trimmed, ts: Date.now(), id: socket.id });
  });

  socket.on('typing', (isTyping) => {
    socket.to(room).emit('typing', { name: socket.data.name, isTyping: !!isTyping });
  });

  socket.on('disconnect', () => {
    io.to(room).emit('system', `${socket.data.name} salió`);
  });
});

server.listen(PORT, () => {
  console.log(`✅ Servidor listo en http://localhost:${PORT}`);
});
