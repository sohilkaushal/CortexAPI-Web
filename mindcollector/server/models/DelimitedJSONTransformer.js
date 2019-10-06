const { Transformer } = require('stream');

class DelimitedJSONTransformer extends Transformer {
  constructor(options) {
    super({
      readableObjectMode: true,
      ...options,
    });
  }

  _transform(chunk, encoding, callback) {
    callback(
      null,
      JSON.stringify(chunk.toString())
        .replace(/\u2028/g, '\\u2028')
        .replace(/\u2029/g, '\\u2029') + '\n'
    );
  }
}

module.exports = DelimitedJSONTransformer;
