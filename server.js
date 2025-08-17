const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static(__dirname));

io.on('connection', (socket) => {
  const { name, room } = socket.handshake.query;
  socket.join(room);
  socket.to(room).emit('message', name + ' se unió a la sala');

  socket.on('chatMessage', (msg) => {
    io.to(room).emit('message', name + ': ' + msg);
  });

  socket.on('disconnect', () => {
    io.to(room).emit('message', name + ' salió de la sala');
  });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => console.log('Servidor corriendo en puerto ' + PORT));
