const axios = require('axios');
const config = require('../config.json');

class RemoteCaptureStorage {
  constructor(endpoint, timeout = 30000) {
    this.endpoint = endpoint;
    this.apiWrapper = axios.create({
      timeout,
      baseURL: endpoint,
    });
  }

  writeCapture = async (capture, captureName) => {
    if (!captureName) {
      throw new Error('Must specify a name for the uploaded capture.');
    }
    const parameters = {
      method: 'post',
      url: `capture/${captureName}`,
      data: capture,
    };

    await this.apiWrapper.request(parameters);
  }
}

const captureStorage = new RemoteCaptureStorage(config.mindCloudUrl);
module.exports = captureStorage;
