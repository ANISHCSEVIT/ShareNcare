import fs from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';
import Company from '../models/Company.js';
import Candidate from '../models/Candidate.js';
import Upload from '../models/Upload.js';
import bcrypt from 'bcrypt';

const __dirname = path.resolve(path.dirname(''));

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
        // This line is crucial for debugging.
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
        uploads.forEach(upload => {
            const filePath = path.join(__dirname, 'uploads', upload.filename);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        });
        await Upload.deleteMany({ candidateID: { $in: candidateIds } });
        await Candidate.deleteMany({ companyID: company.companyId });
        await Company.findByIdAndDelete(id);
        res.status(200).json({ message: 'Company and all associated data deleted successfully' });
    } catch (error) {
        console.error('ERROR DELETING COMPANY:', error);
        res.status(500).json({ message: 'Server error deleting company' });
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

        // **THE FIX IS HERE**: Use the environment variable for the base URL
        const baseUrl = process.env.BACKEND_URL || 'http://localhost:5000';

        const uploadsByCandidate = uploads.reduce((acc, upload) => {
            const candidateId = upload.candidateID.toString();
            if (!acc[candidateId]) acc[candidateId] = {};
            acc[candidateId][upload.type] = {
                // Construct the full, correct URL
                url: `${baseUrl}/uploads/${upload.filename}`,
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
            filename: req.file.filename,
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
        const oldFilePath = path.join(__dirname, 'uploads', oldUpload.filename);
        if (fs.existsSync(oldFilePath)) {
            fs.unlinkSync(oldFilePath);
        }
        oldUpload.filename = req.file.filename;
        oldUpload.timestamp = new Date().toISOString();
        await oldUpload.save();
        res.status(200).json({ message: 'Upload modified successfully', upload: oldUpload });
    } catch (error) {
        console.error('ERROR MODIFYING UPLOAD:', error);
        res.status(500).json({ message: 'Server error modifying upload' });
    }
};