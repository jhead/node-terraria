import Datatypes from './datatypes';

let Protocol = { };

/// Message definitions

defineMessage(0x01, 'ConnectionRequest', {
  version: Datatypes.string
});

defineMessage(0x02, 'FatalError', {
  error: Datatypes.string
});

defineMessage(0x03, 'ContinueConnecting', {
  playerid: Datatypes.byte
});

///

function defineMessage(id, name, fields) {
  Protocol[name] = {
    id,
    name,
    fields,
    parse: (buffer) => {
      let offset = 0;
      let values = { };

      for (let field in fields) {
        let type = fields[field];
        let value = type.decode(buffer, offset);

        values[field] = value;

        if (typeof value === 'string') {
          offset += (value || '').length;
        } else {
          offset += type.length;
        }
      }

      return values;
    },
    create: (values) => {
      let buffer = new Buffer(0);

      for (let field in fields) {
        let type = fields[field];
        let value = values[field];

        if (value === null || value === undefined) continue;

        buffer = Buffer.concat([ buffer, type.encode(value) ]);
      }

      return buffer;
    },
    is: (obj) => {
      if (typeof obj === 'string') obj = Protocol[obj];

      if (!obj) return false;

      return id === obj.id;
    }
  };

  Protocol[id] = Protocol[name];
}

export default Protocol;
