const express = require('express');
const { CaptureModel } = require('../../models/database');

const router = express.Router();

/* GET captures */
router.route('/')
  .get((req, res, next) => {
    // List all captures.
    CaptureModel
      .find(
        {},
        { 'name': 1 },
        (err, captures) => {
          if (err) {
            next(new Error('Error accessing the captures'));
            return;
          }
          res.json(captures);
        },
      );
  });

/* Manage a specific capture */
router.route('/:captureName')
  .get(async (req, res, next) => {
    // Get an existing capture.
    const { captureName } = req.params;
    const { includeData } = req.query;
    const callback = (err, captures) => {
      if (err) {
        next(new Error('Error accessing the captures'));
        return;
      }
      res.json(captures);
    };

    if (includeData !== 'true') {
      CaptureModel
        .findOne(
          { 'name': captureName },
          { 'data': 0 },
          callback,
        );
    } else {
      CaptureModel
        .findOne(
          { 'name': captureName },
          callback,
        );
    }
  })
  .post(async (req, res, next) => {
    // Insert a capture.
    const { captureName } = req.params;
    const { data, metadata } = req.body;
    const model = new CaptureModel({
      name: captureName,
      data,
      metadata,
    });

    model.save((err) => {
      if (err) {
        next(new Error('Failed to save capture.'));
        return;
      }
      res.json({ complete: true });
    });
  })
  .delete(async (req, res, next) => {
    // Delete a capture.
    const { captureName } = req.params;

    CaptureModel.findOneAndDelete(
      { name: captureName },
      (err) => {
        if (err) {
          next(new Error('Failure to delete capture.'));
          return;
        }
        res.json({ complete: true });
      });
  });

module.exports = router;
