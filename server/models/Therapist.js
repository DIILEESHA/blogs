// server/models/Therapist.js
const mongoose = require("mongoose");

const TherapistSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  specialization: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model("Therapist", TherapistSchema);