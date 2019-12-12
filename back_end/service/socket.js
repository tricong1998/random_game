const http = require('http');
const io = require('socket.io')(http);
const count = 0;
io.sockets.on('connection', (socket) => {
  socket.on('connect', () => {
    console.log(`there is one connection: ${++count}`);
  });
  socket.on('disconnect', () => {
    console.log(`there is one disconnection: ${--count}`);
  });
})
