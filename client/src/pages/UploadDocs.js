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

    const fetchExistingDocs = useCallback(async () => {
        try {
            const res = await axios.get(`/company/candidate/${candidateID}/uploads`);
            setExistingDocs(res.data);
        } catch (err) {
            console.error("Failed to fetch existing documents:", err);
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
        }
    };
    
    const handleModifyClick = (uploadId) => {
        setModifyingUploadId(uploadId);
        fileInputRef.current.click();
    };

    const handleFileChangeForModify = async (event) => {
        const file = event.target.files[0];
        if (!file || !modifyingUploadId) return;

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
        }
        setModifyingUploadId(null);
        fileInputRef.current.value = "";
    };

    return (
        <div className="upload-docs-container">
            <input type="file" ref={fileInputRef} style={{ display: "none" }} onChange={handleFileChangeForModify} />

            <h2>Manage Documents for Candidate #{candidateID}</h2>
            <p>Company: <strong>{companyID}</strong></p>

            <div className="existing-docs-section">
                <h3>Existing Documents</h3>
                {existingDocs.length > 0 ? (
                    <ul className="docs-list">
                        {existingDocs.map(doc => (
                            <li key={doc._id}>
                                <span className="doc-type">{doc.type}</span>
                                <div className="doc-actions">
                                    {/* **THE FIX IS HERE**: Use doc.url which comes from the backend */}
                                    <a href={doc.url} target="_blank" rel="noreferrer">View</a>
                                    <button onClick={() => handleModifyClick(doc._id)}>Modify</button>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No documents have been uploaded for this candidate yet.</p>
                )}
            </div>

            <hr />

            <h3>Upload New Documents</h3>
            <form className="upload-form" onSubmit={handleSubmitNew}>
                 <div className="upload-field">
                    <label>Aadhar Card</label>
                    <input type="file" onChange={(e) => handleNewDocUpload(e, "aadhar")} />
                </div>
                <div className="upload-field">
                    <label>Pan Card</label>
                    <input type="file" onChange={(e) => handleNewDocUpload(e, "pan")} />
                </div>
                <div className="upload-field">
                    <label>Education</label>
                    <input type="file" onChange={(e) => handleNewDocUpload(e, "education")} />
                </div>
                <div className="upload-field">
                    <label>Employment</label>
                    <input type="file" onChange={(e) => handleNewDocUpload(e, "employment")} />
                </div>
                <div className="upload-field">
                    <label>BGV Report</label>
                    <input type="file" onChange={(e) => handleNewDocUpload(e, "bgv")} />
                </div>
                <button type="submit">Submit New Documents</button>
            </form>
        </div>
    );
};

export default UploadDocs;