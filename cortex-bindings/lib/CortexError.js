class CortexError extends Error {
  constructor(message, code, data) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
    this.code = code.toString();
    this.data = data;
  }
}

module.exports = CortexError;
