const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // Mongoose 8.x uses these options by default, no need to specify
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.error(`\n👉 IMPORTANT: Please ensure your current IP address is added to your MongoDB Atlas Network Access whitelist (IP Access List) so the application can connect to the database! You can allow connections from anywhere by adding '0.0.0.0/0' for development purposes.\n`);
  }
};

module.exports = connectDB;
