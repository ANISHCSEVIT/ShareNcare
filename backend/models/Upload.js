import mongoose from "mongoose";

const uploadSchema = new mongoose.Schema({
  companyID: String,
  candidateID: String,
  type: String, // Aadhaar, Degree, etc.
  filename: String,
  timestamp: String,
  verified: { type: Boolean, default: false }
});

const Upload = mongoose.model("Upload", uploadSchema);

export default Upload;