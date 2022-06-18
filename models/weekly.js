const mongoose = require('mongoose'); 

const weeklySchema = new mongoose.Schema({
  groupId: {
    type: Number,
    required: true
  },
  weekStart: {
    type: Date
  },
  weekEnd: {
    type: Date
  },
  scores: [
    {
      userId: {
        type: String,
      },
      score: {
        type: Number
      }
    }
  ]
});

const Weekly = mongoose.model('weeklyscore', weeklySchema);

module.exports = {Weekly}