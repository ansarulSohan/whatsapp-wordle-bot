const mongoose = require('mongoose');

/**
 * Connect to MongoDB
 */
const connectDB = () => {
  try {
    mongoose.connect(
      'mongodb://myAdmin:sohan123@localhost:27017/wordle-bot?authSource=admin&readPreference=primary&appname=MongoDB%20Compass&directConnection=true&ssl=false',
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );
    const db = mongoose.connection;
    db.once('connected', () => console.log('DB is connected'));
  } catch (err) {
    console.error(err);
  }
};

module.exports = { connectDB };
