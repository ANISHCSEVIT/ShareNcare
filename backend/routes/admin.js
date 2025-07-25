import express from 'express';
import multer from 'multer';
import {
    adminLogin,
    createCompany,
    getCompanies,
    getCandidates,
    getUploads,
    modifyUpload,
    createUpload,
    deleteCompany // <-- Import new function
} from '../controllers/adminController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage: storage });

// --- Define All Admin Routes ---

router.post('/login', adminLogin);

// Company Management by Admin
router.post('/create-company', protect, createCompany);
router.get('/companies', protect, getCompanies);
router.delete('/companies/:id', protect, deleteCompany); // <-- **NEW**: Delete a company

// Data Viewing/Management Routes
router.get('/candidates', protect, getCandidates);
router.get('/uploads', protect, getUploads);
router.post('/uploads', protect, upload.single('document'), createUpload);
router.put('/uploads/:uploadId', protect, upload.single('newDocument'), modifyUpload);

export default router;