const mongoose = require('mongoose');

const weeklySchema = new mongoose.Schema({
  groupId: {
    type: String,
    required: true,
  },
  weekStart: {
    type: Date,
  },
  weekEnd: {
    type: Date,
  },
  scores: [
    {
      userId: {
        type: String,
      },
      _serialized: {
        type: String,
      },
      score: {
        type: Number,
      },
    },
  ],
});

const Weekly = mongoose.model('weeklyscore', weeklySchema);

module.exports = { Weekly };
