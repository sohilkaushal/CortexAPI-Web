const express = require('express');
const DeviceRegistry = require('../../service/DeviceRegistry');

const router = express.Router();

/* GET providers. */
router.get('/', async (req, res) => {
  res.json(DeviceRegistry.providers.keys());
});

/* GET all headsets */
router.get('/:providerId/headset/', async (req, res) => {
  const { providerId } = req.params;
  res.json(await DeviceRegistry.getProvider(providerId).getDevices());
});

/* GET a device */
router.get('/:providerId/headset/:deviceId', async (req, res) => {
  const { providerId, deviceId } = req.params;
  res.json(await DeviceRegistry.getProvider(providerId).getDevices(deviceId));
});

router.route('/:providerId/device/:deviceId/capture')
  .get(async (req, res, next) => {
    // List all captures.
    const { providerId, deviceId } = req.params;
  })
  .post(async (req, res, next) => {
    // Create a new capture.
    const { providerId, deviceId } = req.params;
    const { resultId } = req.params;
    res.json(await DeviceRegistry.getProvider(providerId));
  });

router.route('/:providerId/device/:deviceId/capture/:captureId')
  .get(async (req, res, next) => {
    // Get an existing capture.
  })
  .post(async (req, res, next) => {
    // Control an existing capture.
  })
  .delete(async (req, res, next) => {
    // Delete a local capture.
  });

module.exports = router;
