const mongoose = require('mongoose');

/**
 * Connect to MongoDB
 */
const connectDB = () => {
  try {
    mongoose.connect('mongodb://localhost:27017/wordle-bot', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    const db = mongoose.connection;
    db.once('connected', () => console.log('DB is connected'));
  } catch (err) {
    console.error(err);
  }
};

module.exports = { connectDB };
