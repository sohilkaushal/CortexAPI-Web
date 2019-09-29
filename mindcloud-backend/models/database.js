const mongoose = require('mongoose');
const config = require('../config.json');

const { mongodbUrl } = config;
const { Schema } = mongoose;

mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);
mongoose.connect(mongodbUrl, { useNewUrlParser: true });

const db = mongoose.connection;

// eslint-disable-next-line no-console
db.on('error', console.error.bind('MongoDB Connection Error'));

const CaptureModelSchema = new Schema({
  name: {
    type: Schema.Types.String,
    required: true,
    unique: true,
  },
  metadata: {
    type: Schema.Types.Mixed,
  },
  data: {
    type: Schema.Types.Array,
    required: true,
  },
});

const CaptureModel = mongoose.model('Capture', CaptureModelSchema);
module.exports = { CaptureModelSchema, CaptureModel };

