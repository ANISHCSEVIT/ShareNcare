import { v2 as cloudinary } from 'cloudinary';
import jwt from 'jsonwebtoken';
import Company from '../models/Company.js';
import Candidate from '../models/Candidate.js';
import Upload from '../models/Upload.js';
import bcrypt from 'bcrypt';

// ... (registerCompany, loginCompany, addCandidate, getCompanyCandidates functions remain the same)
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
        const newCandidate = new Candidate({ companyID, name, email, phone, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
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


// **MODIFIED**: This now generates correct Cloudinary URLs for all file types
export const getCandidateUploads = async (req, res) => {
    try {
        const { candidateID } = req.params;
        const uploads = await Upload.find({ candidateID }).lean();
        const uploadsWithUrls = uploads.map(upload => ({
            ...upload,
            url: cloudinary.url(upload.filename, { resource_type: upload.resourceType || "auto" })
        }));
        res.status(200).json(uploadsWithUrls);
    } catch (error) {
        console.error('ERROR FETCHING CANDIDATE UPLOADS:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// **MODIFIED**: Now handles file replacement using Cloudinary
export const modifyUpload = async (req, res) => {
    try {
        const { uploadId } = req.params;
        if (!req.file) return res.status(400).json({ message: 'No new file provided.' });

        const oldUpload = await Upload.findById(uploadId);
        if (!oldUpload) return res.status(404).json({ message: 'Upload record not found' });
        
        try {
            const resourceType = oldUpload.resourceType || 'auto';
            if (resourceType !== 'auto') {
                await cloudinary.uploader.destroy(oldUpload.filename, { resource_type: resourceType });
            } else {
                await cloudinary.uploader.destroy(oldUpload.filename, { resource_type: 'image' }).catch(() => {});
                await cloudinary.uploader.destroy(oldUpload.filename, { resource_type: 'raw' }).catch(() => {});
            }
        } catch (e) {
            console.error('Could not delete old file from Cloudinary, but proceeding anyway:', e.message);
        }

        oldUpload.filename = req.file.filename;
        oldUpload.resourceType = req.file.resource_type;
        oldUpload.timestamp = new Date().toISOString();
        await oldUpload.save();
        
        res.status(200).json({ message: 'Upload modified successfully', upload: oldUpload });
    } catch (error) {
        console.error('ERROR MODIFYING UPLOAD:', error);
        res.status(500).json({ message: 'Server error modifying upload' });
    }
};

// **MODIFIED**: Now saves the Cloudinary public_id and resource_type
export const uploadDocs = async (req, res) => {
    const { companyID, candidateID } = req.body;
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }
    try {
        const uploadPromises = [];
        for (const key in req.files) {
            const files = req.files[key];
            files.forEach(file => {
                const newUpload = new Upload({
                    companyID: companyID,
                    candidateID: candidateID,
                    type: key,
                    filename: file.filename,
                    resourceType: file.resource_type,
                    timestamp: new Date().toISOString(),
                    verified: false,
                });
                uploadPromises.push(newUpload.save());
            });
        }
        await Promise.all(uploadPromises);
        res.status(201).json({ message: 'All documents uploaded successfully.' });
    } catch (error) {
        console.error('ERROR UPLOADING MULTIPLE DOCS:', error);
        res.status(500).json({ message: 'Server error during document upload.' });
    }
};