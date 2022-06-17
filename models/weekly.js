const mongoose = require('mongoose'); 

const weeklySchema = new mongoose.Schema({
  groupId: {
    type: Number,
    required: true
  },
  scores: [
    {
      userId: {
        type: String,
      },
      gameNumber: {
        type: Number
      },

    }
  ]
})