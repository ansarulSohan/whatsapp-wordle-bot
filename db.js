const mongoose = require('mongoose');

/**
 * Connect to MongoDB
 */
const connectDB = () => {
  try {
    mongoose.connect(
      'mongodb://myUserAdmin:2PtaBc1232tP@localhost:27017/?authSource=admin&readPreference=primary&appname=MongoDB%20Compass&directConnection=true&ssl=false',
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
