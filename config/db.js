const mongoose = require('mongoose');

const connectDB = async () => {
  mongoose.set('strictQuery', true); // consider disabling if needed.
  const conn = await mongoose.connect(process.env.MONGO_URI);
  console.log(`MongoDB Connected: ${conn.connection.host}`.cyan.underline.bold);
};

module.exports = connectDB;
