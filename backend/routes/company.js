import express from 'express';
import multer from 'multer';
import {
    registerCompany,
    loginCompany,
    addCandidate,
    getCompanyCandidates,
    uploadDocs,
    getCandidateUploads, // <-- Import new function
    modifyUpload        // <-- Import new function
} from '../controllers/companyController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage: storage });

// Public routes
router.post('/register', registerCompany);
router.post('/login', loginCompany);

// Protected routes
router.post('/add-candidate', protect, addCandidate);
router.get('/candidates/:companyID', protect, getCompanyCandidates);
router.post('/upload-docs', protect, upload.fields([
    { name: 'aadhar', maxCount: 1 },
    { name: 'pan', maxCount: 1 },
    { name: 'education', maxCount: 1 },
    { name: 'employment', maxCount: 1 },
    { name: 'bgv', maxCount: 1 }
]), uploadDocs);

// **NEW**: Get a specific candidate's uploads
router.get('/candidate/:candidateID/uploads', protect, getCandidateUploads);

// **NEW**: Modify an existing upload
router.put('/uploads/:uploadId', protect, upload.single('newDocument'), modifyUpload);


export default router;