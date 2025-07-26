import mongoose from "mongoose";

const uploadSchema = new mongoose.Schema({
  companyID: String,
  candidateID: String,
  type: String, // e.g., 'aadhar', 'pan', etc.
  filename: String, // This will be the Cloudinary public_id
  resourceType: String, // **CRUCIAL**: Stores 'image' or 'raw' for Cloudinary
  timestamp: String,
  verified: { type: Boolean, default: false }
});

const Upload = mongoose.model("Upload", uploadSchema);

export default Upload;
