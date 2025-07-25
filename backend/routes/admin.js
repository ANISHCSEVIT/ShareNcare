import express from 'express';
import multer from 'multer';
import storage from '../config/cloudinary.js'; // 1. Import Cloudinary storage config
import {
    adminLogin,
    createCompany,
    getCompanies,
    getCandidates,
    getUploads,
    modifyUpload,
    createUpload,
    deleteCompany
} from '../controllers/adminController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

// 2. Configure multer to use Cloudinary for storage
const upload = multer({ storage });

// --- Define All Admin Routes ---

// Public route (no protection)
router.post('/login', adminLogin);

// Protected routes (all use the 'protect' guard)
router.post('/create-company', protect, createCompany);
router.get('/companies', protect, getCompanies);
router.delete('/companies/:id', protect, deleteCompany);

// Data Viewing/Management Routes
router.get('/candidates', protect, getCandidates);
router.get('/uploads', protect, getUploads);

// 3. These routes now use the Cloudinary-configured 'upload' instance
router.post('/uploads', protect, upload.single('document'), createUpload);
router.put('/uploads/:uploadId', protect, upload.single('newDocument'), modifyUpload);

export default router;