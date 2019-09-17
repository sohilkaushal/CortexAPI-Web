const EventEmitter = require('events');
const RemoteRpcError = require('./RemoteRpcError.js');

class JsonRpc extends EventEmitter {
  constructor(socket) {
    super();
    this.socket = socket;
    this.currentId = 0;
  }

  nextId() {
    const result = this.currentId;
    this.currentId += 1;
    return result;
  }

  invokeMethodWithId(methodName, methodParams, id) {
    const request = {
      jsonrpc: '2.0',
      method: methodName,
      params: methodParams,
      id,
    };

    this.socket.send(JSON.stringify(request));
  }

  invokeMethod(methodName, methodParams) {
    this.invokeMethodWithId(methodName, methodParams, this.nextId());
  }

  callMethod(methodName, methodParams, timeoutMs = null) {
    const currentId = this.nextId();
    const resultPromise = new Promise((resolve, reject) => {
      const callback = (message) => {
        try {
          const response = JSON.parse(message);

          if (response.id !== currentId) {
            return;
          }
          this.socket.removeListener('message', callback);
          if (response.result !== undefined) {
            resolve(response.result);
          } else if (response.error !== undefined) {
            reject(new RemoteRpcError(
              response.error.message,
              response.error.code,
              response.error.data,
            ));
          }
        } catch {
          // Unsupported messages are not errors. Ignore them.
        }
      };

      if (timeoutMs !== null) {
        setTimeout(async () => {
          const timeoutError = new Error(`Timeout threshold of ${timeoutMs} ms exceeded when calling ${methodName}`);
          timeoutError.code = 'ERR_RPC_RESPONSE_TIMEOUT';
          this.socket.removeListener('message', callback);
          reject(timeoutError);
        }, timeoutMs);
      }
      this.socket.on('message', callback);
      this.invokeMethodWithId(methodName, methodParams, currentId);
    });


    return resultPromise;
  }
}

module.exports = JsonRpc;
