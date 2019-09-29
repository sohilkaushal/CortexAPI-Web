const JSONStream = require('JSONStream');
const { promisify } = require('util');
const { Cortex, SessionStatus, DataStream } = require('cortex-bindings');
const RemoteCaptureStorage = require('../../models/RemoteCaptureStorage');

const sleepAsync = promisify(setTimeout);

/**
 * Converts a Cortex-format headset to a mindcollector API format.
 * @param {object} cortexHeadset A Cortex-format headset.
 * @returns A mindcollector-format headset.
 */
function toUniversalHeadset(cortexHeadset) {
  return {
    id: cortexHeadset.id,
    alias: cortexHeadset.customName,
    connectionStatus: cortexHeadset.status,
    capabilities: {
      eegSensors: cortexHeadset.sensors,
    },
  };
}

class CortexProvider {
  constructor(repository, options) {
    this.repository = repository;
    this.cortexApi = new Cortex(options);
    this.devices = {};
    this.inProgressCaptures = {};
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
  getSession = async (deviceId) => {
    const device = this.devices[deviceId];

    if (!device) {
      this.devices[deviceId] = {
        cachedSession: await this.cortexApi.createSession(deviceId),
      };
    } else {
      const { cachedSession } = device;

      if (!cachedSession
        || cachedSession.status === SessionStatus.CLOSED) {
        device.cachedSession = await this.cortexApi.createSession(deviceId);
      }
    }
    return this.devices[deviceId].cachedSession;
  }

  /**
   * Completes provider initialization to allow other methods to be called.
   */
  initialize = async () => {
    await this.repository.initialize();
    await this.cortexApi.connect();
    await this.waitForAccess();
    await this.cortexApi.authorize();
  }

  /**
   * Gets all the capture IDs from the provider.
   *
   * @memberof CortexProvider
   */
  getCaptures = async () => {
    const result = await this.repository.listCaptures();
    return result;
  }

  /**
   * Returns a capture in object form.
   *
   * @param {boolean} includeData Whether to include the capture data.
   * @memberof CortexProvider
   */
  getCapture = async (captureId, includeData) => {
    const inProgressCapture = this.inProgressCaptures[captureId];

    if (inProgressCapture) {
      return {
        metadata: await inProgressCapture.capture.getMetadata(),
        status: 'inProgress',
      };
    }
    const capture = this.repository.getCapture(captureId);
    const metadata = await capture.getMetadata();
    // Note that if a capture is not handled by us and incomplete,
    //   then the application has incorrectly terminated and the capture is broken.
    const captureResult = {
      metadata,
      status: await capture.isComplete() ? 'complete' : 'broken',
    };

    if (includeData) {
      captureResult.data = await capture.readCaptureData();
    }

    return captureResult;
  }

  /**
   * Begins to capture Bandpower data from the specified device.
   * @param {string} deviceId A string which represents the device uniquely.
   * @param {int} [duration] An optional number of milliseconds,
   *   after which the capture will be stopped.
   */
  newBandpowerCapture = async (deviceId, duration) => {
    if (!deviceId) {
      throw new Error('The device ID must be defined.');
    }
    const session = await this.getSession(deviceId);
    const subscribeResult = await session.subscribe(DataStream.BAND_POWER);

    if (subscribeResult.failure
      && subscribeResult.failure.length > 0) {
      throw new Error('Failed to subscribe to the bandpower stream');
    }
    const jsonTransformer = JSONStream.stringify();
    const capture = await this.repository.createCapture({ duration, deviceId });
    const outputStream = await capture.getWriteStream();
    const captureId = capture.getId();

    const cleanupCallback = async () => {
      try {
        await capture.setComplete();
        delete this.inProgressCaptures[captureId];
        session.unpipe(jsonTransformer);
        jsonTransformer.end();
        outputStream.destroy();
      } catch (ex) {
        console.error(ex);
        // Ignore cleanup errors.
      }
      session.resume();
    };

    this.inProgressCaptures[captureId] = {
      capture,
      cleanupCallback,
    };

    outputStream.on('error', () => {
      cleanupCallback();
    });
    outputStream.on('close', () => {
      cleanupCallback();
    });

    session
      .pipe(jsonTransformer)
      .pipe(outputStream);

    if (duration) {
      setTimeout(() => { cleanupCallback(); }, duration);
    }

    return {
      id: capture.getId(),
    };
  }

  /**
   * Uploads a capture to a MindStorage provider.
   *
   * @param {string} captureId The Capture ID to upload.
   * @param {string} [name] A name to upload the capture with,
   *  if the metadata does not contain a name then this parameter must be specified.
   * @memberof HeadsetCaptureRepository
   */
  uploadCapture = async (captureId, uploadName) => {
    const captureInProgress = this.inProgressCaptures[captureId];
    let capture;
    if (captureInProgress) {
      capture = captureInProgress.capture;
    } else {
      capture = this.repository.getCapture(captureId);
    }
    const metadata = await capture.getMetadata();
    const data = await capture.readCaptureData();
    const uploadDataObject = {
      data,
      metadata,
    };

    await RemoteCaptureStorage.writeCapture(uploadDataObject, uploadName);
  }

  /**
   * Closes a capture if it is in progress.
   * Otherwise, this method will not do antyhing.
   *
   * @param {string} captureId The Capture ID to close.
   * @memberof HeadsetCaptureRepository
   */
  closeCapture = async (captureId) => {
    const capture = this.inProgressCaptures[captureId];

    if (capture) {
      await capture.cleanupCallback();
    }
  }

  /**
   * Closes and deletes a capture if it exists.
   *
   * @param {string} captureId The Capture ID to delete.
   * @memberof CortexProvider
   */
  deleteCapture = async (captureId) => {
    const captureObject = this.inProgressCaptures[captureId].capture;
    await this.closeCapture();
    await captureObject.delete();
  }

  /**
   * Closes the current provider.
   */
  close = async () => {
    await this.cortexApi.close();
  }
}

module.exports = CortexProvider;
