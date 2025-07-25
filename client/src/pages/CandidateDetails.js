import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "../api/axios";
import "../pages/CandidateDetails.css";

const CandidateDetails = () => {
  const { candidateID } = useParams();

  const [candidate, setCandidate] = useState(null);
  const [verifyStatus, setVerifyStatus] = useState("");
  const [remarks, setRemarks] = useState("");
  const [file, setFile] = useState(null);

  useEffect(() => {
    const fetchCandidate = async () => {
      try {
        const res = await axios.get(`/company/candidate/${candidateID}`);
        setCandidate(res.data);
      } catch (err) {
        console.error(err);
        alert("Failed to load candidate details.");
      }
    };

    fetchCandidate();
  }, [candidateID]);

  const handleFileUpload = async () => {
    if (!verifyStatus || !file) {
      return alert("Please select a status and upload a file.");
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("status", verifyStatus);
    formData.append("remarks", remarks);

    try {
      await axios.post(`/company/upload-verified/${candidateID}`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      alert("Verification uploaded successfully.");
    } catch (err) {
      console.error(err);
      alert("Upload failed.");
    }
  };

  if (!candidate) return <p>Loading candidate data...</p>;

  return (
    <div className="candidate-details">
      <header className="candidate-header">
        <h1>Consultant Portal</h1>
        <p>Welcome, SHAREANDCARE</p>
      </header>

      <section className="candidate-info">
        <h2>Candidate Information</h2>
        <p><strong>Name:</strong> {candidate.name}</p>
        <p><strong>DOB:</strong> {candidate.dob || "03 Mar 2005"}</p>
        <p><strong>Email:</strong> {candidate.email}</p>
        <p><strong>Mobile:</strong> {candidate.phone}</p>
        <p><strong>Application Stage:</strong> Post Joining Checklist</p>
        <p><strong>Updated On:</strong> {candidate.updatedAt}</p>
        <p><strong>Updated By:</strong> {candidate.sourcedBy || "54734"}</p>
      </section>

      <section className="document-section">
        <h2>BGV Document Verification</h2>

        <div className="document-card">
          <h3>Aadhar (Example)</h3>
          <p><strong>Status:</strong> {candidate.aadharStatus || "Pending"}</p>

          <div className="document-actions">
            <label>Verify Status:</label>
            <select onChange={(e) => setVerifyStatus(e.target.value)} value={verifyStatus}>
              <option value="">Select</option>
              <option value="verified">Verified</option>
              <option value="rejected">Rejected</option>
            </select>

            <label>Verification Remarks:</label>
            <input
              type="text"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />

            <label>Upload Verified Document:</label>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
            />

            <button className="btn-verify" onClick={handleFileUpload}>
              Upload Verified Doc
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CandidateDetails;
