const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 3000 });
const rooms = {};

wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(message) {
    const data = JSON.parse(message);
    const { type, room, payload } = data;
    ws.room = room;
    switch(type) {
      case 'join':
        if (!rooms[room]) rooms[room] = [];
        rooms[room].push(ws);
        break;
      case 'signal':
        rooms[room].forEach(client => {
          if (client !== ws) {
            client.send(JSON.stringify({ type: 'signal', payload }));
          }
        });
        break;
    }
  });

  ws.on('close', function() {
    if (ws.room && rooms[ws.room]) {
      rooms[ws.room] = rooms[ws.room].filter(client => client !== ws);
      if (rooms[ws.room].length === 0) delete rooms[ws.room];
    }
  });
});

console.log('Signaling server running on ws://localhost:3000');
