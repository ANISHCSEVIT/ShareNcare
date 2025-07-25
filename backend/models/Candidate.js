import mongoose from "mongoose";

const candidateSchema = new mongoose.Schema({
  companyID: String,
  name: String,
  email: String,
  phone: String,
  createdAt: String,
  updatedAt: String
});

const Candidate = mongoose.model("Candidate", candidateSchema);

export default Candidate;
