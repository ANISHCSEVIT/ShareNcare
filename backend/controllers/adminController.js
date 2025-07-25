import { v2 as cloudinary } from 'cloudinary';
import jwt from 'jsonwebtoken';
import Company from '../models/Company.js';
import Candidate from '../models/Candidate.js';
import Upload from '../models/Upload.js';
import bcrypt from 'bcrypt';

// Note: We no longer need 'fs' or 'path' for file manipulation on the server

// Admin login logic
export const adminLogin = async (req, res) => {
    const { email, password } = req.body;
    // In a real app, you would look up the admin in a database.
    if (email === 'admin@example.com' && password === 'password') {
        const token = jwt.sign({ id: 'admin_user' }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.status(200).json({ message: 'Admin login successful', token: token });
    } else {
        res.status(401).json({ message: 'Invalid admin credentials' });
    }
};

// Create a company
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

// Get a list of all companies
export const getCompanies = async (req, res) => {
    try {
        const companies = await Company.find({}, '-password');
        res.status(200).json(companies);
    } catch (error) {
        console.error('ERROR FETCHING COMPANIES:', error);
        res.status(500).json({ message: 'Server error fetching companies' });
    }
};

// Get a list of all candidates
export const getCandidates = async (req, res) => {
    try {
        const candidates = await Candidate.find({});
        res.status(200).json(candidates);
    } catch (error) {
        console.error('ERROR FETCHING CANDIDATES:', error);
        res.status(500).json({ message: 'Server error fetching candidates' });
    }
};

// Get all uploads, structured for the admin view
export const getUploads = async (req, res) => {
    try {
        const companies = await Company.find({}).lean();
        const candidates = await Candidate.find({}).lean();
        const uploads = await Upload.find({}).lean();

        const uploadsByCandidate = uploads.reduce((acc, upload) => {
            const candidateId = upload.candidateID.toString();
            if (!acc[candidateId]) acc[candidateId] = {};
            acc[candidateId][upload.type] = {
                // Correctly generate URL for any resource type from Cloudinary
                url: cloudinary.url(upload.filename, { resource_type: "auto" }),
                id: upload._id.toString()
            };
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

// Delete a company and all its associated data (candidates, uploads in Cloudinary)
export const deleteCompany = async (req, res) => {
    try {
        const { id } = req.params;
        const company = await Company.findById(id);
        if (!company) {
            return res.status(404).json({ message: 'Company not found' });
        }

        const candidates = await Candidate.find({ companyID: company.companyId });
        const candidateIds = candidates.map(c => c._id);
        const uploads = await Upload.find({ candidateID: { $in: candidateIds } });

        if (uploads.length > 0) {
            const publicIdsToDelete = uploads.map(upload => upload.filename);
            // Delete resources from Cloudinary, trying both 'raw' and 'image' types
            await cloudinary.api.delete_resources(publicIdsToDelete, { resource_type: 'raw' }).catch(() => {});
            await cloudinary.api.delete_resources(publicIdsToDelete, { resource_type: 'image' }).catch(() => {});
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

// Create a single new upload record
export const createUpload = async (req, res) => {
    try {
        const { companyID, candidateID, type } = req.body;
        if (!req.file) {
            return res.status(400).json({ message: 'No file provided.' });
        }
        const newUpload = new Upload({
            companyID,
            candidateID,
            type,
            filename: req.file.filename, // This is the public_id from Cloudinary
            timestamp: new Date().toISOString(),
            verified: false,
        });
        await newUpload.save();
        res.status(201).json({ message: 'Document uploaded successfully', upload: newUpload });
    } catch (error) {
        console.error('ERROR CREATING UPLOAD:', error);
        res.status(500).json({ message: 'Server error creating upload' });
    }
};

// Modify an existing upload
export const modifyUpload = async (req, res) => {
    try {
        const { uploadId } = req.params;
        if (!req.file) {
            return res.status(400).json({ message: 'No new file provided.' });
        }
        const oldUpload = await Upload.findById(uploadId);
        if (!oldUpload) {
            return res.status(404).json({ message: 'Upload record not found' });
        }

        // Delete the old file from Cloudinary before updating the record
        await cloudinary.uploader.destroy(oldUpload.filename, { resource_type: 'auto' });

        // Update the record with the new file's public ID
        oldUpload.filename = req.file.filename;
        oldUpload.timestamp = new Date().toISOString();
        await oldUpload.save();
        
        res.status(200).json({ message: 'Upload modified successfully', upload: oldUpload });
    } catch (error) {
        console.error('ERROR MODIFYING UPLOAD:', error);
        res.status(500).json({ message: 'Server error modifying upload' });
    }
};
