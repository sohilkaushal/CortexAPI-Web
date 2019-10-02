const { URL } = require('url');
const WebSocket = require('ws');
const CortexSession = require('./CortexSession');
const SessionStatus = require('./SessionStatus');
const JsonRpc = require('./JsonRpc');

const DEFAULT_HOST = 'localhost';
const DEFAULT_PORT = 6868;

class Cortex {
  constructor(options) {
    if (!(options.clientId
      && options.clientSecret)) {
      throw new Error('Options needs clientId and clientSecret');
    }

    this.options = {
      host: options.host || DEFAULT_HOST,
      port: options.port || DEFAULT_PORT,
      clientId: options.clientId,
      clientSecret: options.clientSecret,
      license: options.license,
      debt: options.debt,
    };
  }

  /**
   * Connects to the Cortex API.
   */
  connect = () => {
    const socketUrl = new URL(`wss://${this.options.host}:${this.options.port}/`);

    return new Promise((resolve, reject) => {
      this.socket = new WebSocket(socketUrl, {
        rejectUnauthorized: false,
        encoding: 'utf8'
      });
      this.socket.on('open', () => {
        this.socketStream = WebSocket.createWebSocketStream(this.socket, {
          encoding: 'utf8',
          decodeStrings: false,
        });
        this.jsonRpc = new JsonRpc(this.socketStream);
        resolve();
      });
      this.socket.on('error', (err) => {
        reject(err);
      });
    });
  }

  close = async () => {
    await this.jsonRpc.close();
    await this.socketStream.end();
  }

  // TODO: Add timeout parameter.
  queryHeadsets = async (id) => {
    const result = await this.jsonRpc.callMethod('queryHeadsets', {
      id,
    });
    return result;
  }

  requestAccess = async () => {
    const result = await this.jsonRpc.callMethod('requestAccess', {
      clientId: this.options.clientId,
      clientSecret: this.options.clientSecret,
    });
    return result;
  }

  authorize = async () => {
    this.cortexToken = (await this.jsonRpc.callMethod('authorize', {
      clientId: this.options.clientId,
      clientSecret: this.options.clientSecret,
    })).cortexToken;
  }

  createSession = (headsetId, status = SessionStatus.OPEN) => {
    const methodParams = {
      cortexToken: this.cortexToken,
      headset: headsetId,
      status,
    };

    return new Promise((resolve, reject) => {
      this.jsonRpc.callMethod('createSession', methodParams)
        .then((result) => {
          resolve(new CortexSession(
            result.id,
            this.jsonRpc,
            this.cortexToken,
            this.socketStream,
          ));
        }).catch((error) => {
          reject(error);
        });
    });
  }
}

// cortexUser.subscribeStreams(streams);

module.exports = Cortex;
module.exports.DEFAULT_HOST = DEFAULT_HOST;
module.exports.DEFAULT_PORT = DEFAULT_PORT;
