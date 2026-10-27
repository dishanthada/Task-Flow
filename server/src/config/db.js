const mongoose = require('mongoose');
const dns = require('dns');

// Fix for Windows/Node DNS SRV resolution issues (querySrv ENOTFOUND)
try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch {
  // Ignore if running in a restricted sandbox
}

const connectDB = async () => {
  try {
    let uri = process.env.MONGO_URI;
    if (uri && !uri.includes('authSource=')) {
      uri += uri.includes('?') ? '&authSource=admin' : '?authSource=admin';
    }

    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.error(
      `\n👉 IMPORTANT: Please ensure your current IP address is added to your MongoDB Atlas Network Access whitelist (IP Access List) so the application can connect to the database! You can allow connections from anywhere by adding '0.0.0.0/0' for development purposes.\n`
    );
  }
};

module.exports = connectDB;
