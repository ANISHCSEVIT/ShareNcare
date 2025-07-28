import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import "../pages/AdminViewUploads.css";

const DOCUMENT_TYPES = ["aadhar", "pan", "education", "employment", "bgv"];

const AdminViewUploads = () => {
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const navigate = useNavigate();
  
  const fileInputRef = useRef(null);
  const [uploadAction, setUploadAction] = useState({
    action: null,
    uploadId: null,
    candidateID: null,
    companyID: null,
    docType: null,
  });

  const fetchUploads = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get("/admin/uploads");
      setCompanies(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load uploads.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUploads();
  }, []);

  const triggerFileInput = (action, data) => {
    setUploadAction({ ...data, action });
    fileInputRef.current.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file || !uploadAction.action) return;

    const actionKey = uploadAction.action === 'modify' ? uploadAction.uploadId : `${uploadAction.candidateID}-${uploadAction.docType}`;
    setActionLoading(actionKey);

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
      fetchUploads();
    } catch (err) {
      console.error(err);
      alert("Action failed: " + (err.response?.data?.message || "Server error"));
    } finally {
      setActionLoading(null);
    }

    setUploadAction({ action: null, uploadId: null, candidateID: null, companyID: null, docType: null });
    fileInputRef.current.value = "";
  };

  const handleBackToDashboard = () => {
    navigate('/admin/dashboard');
  };

  const currentCompany = companies.find((c) => c.id === selectedCompany);

  const filteredCandidates = currentCompany?.candidates?.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="admin-uploads-page">
      <div className="admin-uploads-container">
        <input type="file" ref={fileInputRef} style={{ display: "none" }} onChange={handleFileChange} />
        
        <div className="uploads-header">
          <div className="header-content">
            <h1>Document Management</h1>
            <p>View and manage company document uploads</p>
          </div>
          <button onClick={handleBackToDashboard} className="back-btn">
            ← Back to Dashboard
          </button>
        </div>

        <div className="uploads-content">
          <div className="company-selection">
            <div className="form-group">
              <label htmlFor="company-select">Select Company</label>
              <select 
                id="company-select"
                value={selectedCompany}
                onChange={(e) => setSelectedCompany(e.target.value)}
                className="company-dropdown"
              >
                <option value="">-- Choose Company --</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          {selectedCompany && currentCompany && (
            <>
              <div className="search-section">
                <div className="form-group">
                  <label htmlFor="search">Search Candidates</label>
                  <input
                    id="search"
                    type="text"
                    placeholder="Search by name or email"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                  />
                </div>
              </div>

              <div className="candidates-section">
                <div className="section-header">
                  <h2>Candidates in {currentCompany?.name}</h2>
                  <span className="candidate-count">
                    {filteredCandidates?.length || 0} candidates
                  </span>
                </div>

                {isLoading ? (
                  <div className="loading-state">
                    <p>Loading candidates...</p>
                  </div>
                ) : filteredCandidates && filteredCandidates.length > 0 ? (
                  <div className="table-container">
                    <table className="uploads-table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Upload Time</th>
                          {DOCUMENT_TYPES.map((docType) => (
                            <th key={docType} className="doc-column">
                              {docType.charAt(0).toUpperCase() + docType.slice(1)}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredCandidates.map((cand) => (
                          <tr key={cand.id}>
                            <td className="name-cell">{cand.name}</td>
                            <td className="email-cell">{cand.email}</td>
                            <td className="time-cell">
                              {cand.timestamp ? new Date(cand.timestamp).toLocaleString() : "N/A"}
                            </td>
                            {DOCUMENT_TYPES.map((docType) => (
                              <td key={docType} className="doc-cell">
                                {cand.documents[docType] ? (
                                  <div className="document-actions">
                                    <a 
                                      href={cand.documents[docType].url} 
                                      target="_blank" 
                                      rel="noreferrer"
                                      className="view-link"
                                    >
                                      View
                                    </a>
                                    <button
                                      className="modify-btn"
                                      onClick={() => triggerFileInput('modify', { uploadId: cand.documents[docType].id })}
                                      disabled={actionLoading === cand.documents[docType].id}
                                    >
                                      {actionLoading === cand.documents[docType].id ? 'Updating...' : 'Modify'}
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    className="upload-btn"
                                    onClick={() => triggerFileInput('create', {
                                      candidateID: cand.id,
                                      companyID: cand.companyID,
                                      docType: docType
                                    })}
                                    disabled={actionLoading === `${cand.id}-${docType}`}
                                  >
                                    {actionLoading === `${cand.id}-${docType}` ? 'Uploading...' : 'Upload'}
                                  </button>
                                )}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="empty-state">
                    <p>No matching candidates found</p>
                  </div>
                )}
              </div>
            </>
          )}

          {selectedCompany && !currentCompany && (
            <div className="loading-state">
              <p>Loading company data...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminViewUploads;
