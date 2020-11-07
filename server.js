

const app = require('express')();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

app.get('/', (req, res) => {
    res.send('<h1>Hello world</h1>');
});

const CLIENT = {};

io.on('connection', (socket) => {
    const { id, handshake: { query: { source } } } = socket;
    console.log(id, source);
    switch (source) {
        case 'win':
            CLIENT['win'] = socket.id;
            break;
        case 'mac':
            CLIENT['mac'] = socket.id;
            break;
        case 'bot':
            CLIENT['bot'] = socket.id;
            break;
        default:
            break;
    }
    console.log("----------update client------");
    socket.on('BUILD', (msg) => {
        const isWin = CLIENT.hasOwnProperty('win');
        const isMac = CLIENT.hasOwnProperty('mac');
        const { buildPlatform, ...restMsg } = msg;

        if (buildPlatform === 'win' && isWin) {
            console.log("request build win");
            io.to(CLIENT['win']).emit('REQUEST BUILDER', restMsg);
        } else if (buildPlatform === 'mac' && isMac) {
            console.log("request build mac");
            io.to(CLIENT['mac']).emit('REQUEST BUILDER', restMsg);
        }
        else {
            io.to(CLIENT['bot']).emit('ERROR_INIT', 'ERROR_BUILDER_NOT_READY');
        }
    });

    socket.on('OUTPUT BUILD', (output) => {
        io.to(CLIENT['bot']).emit('OUTPUT BUILD', output);
    });
});
server.listen(80, () => {
    console.log('listening on *:80');
});