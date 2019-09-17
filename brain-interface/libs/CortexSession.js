const EventEmitter = require('events');

function zipToObject(keys, values, keyOverrides) {
  const result = {};

  for (let i = 0; i < keys.length; i += 1) {
    const keyIdentifier = keys[i];

    if (Arrays.isArray(keyIdentifier)) {
      if (keyOverrides && keyOverrides[i]) {
        const keyOverride = keyOverrides[i];

        result[keyOverride] = zipToObject(
          keyIdentifier,
          values[i],
          Array.isArray(keyOverride) ? keyOverride[i] : undefined);
      } else {
        Object.assign(result, zipToObject(keyIdentifier, values[i]));
      }
    } else {
      result[keyIdentifier] = values[i];
    }
  }
  return result;
}

class CortexSession extends EventEmitter {
  constructor(id, rpc, authToken, webSocket) {
    super();
    this.id = id;
    this.rpc = rpc;
    this.webSocket = webSocket;
    this.authToken = authToken;
    this.schemas = {};
  }

  dataCallback = (message) => {
    try {
      const response = JSON.parse(message);

      if (response.sid !== this.id) {
        return;
      }
      Object.entries(this.schemas).forEach(([name, schema]) => {
        const incomingData = response[name];

        if (incomingData) {
          this.emit('data', {
            data: zipToObject(schema, incomingData),
            streamName: name,
            time: response.time,
          });
        }
      });
    } catch (e) {
      // Unsupported messages are not errors. Ignore them.
    }
  }

  subscribe(...streams) {
    this.rpc.callMethod('subscribe', {
      cortexToken: this.authToken,
      session: this.id,
      streams,
    }).then((result) => {
      result.success.forEach((stream) => {
        this.schemas[stream.streamName] = stream.cols;
        this.emit('subscribeSuccess', stream);
      });
      result.failure.forEach((stream) => {
        this.emit('subscribeFailure', stream);
      });
      if (Object.entries(this.schemas).length > 0) {
        this.webSocket.on('message', this.dataCallback);
      }
    }).catch((error) => {
      throw error;
    });
  }

  unsubscribe(...streams) {
    this.rpc.callMethod('unsubscribe', {
      cortexToken: this.authToken,
      session: this.id,
      streams,
    }).then((result) => {
      result.success.forEach((stream) => {
        delete this.schemas[stream.streamName];
        this.emit('unsubscribeSuccess', stream);
      });
      result.failure.forEach((stream) => {
        this.emit('unsubscribeFailure', stream);
      });
      if (Object.entries(this.schemas).length > 0) {
        this.webSocket.removeListener('message', this.dataCallback);
      }
    }).catch((error) => {
      throw error;
    });
  }
}

module.exports = CortexSession;
