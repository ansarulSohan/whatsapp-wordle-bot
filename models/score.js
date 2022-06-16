const mongoose = require('mongoose');

const scoreSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  username: {
    type: String,
  },
  isGroup: {
    type: Boolean,
    required: true,
    default: false,
  },
  groupId: {
    type: String,
    required: function () {
      return this.isGroup;
    },
  },
  groupName: {
    type: String
  },
  gameNumber: {
    type: Number,
    required: true,
  },
  score: {
    type: Number,
    required: true,
  },
  squares: {
    type: String,
    // required: true,
  },
});

const Score = mongoose.model('score', scoreSchema);

module.exports = { Score };
