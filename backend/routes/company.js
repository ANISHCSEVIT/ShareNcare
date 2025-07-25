const express = require("express");
const router = express.Router();
const multer = require("multer");
const { addCandidate, uploadDoc, companyLogin, getCandidates } = require("../controllers/companyController");

const storage = multer.diskStorage({
  destination: "./uploads/",
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});

const upload = multer({ storage });

router.post("/login", companyLogin);
router.post("/add-candidate", addCandidate);
router.get("/candidates/:companyID", getCandidates);
router.post("/upload/:companyID/:candidateID", upload.single("file"), uploadDoc);

module.exports = router;
