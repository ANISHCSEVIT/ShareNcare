import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../api/axios";
import "../pages/UploadDocs.css";

const UploadDocs = () => {
    const { companyID, candidateID } = useParams();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [newDocuments, setNewDocuments] = useState({
        aadhar: null, pan: null, education: null, employment: null, bgv: null,
    });
    const [existingDocs, setExistingDocs] = useState([]);
    const [modifyingUploadId, setModifyingUploadId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isModifying, setIsModifying] = useState(false);

    const fetchExistingDocs = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await axios.get(`/company/candidate/${candidateID}/uploads`);
            setExistingDocs(res.data);
        } catch (err) {
            console.error("Failed to fetch existing documents:", err);
        } finally {
            setIsLoading(false);
        }
    }, [candidateID]);

    useEffect(() => {
        fetchExistingDocs();
    }, [fetchExistingDocs]);

    const handleNewDocUpload = (e, field) => {
        setNewDocuments({ ...newDocuments, [field]: e.target.files[0] });
    };

    const handleSubmitNew = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        const formData = new FormData();
        formData.append("companyID", companyID);
        formData.append("candidateID", candidateID);

        let fileAttached = false;
        Object.keys(newDocuments).forEach((key) => {
            if (newDocuments[key]) {
                formData.append(key, newDocuments[key]);
                fileAttached = true;
            }
        });

        if (!fileAttached) {
            alert("Please select at least one new document to upload.");
            setIsSubmitting(false);
            return;
        }

        try {
            await axios.post("/company/upload-docs", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            alert("New documents uploaded successfully!");
            navigate(`/company/dashboard/${companyID}`);
        } catch (err) {
            alert(err.response?.data?.message || "Failed to upload new documents");
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleModifyClick = (uploadId) => {
        setModifyingUploadId(uploadId);
        fileInputRef.current.click();
    };

    const handleFileChangeForModify = async (event) => {
        const file = event.target.files[0];
        if (!file || !modifyingUploadId) return;

        setIsModifying(true);
        const formData = new FormData();
        formData.append("newDocument", file);

        try {
            await axios.put(`/company/uploads/${modifyingUploadId}`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            alert("Document modified successfully!");
            fetchExistingDocs();
        } catch (err) {
            alert("Failed to modify document.");
        } finally {
            setIsModifying(false);
            setModifyingUploadId(null);
            fileInputRef.current.value = "";
        }
    };

    const handleBackToDashboard = () => {
        navigate(`/company/dashboard/${companyID}`);
    };

    const documentTypes = [
        { key: 'aadhar', label: 'Aadhar Card' },
        { key: 'pan', label: 'PAN Card' },
        { key: 'education', label: 'Education Certificate' },
        { key: 'employment', label: 'Employment Document' },
        { key: 'bgv', label: 'BGV Report' }
    ];

    return (
        <div className="upload-docs-page">
            <div className="upload-docs-container">
                <input type="file" ref={fileInputRef} style={{ display: "none" }} onChange={handleFileChangeForModify} />

                <div className="docs-header">
                    <div className="header-content">
                        <h1>Document Management</h1>
                        <p>Candidate ID: <strong>#{candidateID}</strong></p>
                        <p>Company: <strong>{companyID}</strong></p>
                    </div>
                    <button onClick={handleBackToDashboard} className="back-btn">
                        ← Back to Dashboard
                    </button>
                </div>

                <div className="docs-content">
                    <div className="existing-docs-section">
                        <div className="section-header">
                            <h2>Existing Documents</h2>
                            <span className="doc-count">{existingDocs.length} documents</span>
                        </div>
                        
                        {isLoading ? (
                            <div className="loading-state">
                                <p>Loading documents...</p>
                            </div>
                        ) : existingDocs.length > 0 ? (
                            <div className="docs-grid">
                                {existingDocs.map(doc => (
                                    <div key={doc._id} className="doc-item">
                                        <div className="doc-info">
                                            <div className="doc-type">{doc.type.charAt(0).toUpperCase() + doc.type.slice(1)}</div>
                                            <div className="doc-status">Uploaded</div>
                                        </div>
                                        <div className="doc-actions">
                                            <a href={doc.url} target="_blank" rel="noreferrer" className="view-link">
                                                View
                                            </a>
                                            <button 
                                                onClick={() => handleModifyClick(doc._id)}
                                                className="modify-btn"
                                                disabled={isModifying && modifyingUploadId === doc._id}
                                            >
                                                {isModifying && modifyingUploadId === doc._id ? 'Updating...' : 'Modify'}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="empty-state">
                                <p>No documents have been uploaded for this candidate yet</p>
                            </div>
                        )}
                    </div>

                    <div className="upload-new-section">
                        <h2>Upload New Documents</h2>
                        <form className="upload-form" onSubmit={handleSubmitNew}>
                            <div className="upload-grid">
                                {documentTypes.map(({ key, label }) => (
                                    <div key={key} className="upload-field">
                                        <label htmlFor={key}>{label}</label>
                                        <div className="file-input-wrapper">
                                            <input 
                                                id={key}
                                                type="file" 
                                                onChange={(e) => handleNewDocUpload(e, key)}
                                                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                            />
                                            {newDocuments[key] && (
                                                <div className="file-selected">
                                                    ✓ {newDocuments[key].name}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button 
                                type="submit" 
                                className="submit-btn"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Uploading Documents...' : 'Submit New Documents'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UploadDocs;
