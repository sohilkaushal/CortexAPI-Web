class RemoteRpcError extends Error {
  constructor(message, code, data) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
    this.code = code.toString();
    this.errno = code;
    this.data = data;
  }
}

module.exports = RemoteRpcError;
