import React, { useState, useEffect, useRef } from "react";
import axios from "../api/axios";
import "../pages/AdminViewUploads.css";

const DOCUMENT_TYPES = ["aadhar", "pan", "education", "employment", "bgv"];

const AdminViewUploads = () => {
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  
  const fileInputRef = useRef(null);
  // State to hold all info needed for an upload/modify action
  const [uploadAction, setUploadAction] = useState({
    action: null, // 'create' or 'modify'
    uploadId: null, // for modifying
    candidateID: null, // for creating
    companyID: null, // for creating
    docType: null, // for creating
  });

  const fetchUploads = async () => {
    try {
      const res = await axios.get("/admin/uploads");
      setCompanies(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load uploads.");
    }
  };

  useEffect(() => {
    fetchUploads();
  }, []);

  // Triggers the file input dialog for either creating or modifying
  const triggerFileInput = (action, data) => {
    setUploadAction({ ...data, action });
    fileInputRef.current.click();
  };

  // Handles the file selection and performs the correct API call
  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file || !uploadAction.action) return;

    const formData = new FormData();

    try {
      if (uploadAction.action === 'modify') {
        formData.append("newDocument", file);
        await axios.put(`/admin/uploads/${uploadAction.uploadId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        alert("Document modified successfully!");
      } else if (uploadAction.action === 'create') {
        formData.append("document", file);
        formData.append("companyID", uploadAction.companyID);
        formData.append("candidateID", uploadAction.candidateID);
        formData.append("type", uploadAction.docType);
        await axios.post(`/admin/uploads`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        alert("Document uploaded successfully!");
      }
      fetchUploads(); // Refresh data
    } catch (err) {
      console.error(err);
      alert("Action failed: " + (err.response?.data?.message || "Server error"));
    }

    // Reset for next use
    setUploadAction({ action: null, uploadId: null, candidateID: null, companyID: null, docType: null });
    fileInputRef.current.value = "";
  };

  const currentCompany = companies.find((c) => c.id === selectedCompany);

  const filteredCandidates = currentCompany?.candidates?.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="admin-uploads-page">
      <input type="file" ref={fileInputRef} style={{ display: "none" }} onChange={handleFileChange} />
      
      <h2>Admin View Uploads</h2>
      <div className="dropdown-section">
        <label>Select Company:</label>
        <select onChange={(e) => setSelectedCompany(e.target.value)}>
          <option value="">-- Choose Company --</option>
          {companies.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {selectedCompany && currentCompany ? (
        <>
            <div className="search-section">
                <input
                  type="text"
                  placeholder="Search candidate by name or email"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <div className="uploads-display">
                <h3>Candidates in {currentCompany?.name}</h3>
                <table className="uploads-table">
                  <thead>
                    <tr>
                      <th>Name</th><th>Email</th><th>Upload Time</th>
                      {DOCUMENT_TYPES.map((docType) => (
                        <th key={docType} style={{ textTransform: "capitalize" }}>{docType}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCandidates && filteredCandidates.length > 0 ? (
                      filteredCandidates.map((cand) => (
                        <tr key={cand.id}>
                          <td>{cand.name}</td>
                          <td>{cand.email}</td>
                          <td>{cand.timestamp ? new Date(cand.timestamp).toLocaleString() : "N/A"}</td>
                          {DOCUMENT_TYPES.map((docType) => (
                            <td key={docType}>
                              {cand.documents[docType] ? (
                                <div className="document-actions">
                                  <a href={cand.documents[docType].url} target="_blank" rel="noreferrer">View</a>
                                  <button
                                    className="modify-btn"
                                    onClick={() => triggerFileInput('modify', { uploadId: cand.documents[docType].id })}
                                  >
                                    Modify
                                  </button>
                                </div>
                              ) : (
                                // **MODIFIED**: Show an "Upload" button if no document exists
                                <button
                                  className="upload-btn"
                                  onClick={() => triggerFileInput('create', {
                                    candidateID: cand.id,
                                    companyID: cand.companyID,
                                    docType: docType
                                  })}
                                >
                                  Upload
                                </button>
                              )}
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : ( <tr><td colSpan={3 + DOCUMENT_TYPES.length}>No matching candidates found.</td></tr> )}
                  </tbody>
                </table>
            </div>
        </>
      ) : selectedCompany ? (<p>Loading company data...</p>) : null}
    </div>
  );
};

export default AdminViewUploads;