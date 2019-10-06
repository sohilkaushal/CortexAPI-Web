const fs = require('fs')
const https = require('https')
const WebSocket = require('ws')

const ws = new WebSocket('wss://localhost:6868/', { rejectUnauthorized: false });
ws.on('open', () => console.log('open'));
ws.on('close', () => console.log('close'));
ws.on('error', () => console.log('error'));

// Cert taken directly from the ws module's tests.
// (It offers no security anyway.)
const server = https.createServer({
  cert: fs.readFileSync('certificate.pem'),
  key: fs.readFileSync('key.pem')
})
const wsServer = new WebSocket.Server({ server })

function fmtDir(src, dest, objMsg) {
    console.log(`[${src}->${dest}]\n      ${JSON.stringify(JSON.parse(objMsg), null, 2).replace(/\n/g, '\n      ')}`);
}

wsServer.on('connection', (wsClient, req) => {
  console.log('client opened');
  ws.on('message', (value) => {
    fmtDir('s', 'c', value);
    wsClient.send(value)
  })
  wsClient.on('close', () => console.log('client closed'));
  wsClient.on('message', (value) => {
    fmtDir('c', 's', value);
    ws.send(value)
  })
});

server.listen(6869)

