const app = require('express')();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const port = process.env.PORT || 3000;
const { BUILD_MESSAGE } = require('./utils/constants');

app.get('/', (req, res) => {
  res.send('<h1>Hello world</h1>');
});

const CLIENT = {};
let matchGroupWin;
let matchGroupMac;

io.on('connection', (socket) => {
  const {
    id,
    handshake: {
      query: { source },
    },
  } = socket;
  console.log(id, source);
  switch (source) {
    case 'win':
      CLIENT['win'] = socket.id;
      break;
    case 'mac':
      CLIENT['mac'] = socket.id;
      break;
    case 'bot-win':
      CLIENT['bot-win'] = socket.id;
      break;
    case 'bot-mac':
      CLIENT['bot-mac'] = socket.id;
      break;
    default:
      break;
  }

  socket.on('BUILD', (msg) => {
    const isWin = CLIENT.hasOwnProperty('win');
    const isMac = CLIENT.hasOwnProperty('mac');
    const isBotWin = CLIENT['bot-win'] === socket.id;
    const isBotMac = CLIENT['bot-mac'] === socket.id;

    // save match group
    if (msg.action === 'STATE' && isBotWin) {
      matchGroupWin = msg.matchGroup;
    }
    if (msg.action === 'STATE' && isBotMac) {
      matchGroupMac = msg.matchGroup;
    }
    // main handler
    if (isBotWin && isWin) {
      console.log(`request win builder: ${msg.action}`);
      io.to(CLIENT['win']).emit('REQUEST BUILDER', msg);
    } else if (isBotMac && isMac) {
      console.log(`request mac builder: ${msg.action}`);
      io.to(CLIENT['mac']).emit('REQUEST BUILDER', msg);
    } else if (isBotWin && !isWin) {
      const msg = {
        action: 'ERROR',
        buildPlatform: 'win',
        code: 'ERROR_WIN_NOT_READY',
        message: BUILD_MESSAGE['ERROR_WIN_NOT_READY'],
      };
      io.to(CLIENT['bot-win']).emit('OUTPUT BUILD', msg);
    } else if (isBotMac && !isMac) {
      const msg = {
        action: 'ERROR',
        buildPlatform: 'mac',
        code: 'ERROR_MAC_NOT_READY',
        message: BUILD_MESSAGE['ERROR_MAC_NOT_READY'],
      };
      io.to(CLIENT['bot-mac']).emit('OUTPUT BUILD', msg);
    } else {
      const msg = {
        action: 'ERROR',
        buildPlatform: (isWin && 'win') || (isMac && 'mac'),
        code: 'ERROR_UNKNOW',
        message: BUILD_MESSAGE['ERROR_UNKNOW'],
      };
      io.to(CLIENT[socket.id]).emit('OUTPUT BUILD', msg);
    }
  });

  socket.on('OUTPUT BUILD', (output) => {
    console.log(
      '--------Output from builder----------',
      output.buildPlatform,
      output.code
    );

    switch (output.buildPlatform) {
      case 'win':
        io.to(CLIENT['bot-win']).emit('OUTPUT BUILD', {
          ...output,
          matchGroupWin, // return match group
        });
        break;
      case 'mac':
        io.to(CLIENT['bot-mac']).emit('OUTPUT BUILD', {
          ...output,
          matchGroupMac, // return match group
        });
        break;
      default:
        return;
    }
  });
  socket.on('disconnect', () => {
    console.log('--------Remove socket client----------');
    console.log('disconnect', socket.id);
    console.log('CLIENT', CLIENT);
    for (const prop in CLIENT) {
      if (CLIENT[prop] === socket.id) {
        delete CLIENT[prop];
      }
    }
    console.log('CLIENT', CLIENT);
  });
});
server.listen(port, () => {
  console.log(`listening on *:${port}`);
});
// heroku restart -a socket-build

// heroku logs --tail --app socket-build

//547542490 / pass bananhhuynh!
