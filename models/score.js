const mongoose = require('mongoose');

const scoreSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
  },
});
