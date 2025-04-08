const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
  try {
    mongoose
      .connect(process.env.MONGODB_URI)
      .then(() => console.log("MongoDB connected successfully"))
      .catch((err) => console.error("MongoDB connection error:", err));
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  }
};

mongoose.connection.on("connected", () => {
  console.log("Mongoose connected to DB");
});

mongoose.connection.on("error", (err) => {
  console.log("Mongoose connection error:", err);
});

module.exports = { connectDB, mongoose };

