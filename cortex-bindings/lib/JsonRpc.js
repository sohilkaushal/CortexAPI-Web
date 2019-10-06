const EventEmitter = require('events');
const RemoteRpcError = require('./ServerRpcError.js');

class JsonRpc extends EventEmitter {
  constructor(stream) {
    super();
    this.stream = stream;
    this.stream.on('data', this.warningHandler);
    this.currentId = 0;
  }

  warningHandler(message) {
    try {
      const incomingObject = JSON.parse(message);
      if (incomingObject.jsonrpc && incomingObject.warning) {
        this.emit('warning', incomingObject.warning);
      }
    } catch {
      // Unknown messages are not errors.
    }
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

    this.stream.write(JSON.stringify(request));
  }

  invokeMethod(methodName, methodParams) {
    this.invokeMethodWithId(methodName, methodParams, this.nextId());
  }

  callMethod(methodName, methodParams, timeoutMs) {
    const currentId = this.nextId();
    const resultPromise = new Promise((resolve, reject) => {
      const callback = (message) => {
        try {
          const response = JSON.parse(message);

          if (!response.jsonrpc || response.id !== currentId) {
            return;
          }
          this.stream.removeListener('data', callback);
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
      if (timeoutMs !== undefined) {
        setTimeout(async () => {
          const timeoutError = new Error(`Timeout threshold of ${timeoutMs} ms exceeded when calling ${methodName}`);

          timeoutError.code = 'ERR_RPC_RESPONSE_TIMEOUT';
          this.stream.removeListener('data', callback);
          reject(timeoutError);
        }, timeoutMs);
      }
      this.stream.on('data', callback);
      this.invokeMethodWithId(methodName, methodParams, currentId);
    });

    return resultPromise;
  }

  async close() {
    this.stream.removeListener('data', this.warningHandler);
  }
}

module.exports = JsonRpc;
