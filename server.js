const app = require('express')();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const port = process.env.PORT || 3000;
const {
  BUILD_MESSAGE,
  WIN_NOT_READY,
  MAC_NOT_READY,
} = require('./utils/constants');

app.get('/', (req, res) => {
  res.send('<h1>Hello world</h1>');
});

const CLIENT = {};
let matchGroupWin;
let matchGroupMac;
let lastedActionWin;
let lastedActionMac;

io.on('connection', (socket) => {
  const {
    id,
    handshake: {
      query: { source },
    },
  } = socket;
  console.log('##### New connection init ######', socket.id, source);
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
  console.log('#### CLIENT updated ###### ',CLIENT);

  socket.on('BUILD', (msg) => {
    console.log('###### Receive Request BUILD From Client ######');
    console.log('CLIENT', CLIENT, 'socket.id', socket.id);
    const isWin = CLIENT.hasOwnProperty('win');
    const isMac = CLIENT.hasOwnProperty('mac');
    const isBotWin = CLIENT['bot-win'] === socket.id;
    const isBotMac = CLIENT['bot-mac'] === socket.id;
    //const isBotWin = CLIENT['bot-win']?true:false;
    // const isBotMac = CLIENT['bot-mac']?true:false;

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
      // save lasted action
      lastedActionWin = msg.action;
    } else if (isBotMac && isMac) {
      console.log(`request mac builder: ${msg.action}`);
      io.to(CLIENT['mac']).emit('REQUEST BUILDER', msg);
      // save lasted action
      lastedActionMac = msg.action;
    } else if (isBotWin && !isWin) {
      io.to(CLIENT['bot-win']).emit('OUTPUT BUILD', WIN_NOT_READY);
    } else if (isBotMac && !isMac) {
      io.to(CLIENT['bot-mac']).emit('OUTPUT BUILD', MAC_NOT_READY);
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
      output.code,
      output.message
    );

    switch (output.buildPlatform) {
      case 'win':
        io.to(CLIENT['bot-win']).emit('OUTPUT BUILD', {
          ...output,
          matchGroup: matchGroupWin, // return match group
        });
        console.log(
          '------- Send output from heroku-------to',
          CLIENT['bot-win'],
          '-------client at output-------',
          CLIENT
        );
        break;
      case 'mac':
        io.to(CLIENT['bot-mac']).emit('OUTPUT BUILD', {
          ...output,
          matchGroup: matchGroupMac, // return match group
        });
        console.log(
          '------- Send output from heroku-------to',
          CLIENT['bot-mac'],
          '-------client at output-------',
          CLIENT
        );
        break;
      default:
        return;
    }
  });

  socket.on('disconnect', () => {
    console.log('--------Remove socket client----------');
    console.log('disconnect', socket.id);
    console.log('Before CLIENT', CLIENT);
    for (const prop in CLIENT) {
      if (CLIENT[prop] === socket.id) {
        delete CLIENT[prop];
        // return error to client if builders stop suddenly
        // if (prop === 'win' && lastedActionWin !== 'CANCEL') {
        //   io.to(CLIENT['bot-win']).emit('OUTPUT BUILD', WIN_NOT_READY);
        // }
        // if (prop === 'mac' && lastedActionMac !== 'CANCEL') {
        //   io.to(CLIENT['bot-mac']).emit('OUTPUT BUILD', MAC_NOT_READY);
        // }
      }
    }
    console.log('After CLIENT', CLIENT);
  });
});
server.listen(port, () => {
  console.log(`listening on *:${port}`);
});
