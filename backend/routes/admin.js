import express from 'express';
import multer from 'multer';
import storage from '../config/cloudinary.js';
import {
    adminLogin,
    createCompany,
    getCompanies,
    getCandidates,
    getUploads,
    modifyUpload,
    createUpload,
    deleteCompany,
    fixOldUploads,
    fixResourceTypes
} from '../controllers/adminController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

const upload = multer({ storage });

router.post('/login', adminLogin);

// Company Management by Admin
router.post('/create-company', protect, createCompany);
router.get('/companies', protect, getCompanies);
router.delete('/companies/:id', protect, deleteCompany);

// Data Viewing/Management Routes
router.get('/candidates', protect, getCandidates);
router.get('/uploads', protect, getUploads);

// Upload routes
router.post('/uploads', protect, upload.single('document'), createUpload);
router.put('/uploads/:uploadId', protect, upload.single('newDocument'), modifyUpload);

// Migration routes
router.post('/fix-old-uploads', protect, fixOldUploads);
router.post('/fix-resource-types', protect, fixResourceTypes);

export default router;
