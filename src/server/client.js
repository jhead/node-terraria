import Message from '../message';
import Protocol from '../protocol';

class Client {

  constructor(server, socket, { handlers } = { }) {
    if (!socket) throw new Error('Socket cannot be null');

    this.server = server;

    this.socket = socket;
    this.socket.on('data', ::this.handleIncomingData);

    this.handlers = handlers || { };
    if (!handlers) this.bindDefaultHandlers();
  }

  get id() {
    return this.server.getPlayerId(this);
  }

  handleIncomingData(data) {
    if (!data) return;

    let message = Message.decode(data);

    this.handleMessage(message);
  }

  handleMessage(message) {
    if (!message) return;

    let handlers = this.getMessageHandlers(message.protocol);

    handlers.forEach((func) => func(this, message));
  }

  addMessageHandler(proto, func) {
    if (typeof func !== 'function')
      throw new Error('Handler must be a function');

    this.getMessageHandlers(proto).push(func);
  }

  getMessageHandlers(proto) {
    if (!proto || typeof proto.id === 'undefined') return [ ];

    return (this.handlers[proto.id] = this.handlers[proto.id] || [ ]);
  }

  bindDefaultHandlers() {
    let { server } = this;

    this.addMessageHandler(Protocol.ConnectionRequest, (client, message) => {
      let response = new Message(Protocol.ContinueConnecting, {
        playerid: server.getPlayerId(client)
      });

      client.send(response);
    });
  }

  send(message) {
    let { socket } = this;
    let messageBuffer = message.encode();

    socket.write(messageBuffer);
  }

}

 export default Client;
