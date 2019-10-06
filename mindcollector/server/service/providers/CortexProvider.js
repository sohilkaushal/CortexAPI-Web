const { promisify } = require('util');
const { Cortex, SessionStatus, DataStream } = require('cortex-bindings');

const sleepAsync = promisify(setTimeout);

/**
 * Converts a Cortex-format headset to a mindcollector API format.
 * @param {object} cortexHeadset A Cortex-format headset.
 * @returns The mindcollector-format headset.
 */
function toUniversalHeadset(cortexHeadset) {
  return {
    id: cortexHeadset.id,
    alias: cortexHeadset.customName,
    connectionStatus: cortexHeadset.status,
    capabilities: {
      motionSensors: cortexHeadset.motionSensors,
      eegSensors: cortexHeadset.sensors,
    },
  };
}

class CortexProvider {
  constructor(options) {
    this.cortexApi = new Cortex(options);
    this.sessionCache = {};
  }

  /**
   * Convenience method to handle requesting access from the user.
   * @param {int} [maxAttempts=0] The maximum number of access attempts to make.
   *   Set to 0 for infinite.
   * @param {int} [checkInterval=1000] The interval to wait between attempts to access the API.
   * @throws {CortexError} Thrown if the maximum number of attempts is reached.
   * @throws {ServerRpcError} Thrown upon encountering an RPC errror.
   */
  async waitForAccess(maxAttempts = 0, checkInterval = 1000) {
    let attempts = 0;
    // The app name would need to be provided by the user
    // at this point; since all provided API methods do
    // not return it.
    // Therefore, we may need to poll, since the warning messages cannot be
    // distinguished from other apps running on the device.
    // (Unless these warning objects are per-socket. This requires verification.)
    do {
      // eslint-disable-next-line no-await-in-loop
      const accessResult = await this.cortexApi.requestAccess();
      if (accessResult.accessGranted === true) {
        return accessResult;
      }
      // eslint-disable-next-line no-await-in-loop
      await sleepAsync(checkInterval);
      attempts += 1;
    } while (!maxAttempts || attempts <= maxAttempts);
    throw new Error('User did not approve the application in time.');
  }

  /**
   * Returns an array of all available devices.
   * @returns {Array} All devices as provided by the API.
   */
  async getDevices() {
    const result = await this.cortexApi.queryHeadsets();
    return result.map(toUniversalHeadset);
  }

  /**
   * Returns a single device and its capabilities.
   */
  async getDevice(deviceId) {
    const result = await this.cortexApi.queryHeadsets(deviceId);
    return toUniversalHeadset(result[0]);
  }

  /**
   * Acquires a new or cached session for a specified device.
   * @param {string} deviceId the device id.
   */
  async getSession(deviceId) {
    const cachedSession = this.sessionCache[deviceId];
    if (cachedSession.status === SessionStatus.CLOSED) {
      this.sessionCache[deviceId] = this.cortexApi.createSession(deviceId);
    }
    return this.sessionCache[deviceId];
  }

  /**
   * Completes provider initialization to allow other methods to be called.
   */
  async initialize() {
    this.cortexApi.connect();
    this.waitForAccess();
    this.cortexApi.authorize();
  }

  /**
   * Begins to capture Bandpower data from the specified device.
   * @param {string} deviceId A string which represents the device uniquely.
   */
  async createBandPowerStream(deviceId) {
    const session = await this.getSession(deviceId);
    await session.subscribe(DataStream.BAND_POWER)
  }

  /**
   * Closes the current provider.
   */
  async close() {
    await this.cortexApi.close();
  }
}

module.exports = CortexProvider;
