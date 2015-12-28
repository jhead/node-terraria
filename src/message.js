import Datatypes from './datatypes';
import Protocol from './protocol';

class Message {

  constructor(id, { length = -1, values = { }, data } = { }) {
    if (typeof id === 'object') {
      this.protocol = id;
      this.id = this.protocol.id;
    } else {
      this.id = id;
      this.protocol = Protocol[id];
    }

    if (length >= 0)
      this.length = length;

    this.values = values;

    if (data) {
      this.data = data.slice(3);
      this.rawData = data;
      this.header = data.slice(0, 3);
    }
  }

  encode() {
    let { protocol, values } = this;

    let dataBuffer = protocol.create(values);
    let dataLength = dataBuffer.length;

    let messageBuffer = new Buffer(0);

    messageBuffer = Buffer.concat([
      messageBuffer, Datatypes.int16.encode(dataLength)
    ]);

    messageBuffer = Buffer.concat([
      messageBuffer, Datatypes.byte.encode(protocol.id)
    ]);

    messageBuffer = Buffer.concat([
      messageBuffer, dataBuffer
    ]);

    return messageBuffer;
  }

  is(proto) {
    return this.protocol.is(proto);
  }

  static decode(buffer) {
    let length = Datatypes.int16.decode(buffer, 0);
    let id = Datatypes.byte.decode(buffer, 2);

    let proto = Protocol[id];
    let values = { };

    if (proto) {
      values = proto.parse(buffer.slice(3, length));
    }

    return new Message(id, { length, values, data: buffer });
  }

}

export default Message;
