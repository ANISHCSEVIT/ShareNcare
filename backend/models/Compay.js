const mongoose = require("mongoose");

const companySchema = new mongoose.Schema({
  companyID: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  password: { type: String, required: true }
});

module.exports = mongoose.model("Company", companySchema);
