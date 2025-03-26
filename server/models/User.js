const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  userType: { 
    type: String, 
    default: "customer",
    enum: ["customer", "admin"], // Only allow these values
    lowercase: true // Convert to lowercase
  },
});

module.exports = mongoose.model("User", UserSchema);