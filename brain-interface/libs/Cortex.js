const WebSocket = require('ws');
const CortexError = require('./CortexError.js');
const CortexSession = require('./CortexSession.js');
const JsonRpc = require('./JsonRpc.js');

const DEFAULT_SOCKET_URL = 'wss://localhost:6868';

class Cortex {
  constructor(user) {
    this.user = user;
    this.currentId = 0;
  }

  connect(socketURL = DEFAULT_SOCKET_URL) {
    this.socket = new WebSocket(socketURL, {
      rejectUnauthorized: false,
    });
    return new Promise((resolve, reject) => {
      this.socket.on('open', () => {
        this.jsonRpc = new JsonRpc(this.socket);
        resolve();
      });
      this.socket.on('error', (err) => {
        reject(err);
      });
    });
  }

  close() {
    this.socket.close();
    return new Promise((resolve, reject) => {
      this.socket.on('close', () => {
        this.jsonRpc = new JsonRpc(this.socket);
        resolve();
      });
      this.socket.on('error', (err) => {
        reject(err);
      });
    });
  }

  // TODO: Add timeout parameter.
  queryHeadsets(id) {
    return this.jsonRpc.callMethod('queryHeadsets', {
      id,
    });
  }

  requestAccess() {
    const { user } = this;

    return new Promise((resolve, reject) => {
      this.jsonRpc.callMethod('requestAccess', user)
        .then((result) => {
          if (result.accessGranted === true) {
            resolve(result);
          } else {
            reject(new CortexError(result.message, 'ERR_USER_ACCESS_DENIED'));
          }
        }).catch((error) => {
          reject(error);
        });
    });
  }

  async authorise() {
    this.cortexToken = (await this.jsonRpc.callMethod('authorize', this.user)).cortexToken;
  }

  createSession(headsetId) {
    const methodParams = {
      cortexToken: this.cortexToken,
      headset: headsetId,
      status: 'open',
    };

    return new Promise((resolve, reject) => {
      this.jsonRpc.callMethod('createSession', methodParams)
        .then((result) => {
          resolve(new CortexSession(result.id, this.jsonRpc, this.cortexToken, this.socket));
        }).catch((error) => {
          reject(error);
        });
    });
  }

  async querySessionInfo() {
    this.headsets = await this.queryHeadsets();
    this.cortexToken = await this.authorise();
    this.session = await this.createSession(this.cortexToken, this.headset.id);

    console.log('Headsets ------------------------\n');
    for (let i = 0; i < this.headsets.length; i += 1) {
      console.log(`\t${i + 1}\t${this.headsets[i].id}`);
    }
    console.log('\n');
    console.log('Auth Token ------------------------\n');
    console.log(this.cortexToken);
    console.log('\n');
    console.log('Session ID ------------------------\n');
    console.log(this.session);
    console.log('\n');
  }

  async checkAndQuery() {
    let accessResponse;
    try {
      accessResponse = await this.requestAccess();
    } catch (e) {
      console.error('Login on Emotiv App before you request for permission and rerun the script');
      throw new Error('Login Error: Login inside the EMOTIV APP');
    }

    console.log(`Access granted by user ${accessResponse}`);
    try {
      await this.querySessionInfo();
    } catch (e) {
      console.log('You must accept access request inside the Emotiv App');
      throw new Error('Permission Error: You must accept access request inside the Emotiv App');
    }
  }

  subscribeStreams(subscriptions) {
    this.socket.on('open', async () => {
      try {
        await this.checkAndQuery();
      } catch (e) {
        return;
      }
      this.session.on('subscribeSuccess', (stream) => {
        if (stream.streamName !== 'pow') {
          return;
        }
        this.session.on('data', (data) => console.log(data));
      });
      this.session.subscribe(...subscriptions);
    });
  }
}

// cortexUser.subscribeStreams(streams);

module.exports = Cortex;
