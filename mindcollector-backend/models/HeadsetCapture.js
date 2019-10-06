/* eslint-disable class-methods-use-this */
const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');

// Directory structure components.
const CAPTURE_DATA_FILENAME = 'capture.json';
const COMPLETION_FILENAME = 'COMPLETE';
const METADATA_FILENAME = 'metadata.json';

/**
 * Utility function which recursively removes a directory.
 * Used to delete captures.
 * @param {string} directory The directory to remove.
 */
const removeRecursive = async (directory) => {
  const dirContents = fsPromises.readdir(directory, { withFileTypes: true });

  dirContents.forEach((childFile) => {
    const childPath = path.join(directory, childFile.name);

    if (childFile.isDirectory()) {
      removeRecursive(childPath);
    } else {
      fs.unlinkSync(childPath);
    }
  });
  fs.rmdirSync(path);
};

/**
 * Class which spools headset captures to disk for uploading later.
 */
class HeadsetCapture {
  constructor(dataDirectory) {
    this.dataDirectory = dataDirectory;
  }

  /**
   * Returns the path to a metadata JSON file.
   *
   * @memberof HeadsetCapture
   */
  getMetadataPath = () => path.join(this.dataDirectory, METADATA_FILENAME);

  /**
   * Initializes the capture's metadata.
   * If metadata is unspecified only stores the creation time.
   *
   * @param {object} metadata Additional metadata to store with the capture.
   * @memberof HeadsetCapture
   */
  initializeCapture = async (metadata) => {
    const fullMetadata = {
      ...metadata,
      creationTime: Math.floor(new Date() / 1000),
    };

    await fsPromises.writeFile(this.getMetadataPath(),
      JSON.stringify(fullMetadata));
  }

  /**
   * Reads the capture's metadata.
   *
   * @returns The metadata required stored on disk as an object.
   * @memberof HeadsetCapture
   */
  getMetadata = async () => JSON.parse(await fsPromises.readFile(this.getMetadataPath()));

  /**
   * Returns an ID which identifies this session.
   *
   * @returns {string} The ID of this session.
   * @memberof HeadsetCapture
   */
  getId = () => path.basename(this.dataDirectory);

  /**
   * Returns the completion lockfile path.
   *
   * @returns {string} A path to the completion lockfile.
   * @memberof HeadsetCapture
   */
  getCompletionPath = () => path.join(
    this.dataDirectory,
    COMPLETION_FILENAME,
  );

  /**
   * Returns the capture's data JSON path.
   * @returns {string} A path to the capture JSON.
   * @memberof HeadsetCapture
   */
  getDataPath = () => path.join(
    this.dataDirectory,
    CAPTURE_DATA_FILENAME,
  );

  /**
   * Deletes the current headset capture from disk.
   * @memberof HeadsetCapture
   */
  delete = async () => {
    await removeRecursive(this.dataDirectory);
  }

  /**
   * Returns whether the input stream has completely written this capture.
   * @returns Whether this headset capture has completed.
   * @memberof HeadsetCapture
   */
  isComplete = async () => {
    try {
      await (await fsPromises.open(this.getCompletionPath())).close();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Sets the current capture to be complete.
   * @memberof HeadsetCapture
   */
  setComplete = async () => {
    await fsPromises.writeFile(
      this.getCompletionPath(),
      `${Math.floor(new Date() / 1000)}`,
    );
  }

  // Note this should only be called once for any incomplete HeadsetCapture.
  /**
   * Gets a stream which writes the incoming stream to a headset capture.
   * The caller should take care not to call this method multiple times.
   * @returns A new writable stream.
   * @memberof HeadsetCapture
   */
  getWriteStream = async () => {
    if (await this.isComplete()) {
      throw new Error('Cannot write to a completed capture.');
    }

    return fs.createWriteStream(this.getDataPath(), {
      flags: 'wx',
    });
  }

  /**
   * Reads a complete headset capture.
   * @returns All data contained within the capture.
   * @memberof HeadsetCapture
   */
  readCaptureData = async () => {
    if (!(await this.isComplete())) {
      throw new Error('Cannot read from a capture which is being written to.');
    }

    return JSON.parse(await fsPromises.readFile(this.getDataPath()));
  }
}

module.exports = HeadsetCapture;
