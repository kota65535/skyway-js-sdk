// dummy window object
global.window = {}
require('./xhr2');
require('./wrtc');
const Peer = require('skyway-js');
const commander = require('commander');
const inquirer = require('inquirer');
const waitUntil = require('async-wait-until');

commander.option('-p, --peer-id <id>', 'Remote peer ID to connect');
commander.parse(process.argv);

const main = async () => {
  const peer = await createPeer();
  const remoteId = commander.peerId;
  if (remoteId) {
    connectToRemote(peer, remoteId);
  }
};

const createPeer = async () => {
  const peer = new Peer({
    key: '423ec210-715b-4916-971f-bd800a835414',
    // debug: 3,
  });

  peer.on('open', id => {
    console.log(`Peer opened. Peer ID: ${id}`);
  });
  peer.on('error', err => {
    console.log(err);
  });

  peer.on('connection', dataConnection => {
    addConnectionHandlers(dataConnection);
  });

  // wait until peer is open
  await waitUntil(() => {
    return peer.open;
  })

  return peer;
};

const addConnectionHandlers = dataConnection => {
  dataConnection.once('open', async () => {
    const remoteId = dataConnection.remoteId;
    console.log(`Connection opened. Remote Peer ID: ${remoteId}`);
    console.log('Remote Peer ID', remoteId);
  });

  dataConnection.on('data', data => {
    console.log(`Remote data: ${data}\n`);
  });

  dataConnection.once('close', () => {
    console.log('Connection closed.');
  });

  dataConnection.on('error', err => {
    console.log(err);
  });

  loop(dataConnection);
};

const connectToRemote = (peer, remoteId) => {
  const dataConnection = peer.connect(remoteId);
  addConnectionHandlers(dataConnection);
};

const loop = async dataConnection => {
  while (true) {
    const answer = await inquirer.prompt([
      {
        type: 'input',
        name: 'data',
        message: 'Data to send',
      },
    ]);
    dataConnection.send(answer.data);
  }
};


main()
