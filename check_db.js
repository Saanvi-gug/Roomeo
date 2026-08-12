const mongoose = require("mongoose");
const dotenv = require("dotenv");
const dns = require("dns");

// Set public DNS fallback (required for some Windows setups to resolve Atlas SRV records)
dns.setServers(["8.8.8.8", "1.1.1.1"]);

dotenv.config();

const User = require("./models/User");

async function checkDatabase() {
  try {
    console.log("Connecting to MongoDB Atlas...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected successfully!");

    const users = await User.find({}, "-password"); // Exclude hashed passwords for safety
    console.log(`\nFound ${users.length} registered user(s) in the database:`);
    console.log("==========================================");

    users.forEach((user, index) => {
      console.log(`\n[User #${index + 1}]`);
      console.log(`ID:       ${user._id}`);
      console.log(`Name:     ${user.name}`);
      console.log(`Email:    ${user.email}`);
      console.log(`Locality: ${user.locality || "Not set"}`);
      console.log(`City:     ${user.city || "Not set"}`);
    });
    console.log("==========================================");

    await mongoose.connection.close();
    console.log("\nDatabase connection closed.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Database inspection failed:", error);
    process.exit(1);
  }
}

checkDatabase();
