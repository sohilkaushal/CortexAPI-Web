const express = require('express');
const DeviceRegistry = require('../../service/DeviceRegistry');

const router = express.Router();

/* GET providers. */
router.get('/', async (req, res) => {
  res.json(DeviceRegistry.getProviderIds());
});

/* GET all devices */
router.get('/:providerId/device/', async (req, res, next) => {
  try {
    const { providerId } = req.params;

    res.json(await DeviceRegistry.getProvider(providerId).getDevices());
  } catch (ex) {
    next(ex);
  }
});

/* GET a device */
router.get('/:providerId/device/:deviceId', async (req, res, next) => {
  try {
    const { providerId, deviceId } = req.params;

    res.json(await DeviceRegistry.getProvider(providerId).getDevice(deviceId));
  } catch (ex) {
    next(ex);
  }
});

/* Manage captures */
router.route('/:providerId/capture')
  .get(async (req, res, next) => {
    try {
      // List all captures.
      const { providerId } = req.params;

      res.json(await DeviceRegistry.getProvider(providerId).getCaptures());
    } catch (ex) {
      next(ex);
    }
  })
  .post(async (req, res, next) => {
    try {
      // Create a new capture.
      const { providerId } = req.params;
      const { deviceId, duration } = req.body;

      res.json(await DeviceRegistry.getProvider(providerId)
        .newBandpowerCapture(deviceId, duration));
    } catch (ex) {
      next(ex);
    }
  });

/* Manage a specific capture */
router.route('/:providerId/capture/:captureId')
  .get(async (req, res, next) => {
    try {
      // Get an existing capture.
      const { providerId, captureId } = req.params;
      const { includeData } = req.query;

      res.json(await DeviceRegistry.getProvider(providerId).getCapture(
        captureId,
        includeData === 'true',
      ));
    } catch (ex) {
      next(ex);
    }
  })
  .post(async (req, res, next) => {
    try {
      /*
      Control a capture.
      Methods:
      {
        "action": "close"
      }
      or
      {
        "action": "upload",
        "uploadName": "Example 123"
      }
      */
      const { providerId, captureId } = req.params;
      const { action, uploadName } = req.body;
      const provider = await DeviceRegistry.getProvider(providerId);

      switch (action) {
        case 'close':
          res.json(await provider.closeCapture(captureId));
          break;
        case 'upload':
          res.json(await provider.uploadCapture(captureId, uploadName));
          break;
        default:
          next(new Error('Action must be either "close" or "upload"'));
          break;
      }
    } catch (ex) {
      next(ex);
    }
  })
  .delete(async (req, res, next) => {
    // Delete a local capture.
    try {
      const { providerId, captureId } = req.params;

      res.json(await DeviceRegistry.getProvider(providerId).deleteCapture(captureId));
    } catch (ex) {
      next(ex);
    }
  });

module.exports = router;
