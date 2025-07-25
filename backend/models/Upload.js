const mongoose = require("mongoose");

const uploadSchema = new mongoose.Schema({
  companyID: String,
  candidateID: String,
  type: String, // Aadhaar, Degree, etc.
  filename: String,
  timestamp: String,
  verified: { type: Boolean, default: false }
});

module.exports = mongoose.model("Upload", uploadSchema);
