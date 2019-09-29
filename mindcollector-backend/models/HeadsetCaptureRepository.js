const path = require('path');
const fsPromises = require('fs').promises;
const HeadsetCapture = require('./HeadsetCapture');

// TODO: Clean up old headset captures.
class HeadsetCaptureRepository {
  constructor(directory) {
    this.directory = directory;
  }

  /**
   * Initializes the target repository directory.
   *
   * @memberof HeadsetCaptureRepository
   */
  initialize = async () => {
    const result = await fsPromises.mkdir(this.directory, { recursive: true });

    return result;
  }

  /**
   * Creates a new, unique, headset capture.
   */
  createCapture = async (metadata) => {
    const capture = new HeadsetCapture(await fsPromises.mkdtemp(path.join(
      this.directory,
      'capture-',
    )));

    await capture.initializeCapture(metadata);
    return capture;
  }

  /**
   * Acquires an existing HeadsetCapture.
   * @param {string} id A unique identifier which represents the session
   */
  getCapture = (id) => {
    const resolvedDir = path.join(
      this.directory,
      id,
    );

    // Directory traversal detection.
    if (resolvedDir.startsWith('../')
      || !resolvedDir.startsWith(this.directory)) {
      throw new Error('Invalid capture ID provided');
    }
    return new HeadsetCapture(resolvedDir);
  }

  /**
   * Returns a list of headset capture IDs.
   *
   * @returns {[string]} An Array of capture IDs.
   */
  listCaptures = async () => (await fsPromises.readdir(this.directory))
    .map((value) => path.basename(value));
}

module.exports = HeadsetCaptureRepository;
