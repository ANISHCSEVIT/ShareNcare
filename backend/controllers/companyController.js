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

export const registerCompany = async (req, res) => {
    const { companyID, email, password } = req.body;
    try {
        const existingCompany = await Company.findOne({ $or: [{ email }, { companyId: companyID }] });
        if (existingCompany) {
            return res.status(400).json({ message: 'Company with this email or ID already exists.' });
        }
        const hashedPassword = await bcrypt.hash(password, 12);
        const newCompany = new Company({ companyId: companyID, email, password: hashedPassword });
        await newCompany.save();
        res.status(201).json({ message: 'Company registered successfully' });
    } catch (error) {
        console.error('ERROR REGISTERING COMPANY:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const loginCompany = async (req, res) => {
    const { companyId, email, password } = req.body;
    try {
        const company = await Company.findOne({ companyId, email });
        if (!company) {
            return res.status(404).json({ message: 'No matching company found for the provided ID and Email.' });
        }
        const isMatch = await bcrypt.compare(password, company.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        const token = jwt.sign({ id: company._id, companyId: company.companyId }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.status(200).json({ message: 'Login successful', token: token, companyId: company.companyId });
    } catch (error) {
        console.error('ERROR LOGGING IN COMPANY:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const addCandidate = async (req, res) => {
    const { companyID, name, email, phone } = req.body;
    try {
        const existingCandidate = await Candidate.findOne({ email, companyID });
        if (existingCandidate) {
            return res.status(400).json({ message: 'This candidate already exists for your company.' });
        }
        const newCandidate = new Candidate({
            companyID,
            name,
            email,
            phone,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });
        await newCandidate.save();
        res.status(201).json({ message: 'Candidate added successfully', candidate: newCandidate });
    } catch (error) {
        console.error('ERROR ADDING CANDIDATE:', error);
        res.status(500).json({ message: 'Server error adding candidate' });
    }
};

export const getCompanyCandidates = async (req, res) => {
    try {
        const { companyID } = req.params;
        const candidates = await Candidate.find({ companyID: companyID });
        res.status(200).json(candidates);
    } catch (error) {
        console.error('ERROR FETCHING COMPANY CANDIDATES:', error);
        res.status(500).json({ message: 'Server error fetching candidates' });
    }
};

export const getCandidateUploads = async (req, res) => {
    try {
        const { candidateID } = req.params;
        console.log('Fetching uploads for candidate:', candidateID);
        
        const uploads = await Upload.find({ candidateID }).lean();
        console.log('Found uploads:', uploads);

        const uploadsWithUrls = uploads.map(upload => {
            console.log('Processing upload:', upload);
            const generatedUrl = generateCloudinaryUrl(upload);
            return {
                ...upload,
                url: generatedUrl
            };
        }).filter(upload => upload.url !== null);

        console.log('Uploads with URLs:', uploadsWithUrls);
        res.status(200).json(uploadsWithUrls);
    } catch (error) {
        console.error('ERROR FETCHING CANDIDATE UPLOADS:', error);
        res.status(500).json({ message: 'Server error' });
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

export const uploadDocs = async (req, res) => {
    const { companyID, candidateID } = req.body;
    
    console.log('=== UPLOAD DOCS DEBUG ===');
    console.log('CompanyID:', companyID);
    console.log('CandidateID:', candidateID);
    console.log('Files received:', req.files);
    
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }
    
    try {
        const uploadPromises = [];
        for (const key in req.files) {
            const files = req.files[key];
            files.forEach(file => {
                console.log('Processing file:', {
                    fieldname: file.fieldname,
                    originalname: file.originalname,
                    mimetype: file.mimetype,
                    filename: file.filename,
                    public_id: file.public_id,
                    resource_type: file.resource_type
                });

                // Use public_id if available, otherwise use filename
                const cloudinaryId = file.public_id || file.filename;

                // Set resource type to image since that's how your files are stored
                let resourceType = 'image';

                const newUpload = new Upload({
                    companyID: companyID,
                    candidateID: candidateID,
                    type: key,
                    filename: cloudinaryId,
                    resourceType: resourceType,
                    originalName: file.originalname,
                    mimetype: file.mimetype,
                    timestamp: new Date().toISOString(),
                    verified: false,
                });

                console.log('Creating upload record:', newUpload);
                uploadPromises.push(newUpload.save());
            });
        }
        await Promise.all(uploadPromises);
        res.status(201).json({ message: 'All documents uploaded successfully.' });
    } catch (error) {
        console.error('ERROR UPLOADING MULTIPLE DOCS:', error);
        res.status(500).json({ message: 'Server error during document upload' });
    }
};
