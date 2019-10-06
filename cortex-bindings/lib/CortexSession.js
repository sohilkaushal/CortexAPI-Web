const { Transform } = require('stream');
const CortexError = require('./CortexError');
const SessionStatus = require('./SessionStatus');

// This attempts to handle cases when we know the Session has been modified from Emotiv's side.
// In theory this can allow us to be aware of shutdowns,
// without performing RPC, but the stability is questionable.
// <warningCode, function> pairs are stored.
const warningHandlers = {
  0(session, warning) {
    if (warning.message === `All subscriptions of session ${session.id} was stopped by Cortex`) {
      session.clearSchemas();
    }
  },
  1(session, warning) {
    if (warning.message === `Session ${session.id} was closed by Cortex`) {
      session.destroy();
    }
  },
};

/**
 * Takes key-value pairs from two arrays and generates an object.
 * If the key is an array then it is flattaned into the result.
 * @param {[string|Array]} keys The keys to use when converting.
 * @param {[object]} values An array of columns to use as values.
 * @returns The zipped, flattened object.
 */
function zipToFlatObject(keys, values) {
  const result = {};

  for (let i = 0; i < keys.length; i += 1) {
    const keyIdentifier = keys[i];

    if (Array.isArray(keyIdentifier)) {
      Object.assign(
        result,
        zipToFlatObject(keyIdentifier, values[i]),
      );
    } else {
      result[keyIdentifier] = values[i];
    }
  }
  return result;
}

class CortexSession extends Transform {
  constructor(
    id,
    rpc,
    authToken,
    socketStream,
    options,
    state = SessionStatus.OPEN,
  ) {
    super({
      ...options,
      readableObjectMode: true,
    });
    this.id = id;
    this.rpc = rpc;
    this.authToken = authToken;
    this.socketStream = socketStream;
    this.state = state;
    this.schemas = {};
    this.socketStream.pipe(this);
    rpc.on('warning', this.processWarning);
  }

  processWarning = (warning) => {
    warningHandlers[warning.code](this, warning);
  }

  // eslint-disable-next-line no-underscore-dangle
  _transform(data, encoding, callback) {
    try {
      const response = JSON.parse(data);

      // Ignore unknown IDs.
      if (response.sid !== this.id) {
        callback();
        return;
      }
      Object.entries(this.schemas).forEach(([name, schema]) => {
        const incomingData = response[name];

        if (incomingData) {
          // Note we only flatten because the 'dev' data stream is missing zip keys.
          this.push({
            data: zipToFlatObject(schema, incomingData),
            streamName: name,
            time: response.time,
          });
        }
      });
    } catch (e) {
      // Unsupported messages are not errors. Ignore them.
    }
    callback();
  }

  /**
   * Subscribes to data streams.
   * @param  {...string} streams The stream names as enumerated within <code>DataStream</code>.
   */
  async subscribe(...streams) {
    if (this.status === SessionStatus.CLOSED) {
      throw new CortexError('Session must be active or open to call subscribe.');
    }
    const subscribeResult = await this.rpc.callMethod('subscribe', {
      cortexToken: this.authToken,
      session: this.id,
      streams,
    });

    subscribeResult.success.forEach((stream) => {
      this.schemas[stream.streamName] = stream.cols;
    });
    return subscribeResult;
  }

  /**
   * Unsubscribes from data streams.
   * @param  {...string} streams The stream names as enumerated within <code>DataStream</code>.
   */
  async unsubscribe(...streams) {
    if (this.status === SessionStatus.CLOSED) {
      throw new CortexError('Session must be active or open to call unsubscribe.');
    }
    const unsubscribeResult = await this.rpc.callMethod('unsubscribe', {
      cortexToken: this.authToken,
      session: this.id,
      streams,
    });

    unsubscribeResult.success.forEach((stream) => {
      delete this.schemas[stream.streamname];
    });
    return unsubscribeResult;
  }

  /**
   * Updates the current session's status to active or closed.
   * @param {SessionStatus} status The status to change the sesion to.
   */
  updateSession = async (status) => {
    const newSession = await this.rpc.callMethod('updateSession', {
      cortexToken: this.cortexToken,
      session: this.id,
      status,
    });

    this.status = newSession.status;
    if (this.status === SessionStatus.CLOSED) {
      this.destroy();
    }
  }

  /**
   * Equivalent to calling <code>updateSession(SessionStatus.CLOSED)</code>
   */
  close = async () => {
    this.updateSession(SessionStatus.CLOSED);
  }

  /**
   * Clears the currently stored schemas.
   * This should be called rather than manipulating the schemas directly.
   * @memberof CortexSession
   */
  clearSchemas = () => {
    this.schemas.length = 0;
  }

  /**
   * Stops all components of the current session. Useful in errors.
   */
  _destroy = (err, callback) => {
    this.state = SessionStatus.CLOSED;
    this.rpc.removeListener('warning', this.processWarning);
    this.push(null);
    this.clearSchemas();
    // Unpipe pauses the stream so we have to resume.
    this.socketStream.unpipe(this);
    // FIXME: Introduces a rare risk of potential data loss due to backpressure.
    this.socketStream.resume();
    callback(err);
  }
}

module.exports = CortexSession;
