import { v2 as cloudinary } from 'cloudinary';
import jwt from 'jsonwebtoken';
import Company from '../models/Company.js';
import Candidate from '../models/Candidate.js';
import Upload from '../models/Upload.js';
import bcrypt from 'bcrypt';

// Fixed URL generation - uses image for new format, raw for old format
const generateCloudinaryUrl = (upload) => {
    console.log('=== DEBUGGING CLOUDINARY URL ===');
    console.log('Upload filename:', upload.filename);
    console.log('Upload resourceType:', upload.resourceType);
    
    try {
        const cloudName = cloudinary.config().cloud_name;
        let url;
        
        // Check if it's old format (timestamp-filename.pdf)
        const isOldFormat = upload.filename.includes('-') && upload.filename.includes('.pdf');
        
        if (isOldFormat) {
            // Old format PDFs use raw
            url = `https://res.cloudinary.com/${cloudName}/raw/upload/${upload.filename}`;
        } else {
            // New format files (sharencare_uploads/) always use image
            url = `https://res.cloudinary.com/${cloudName}/image/upload/${upload.filename}`;
        }
        
        console.log('Generated URL:', url);
        return url;
        
    } catch (error) {
        console.error('Error generating URL:', error);
        return null;
    }
};

export const adminLogin = async (req, res) => {
    const { email, password } = req.body;
    if (email === 'admin@example.com' && password === 'password') {
        const token = jwt.sign({ id: 'admin_user' }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.status(200).json({ message: 'Admin login successful', token: token });
    } else {
        res.status(401).json({ message: 'Invalid admin credentials' });
    }
};

export const createCompany = async (req, res) => {
    const { companyID, email, password } = req.body;
    try {
        const existingCompany = await Company.findOne({ $or: [{ email }, { companyId: companyID }] });
        if (existingCompany) {
            return res.status(400).json({ message: 'Company with this email or ID already exists.' });
        }
        const hashedPassword = await bcrypt.hash(password, 12);
        const newCompany = new Company({ companyId: companyID, email, password: hashedPassword });
        await newCompany.save();
        res.status(201).json({ message: 'Company created successfully by admin', company: newCompany });
    } catch (error) {
        console.error('ERROR CREATING COMPANY:', error);
        res.status(500).json({ message: 'Server error creating company' });
    }
};

export const getCompanies = async (req, res) => {
    try {
        const companies = await Company.find({}, '-password');
        res.status(200).json(companies);
    } catch (error) {
        console.error('ERROR FETCHING COMPANIES:', error);
        res.status(500).json({ message: 'Server error fetching companies' });
    }
};

export const getCandidates = async (req, res) => {
    try {
        const candidates = await Candidate.find({});
        res.status(200).json(candidates);
    } catch (error) {
        console.error('ERROR FETCHING CANDIDATES:', error);
        res.status(500).json({ message: 'Server error fetching candidates' });
    }
};

export const getUploads = async (req, res) => {
    try {
        const companies = await Company.find({}).lean();
        const candidates = await Candidate.find({}).lean();
        const uploads = await Upload.find({}).lean();

        console.log('Found uploads:', uploads.length);

        const uploadsByCandidate = uploads.reduce((acc, upload) => {
            const candidateId = upload.candidateID.toString();
            if (!acc[candidateId]) acc[candidateId] = {};
            
            console.log(`Processing upload for candidate ${candidateId}:`, upload);
            
            const generatedUrl = generateCloudinaryUrl(upload);
            if (generatedUrl) {
                acc[candidateId][upload.type] = {
                    url: generatedUrl,
                    id: upload._id.toString()
                };
            }
            return acc;
        }, {});

        const candidatesWithDocs = candidates.map(candidate => ({
            id: candidate._id.toString(),
            name: candidate.name,
            email: candidate.email,
            companyID: candidate.companyID,
            timestamp: candidate.createdAt,
            documents: uploadsByCandidate[candidate._id.toString()] || {}
        }));

        const candidatesByCompany = candidatesWithDocs.reduce((acc, candidate) => {
            if (!acc[candidate.companyID]) acc[candidate.companyID] = [];
            acc[candidate.companyID].push(candidate);
            return acc;
        }, {});

        const responseData = companies.map(company => ({
            id: company.companyId,
            name: company.companyId,
            candidates: candidatesByCompany[company.companyId] || []
        }));

        res.status(200).json(responseData);
    } catch (error) {
        console.error('ERROR FETCHING ADMIN UPLOADS:', error);
        res.status(500).json({ message: 'Server error fetching uploads' });
    }
};

export const deleteCompany = async (req, res) => {
    try {
        const { id } = req.params;
        const company = await Company.findById(id);
        if (!company) return res.status(404).json({ message: 'Company not found' });

        const candidates = await Candidate.find({ companyID: company.companyId });
        const candidateIds = candidates.map(c => c._id);
        const uploads = await Upload.find({ candidateID: { $in: candidateIds } });

        if (uploads.length > 0) {
            const rawUploads = uploads.filter(u => u.resourceType === 'raw').map(u => u.filename);
            const imageUploads = uploads.filter(u => u.resourceType === 'image').map(u => u.filename);
            
            if(rawUploads.length > 0) {
                try {
                    await cloudinary.api.delete_resources(rawUploads, { resource_type: 'raw' });
                } catch (e) {
                    console.error('Error deleting raw files:', e);
                }
            }
            if(imageUploads.length > 0) {
                try {
                    await cloudinary.api.delete_resources(imageUploads, { resource_type: 'image' });
                } catch (e) {
                    console.error('Error deleting image files:', e);
                }
            }
        }

        await Upload.deleteMany({ candidateID: { $in: candidateIds } });
        await Candidate.deleteMany({ companyID: company.companyId });
        await Company.findByIdAndDelete(id);

        res.status(200).json({ message: 'Company and all associated data deleted successfully' });
    } catch (error) {
        console.error('ERROR DELETING COMPANY:', error);
        res.status(500).json({ message: 'Server error deleting company' });
    }
};

export const createUpload = async (req, res) => {
    try {
        const { companyID, candidateID, type } = req.body;
        if (!req.file) return res.status(400).json({ message: 'No file provided.' });

        console.log('=== CREATE UPLOAD DEBUG ===');
        console.log('File received:', {
            fieldname: req.file.fieldname,
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            filename: req.file.filename,
            public_id: req.file.public_id,
            resource_type: req.file.resource_type
        });

        // Use public_id if available, otherwise use filename
        const cloudinaryId = req.file.public_id || req.file.filename;

        // Set resource type to image since that's how your files are stored
        let resourceType = 'image';

        const newUpload = new Upload({
            companyID,
            candidateID,
            type,
            filename: cloudinaryId,
            resourceType: resourceType,
            originalName: req.file.originalname,
            mimetype: req.file.mimetype,
            timestamp: new Date().toISOString(),
            verified: false,
        });

        console.log('Creating upload record:', newUpload);
        await newUpload.save();
        res.status(201).json({ message: 'Document uploaded successfully', upload: newUpload });
    } catch (error) {
        console.error('ERROR CREATING UPLOAD:', error);
        res.status(500).json({ message: 'Server error creating upload' });
    }
};

export const modifyUpload = async (req, res) => {
    try {
        const { uploadId } = req.params;
        if (!req.file) return res.status(400).json({ message: 'No new file provided.' });

        const oldUpload = await Upload.findById(uploadId);
        if (!oldUpload) return res.status(404).json({ message: 'Upload record not found' });

        console.log('=== MODIFY UPLOAD DEBUG ===');
        console.log('Old upload:', oldUpload);
        console.log('New file:', req.file);

        // Delete old file from Cloudinary
        try {
            const resourceType = oldUpload.resourceType || 'image';
            await cloudinary.uploader.destroy(oldUpload.filename, { resource_type: resourceType });
        } catch (e) {
            console.error('Could not delete old file from Cloudinary:', e.message);
        }

        // Use public_id if available, otherwise use filename
        const cloudinaryId = req.file.public_id || req.file.filename;

        // Set resource type to image
        let resourceType = 'image';

        oldUpload.filename = cloudinaryId;
        oldUpload.resourceType = resourceType;
        oldUpload.originalName = req.file.originalname;
        oldUpload.mimetype = req.file.mimetype;
        oldUpload.timestamp = new Date().toISOString();
        await oldUpload.save();

        res.status(200).json({ message: 'Upload modified successfully', upload: oldUpload });
    } catch (error) {
        console.error('ERROR MODIFYING UPLOAD:', error);
        res.status(500).json({ message: 'Server error modifying upload' });
    }
};
