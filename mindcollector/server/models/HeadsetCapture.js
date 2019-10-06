/* eslint-disable class-methods-use-this */
const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');
const readline = require('readline');
const stream = require('stream');
const { once } = require('events');
const { pipeline } = promisify(stream.pipeline);
const { promisify } = require('util');
const config = require('../config.json');
const DelimitedJSONTransformer = require('./DelimitedJSONTransformer');

// Directory structure components.
const CAPTURE_DATA_FILENAME = 'capture.json';
const COMPLETION_FILENAME = '.complete';

// TODO: Clean up old headset captures.
/**
 * Class which spools headset captures to disk for uploading later.
 */
class HeadsetCapture {
  constructor(dataDirectory) {
    this.dataDirectory = dataDirectory;
  }

  /**
   * Returns an ID which identifies this session.
   *
   * @returns {string} The ID 
   * @memberof HeadsetCapture
   */
  getId() {
    return path.basename(this.dataDirectory);
  }

  /**
   * Returns the completion lockfile path.
   *
   * @returns {string} A path to the completion lockfile.
   * @memberof HeadsetCapture
   */
  getCompletionPath() {
    return path.join(
      this.dataDirectory,
      COMPLETION_FILENAME,
    );
  }

  /**
   * Returns the capture JSON path.
   * @returns {string} A path to the capture JSON.
   * @memberof HeadsetCapture
   */
  getCapturePath() {
    return path.join(
      this.dataDirectory,
      CAPTURE_DATA_FILENAME,
    );
  }

  /**
   * Deletes the current headset capture from disk.
   * @memberof HeadsetCapture
   */
  async delete() {
    await fsPromises.rmdir(this.dataDirectory);
  }

  /**
   * Returns whether the input stream has completely written this capture.
   * @returns If this headset capture has completed.
   * @memberof HeadsetCapture
   */
  async isComplete() {
    try {
      await (await fs.open(this.getCompletionPath(), 'r')).close();
      return true;
    } catch {
      return false;
    }
  }

  // Ensure we are writing stringified data safely.
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#Issue_with_plain_JSON.stringify_for_use_as_JavaScript
  // Note this should only be called once for any incomplete HeadsetCapture.
  /**
   * Writes the complete incoming stream to a headset capture.
   * The caller should take care not to call this method multiple times.
   * @param {HeadsetCapture} incomingStream The incoming stream.
   * @memberof HeadsetCapture
   */
  async writeFromStream(incomingStream) {
    const completionPath = this.getCompletionPath();
    const jsonTransformer = new DelimitedJSONTransformer();
    const fileTransformer = fs.createWriteStream(this.getCapturePath(), {
      flags: 'wx',
    });

    if (this.isComplete()) {
      throw new Error('Cannot write to a completed capture.');
    }
    await pipeline(
      incomingStream,
      jsonTransformer,
      fileTransformer
    )
    try {
      // Attempt to touch the completion lockfile when the stream is finished.
      await (fsPromises.open(completionPath, 'w')).close();
    } catch {
    }
  }

  /**
   * Opens a read stream to a complete headset capture.
   * This contract may eventually be relaxed to allow in-progress streaming.
   *
   * @returns A read stream for the headset.
   * @memberof HeadsetCapture
   */
  async createReadStream() {
    try {
      await (await fsPromises.open(this.getWriteLockPath(), 'r')).close();
      throw new Error('Cannot read from a capture which is being written to.');
    } catch {
      // We want this excepton to be thrown as it indicates there is no completion file.
    }
    // TODO: Add fixed-size in-memory read/write stream + disk swap support and reading in-progress streams.
    return readline.createInterface({
      input: await fsPromises.open(this.capturePath),
    });
  }
}

/**
 * Creates a new, unique, headset capture.
 */
async function create() {
  return new HeadsetCapture(await fsPromises.mkdtemp(path.join(
    config.dataDirectory,
    'capture-',
  )));
}

/**
 * Acquires an existing HeadsetCapture.
 * @param {string} id A unique identifier which represents the session
 */
async function get(id) {
  const resolvedDir = path.join(
    config.dataDirectory,
    id,
  );

  // Directory traversal detection.
  if (resolvedDir.startsWith('../')
    || !resolvedDir.startsWith(config.dataDirectory)) {
    throw new Error('Invalid capture ID provided');
  }
  return new HeadsetCapture(resolvedDir);
}

/**
 * Returns a list of headset capture IDs.
 *
 * @returns {[string]} An Array of capture IDs.
 */
async function list() {
  return fsPromises.readdir(config.dataDirectory).map(
    (value) => path.basename(value)
  );
}

module.exports.create = create;
module.exports.get = get;
module.exports.list = list;
