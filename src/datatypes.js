const DatatypeLengths = {
  byte: 1,
  int16: 2,
  int32: 4,
  single: 4,
  color: 3
};

const Datatypes = {

  byte: 'UInt8',
  int16: 'Int16LE',
  int32: 'Int32LE',
  single: 'FloatLE',
  color: {
    decode: (buffer, offset) => {
      let color = { };

      color.r = buffer.readUInt8(offset);
      color.g = buffer.readUInt8(offset + 1);
      color.b = buffer.readUInt8(offset + 2);

      return color;
    },
    encode: (color) => {
      let buffer = newEmptyBuffer(DatatypeLengths.color);

      buffer.writeUInt8(color.r);
      buffer.writeUInt8(color.g, 1);
      buffer.writeUInt8(color.b, 2);

      return buffer;
    }
  },
  string: {
    decode: (buffer, offset) => {
      let length = buffer[offset];
      offset += 1;

      return buffer.toString('utf8', offset, offset + length);
    },
    encode: (string) => new Buffer(string, 'ascii')
  }

};

for (let type in Datatypes) {
  let def = Datatypes[type];

  if (typeof def === 'string') {
    Datatypes[type] = {
      decode: (buffer, offset) => buffer[`read${def}`](offset),
      encode: (value) => {
        let buffer = newEmptyBuffer(DatatypeLengths[type]);

        buffer[`write${def}`](value, 0);

        return buffer;
      },
      length: DatatypeLengths[type]
    };
  }
}

function newEmptyBuffer(length = 0) {
  let buffer = new Buffer(length);

  buffer.fill(0);

  return buffer;
}

export default Datatypes;
