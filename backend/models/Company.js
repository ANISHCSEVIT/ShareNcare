import mongoose from "mongoose";

const companySchema = new mongoose.Schema({
  companyId: { // Changed 'name' to 'companyId'
    type: String,
    required: true,
    unique: true, // Added unique constraint
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
});

const Company = mongoose.model("Company", companySchema);
export default Company;
