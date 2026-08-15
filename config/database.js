const mongoose = require("mongoose");
const dns = require("dns");

// Set public DNS servers to avoid querySrv ECONNREFUSED errors on Windows Node.js
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log("✅ MongoDB Connected");
    console.log("Host:", conn.connection.host);
  } catch (error) {
    console.error("❌ MongoDB Connection Failed");
    console.error(error.message || error);
    throw error;
  }
};

module.exports = connectDB;

