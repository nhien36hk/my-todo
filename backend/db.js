const mongoose = require('mongoose');

const initDb = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/mytodo';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB successfully');
    return mongoose.connection;
  } catch (err) {
    console.error('MongoDB connection error:', err);
    throw err;
  }
};

module.exports = { initDb };
