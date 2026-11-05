const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

const players = {};
const SPEED = 6;
const LIMIT = 48;

io.on('connection', (socket) => {
  players[socket.id] = {
    x: Math.random() * 10 - 5,
    z: Math.random() * 10 - 5,
    color: Math.floor(Math.random() * 0xffffff),
    input: { x: 0, z: 0 },
  };

  socket.on('input', (input) => {
    const p = players[socket.id];
    if (!p) return;
    p.input.x = Math.sign(Number(input.x)) || 0;
    p.input.z = Math.sign(Number(input.z)) || 0;
  });

  socket.on('disconnect', () => {
    delete players[socket.id];
  });
});

setInterval(() => {
  const dt = 0.05;
  for (const id in players) {
    const p = players[id];
    let dx = p.input.x;
    let dz = p.input.z;
    const len = Math.hypot(dx, dz);
    if (len > 0) {
      p.x += (dx / len) * SPEED * dt;
      p.z += (dz / len) * SPEED * dt;
    }
    p.x = Math.max(-LIMIT, Math.min(LIMIT, p.x));
    p.z = Math.max(-LIMIT, Math.min(LIMIT, p.z));
  }
  io.emit('state', players);
}, 50);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log('Sunucu çalışıyor: http://localhost:' + PORT);
});