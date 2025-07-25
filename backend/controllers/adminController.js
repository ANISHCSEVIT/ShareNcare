const Company = require("../models/Compay");
const Upload = require("../models/Upload");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.registerCompany = async (req, res) => {
  const { companyID, email, password } = req.body;
  const hash = await bcrypt.hash(password, 10);

  const newCompany = new Company({ companyID, email, password: hash });
  await newCompany.save();
  res.json({ message: "Company created" });
};

exports.adminLogin = async (req, res) => {
  const { email, password } = req.body;
  if (email !== "admin@admin.com" || password !== "admin123") return res.status(401).json({ message: "Invalid" });

  const token = jwt.sign({ role: "admin" }, process.env.JWT_SECRET, { expiresIn: "1d" });
  res.json({ token });
};

exports.getAllUploads = async (req, res) => {
  const uploads = await Upload.find();
  res.json(uploads);
};
