const mongoose = require("mongoose");

const candidateSchema = new mongoose.Schema({
  companyID: String,
  name: String,
  email: String,
  phone: String,
  createdAt: String,
  updatedAt: String
});

module.exports = mongoose.model("Candidate", candidateSchema);
