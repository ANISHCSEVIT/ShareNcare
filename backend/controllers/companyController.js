const Company = require("../models/Compay");
const Candidate = require("../models/Candidate");
const Upload = require("../models/Upload");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.companyLogin = async (req, res) => {
  const { companyID, password } = req.body;
  const company = await Company.findOne({ companyID });
  if (!company) return res.status(404).json({ message: "Company not found" });

  const valid = await bcrypt.compare(password, company.password);
  if (!valid) return res.status(401).json({ message: "Invalid password" });

  const token = jwt.sign({ companyID }, process.env.JWT_SECRET, { expiresIn: "1d" });
  res.json({ token });
};

exports.addCandidate = async (req, res) => {
  const { companyID, name, email, phone } = req.body;
  const timestamp = new Date().toLocaleString();
  const newCandidate = new Candidate({ companyID, name, email, phone, createdAt: timestamp, updatedAt: timestamp });
  await newCandidate.save();
  res.json({ message: "Candidate added" });
};

exports.getCandidates = async (req, res) => {
  const { companyID } = req.params;
  const candidates = await Candidate.find({ companyID });
  res.json(candidates);
};

exports.uploadDoc = async (req, res) => {
  const { companyID, candidateID } = req.params;
  const { type } = req.body;

  const newUpload = new Upload({
    companyID,
    candidateID,
    type,
    filename: req.file.filename,
    timestamp: new Date().toLocaleString()
  });

  await newUpload.save();
  res.json({ message: "Document uploaded" });
};
