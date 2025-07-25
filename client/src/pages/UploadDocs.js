import React, { useState } from "react";
import { useParams } from "react-router-dom";
import axios from "../api/axios";
import "../pages/UploadDocs.css";

const UploadDocs = () => {
  const { companyID, candidateID } = useParams();

  const [documents, setDocuments] = useState({
    aadhar: null,
    pan: null,
    education: null,
    employment: null,
    bgv: null,
  });

  const handleUpload = (e, field) => {
    setDocuments({ ...documents, [field]: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("companyID", companyID);
    formData.append("candidateID", candidateID);

    // Append each document if available
    Object.keys(documents).forEach((key) => {
      if (documents[key]) {
        formData.append(key, documents[key]);
      }
    });

    try {
      await axios.post("/company/upload-docs", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Documents uploaded successfully!");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to upload documents");
    }
  };

  return (
    <div className="upload-docs-container">
      <h2>Upload Documents for Candidate #{candidateID}</h2>
      <p>Company: <strong>{companyID}</strong></p>

      <form className="upload-form" onSubmit={handleSubmit}>
        <div className="upload-field">
          <label>Aadhar Card</label>
          <input type="file" onChange={(e) => handleUpload(e, "aadhar")} />
        </div>

        <div className="upload-field">
          <label>Pan Card</label>
          <input type="file" onChange={(e) => handleUpload(e, "pan")} />
        </div>

        <div className="upload-field">
          <label>Education</label>
          <input type="file" onChange={(e) => handleUpload(e, "education")} />
        </div>

        <div className="upload-field">
          <label>Employment</label>
          <input type="file" onChange={(e) => handleUpload(e, "employment")} />
        </div>

        <div className="upload-field">
          <label>BGV Report</label>
          <input type="file" onChange={(e) => handleUpload(e, "bgv")} />
        </div>

        <button type="submit">Submit Documents</button>
      </form>
    </div>
  );
};

export default UploadDocs;
