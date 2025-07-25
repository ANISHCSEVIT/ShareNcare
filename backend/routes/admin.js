const express = require("express");
const router = express.Router();
const { registerCompany, getAllUploads, adminLogin } = require("../controllers/adminController");

const Company = require("../models/Compay"); // Make sure this model exists

router.post("/create-company", async (req, res) => {
    const { companyID, email, password } = req.body;

    try {
        const exists = await Company.findOne({ companyID });
        if (exists) return res.status(400).json({ message: "Company already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);

        const newCompany = await Company.create({
            companyID,
            email,
            password: hashedPassword
        });

        res.json({ message: "Company created successfully", company: newCompany });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error creating company" });
    }
});
router.post("/login", adminLogin);
router.get("/uploads", getAllUploads);

module.exports = router;
