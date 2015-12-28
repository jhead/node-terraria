import net from 'net';
import { EventEmitter } from 'events';
import debug from 'debug';
import Client from './client';

const log = debug('terraria:server');

class Server extends EventEmitter {

  constructor({ port = 7777 } = { }) {
    super();

    this.port = port;
    this.clients = { };
    this.clientAddresses = [ ];

    this.init();
  }

  init() {
    let { port } = this;

    this.server = net.createServer();

    this.server.on('connection', ::this.handleConnection);

    this.server.listen(port, () => {
      let addr = this.server.address();
      log('Listening on %s:%s', addr.address, addr.port);
    });
  }

  handleConnection(socket) {
    let { remoteAddress } = socket;
    let client = new Client(this, socket);

    log('Connected: %s', remoteAddress);

    this.clients[remoteAddress] = client;
    this.clientAddresses.push(remoteAddress);

    socket.on('close', () => {
      this.handleDisconnection(socket);
    });

    this.emit('client', client);
  }

  handleDisconnection(socket) {
    let { remoteAddress } = socket;
    log('Disconnected: %s', remoteAddress);

    delete this.clients[remoteAddress];

    let playerId = this.getPlayerId(remoteAddress);
    delete this.clientAddresses[playerId];
  }

  getPlayerId(client) {
    let remoteAddress;

    if (client instanceof Client) remoteAddress = client.socket.remoteAddress;
    if (client instanceof net.Socket) remoteAddress = client.remoteAddress;
    if (typeof client === 'string') remoteAddress = client;

    let id = this.clientAddresses.indexOf(remoteAddress);

    if (id >= 0) return id;

    console.log(client, remoteAddress, this.clients, this.clientAddresses);
    throw new Error('Untracked client provided');
  }

}

export default Server;
