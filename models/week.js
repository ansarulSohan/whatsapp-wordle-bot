const mongoose = require('mongoose'); 

const weeklySchema = new mongoose.Schema({
  weekstart: {
    type: Date
    
  }
})