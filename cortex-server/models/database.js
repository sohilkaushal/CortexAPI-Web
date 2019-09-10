const Mongoose = require('mongoose');

const url = 'mongodb://localhost/cortex';

Mongoose.connect(url, { useNewUrlParser: true });

const db = Mongoose.connection;

// eslint-disable-next-line no-console
db.on('error', console.error.bind('MongoDB Connection Error'));

const { Schema } = Mongoose;

const readingDataSchema = new Schema({
  fileName: {
    type: String,
    unique: true,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
});
const fileDataSchema = new Schema({
  stream: {
    type: Object,
  },
  origin: {
    type: String,
    required: true,
  },
  originID: {
    type: Schema.Types.ObjectId,
    required: true,
  },
});

const readingData = Mongoose.model('ReadingSchema', readingDataSchema);
const fileData = Mongoose.model('FileSchema', fileDataSchema);
module.exports = { readingDataSchema, readingData, fileData };
