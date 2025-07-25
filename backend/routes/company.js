import express from 'express';
import multer from 'multer';
import storage from '../config/cloudinary.js'; // 1. Import Cloudinary storage config
import {
    registerCompany,
    loginCompany,
    addCandidate,
    getCompanyCandidates,
    uploadDocs,
    getCandidateUploads,
    modifyUpload
} from '../controllers/companyController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

// 2. Configure multer to use Cloudinary for storage
const upload = multer({ storage });

// --- Public routes ---
router.post('/register', registerCompany);
router.post('/login', loginCompany);

// --- Protected routes ---
router.post('/add-candidate', protect, addCandidate);
router.get('/candidates/:companyID', protect, getCompanyCandidates);

// 3. This route now uses the Cloudinary-configured 'upload' instance
router.post('/upload-docs', protect, upload.fields([
    { name: 'aadhar', maxCount: 1 },
    { name: 'pan', maxCount: 1 },
    { name: 'education', maxCount: 1 },
    { name: 'employment', maxCount: 1 },
    { name: 'bgv', maxCount: 1 }
]), uploadDocs);

// Get a specific candidate's uploads
router.get('/candidate/:candidateID/uploads', protect, getCandidateUploads);

// Modify an existing upload, now using Cloudinary
router.put('/uploads/:uploadId', protect, upload.single('newDocument'), modifyUpload);


export default router;