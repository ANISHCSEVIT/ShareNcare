import React, { useState, useEffect } from "react";
import axios from "../api/axios";
import "../pages/AdminViewUploads.css";

const AdminViewUploads = () => {
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchUploads = async () => {
      try {
        const res = await axios.get("/admin/uploads");
        setCompanies(res.data);
      } catch (err) {
        console.error(err);
        alert("Failed to load uploads.");
      }
    };

    fetchUploads();
  }, []);

  const currentCompany = companies.find((c) => c.id === selectedCompany);

  const filteredCandidates = currentCompany?.candidates.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="admin-uploads-page">
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

      {selectedCompany && (
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
            <h3>Candidates in {currentCompany.name}</h3>

            <table className="uploads-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Upload Time</th>
                  <th>Aadhar</th>
                  <th>Degree</th>
                </tr>
              </thead>
              <tbody>
                {filteredCandidates.length === 0 ? (
                  <tr>
                    <td colSpan="5">No matching candidates found.</td>
                  </tr>
                ) : (
                  filteredCandidates.map((cand) => (
                    <tr key={cand.id}>
                      <td>{cand.name}</td>
                      <td>{cand.email}</td>
                      <td>{cand.timestamp}</td>
                      <td>
                        {cand.documents.aadhar ? (
                          <a href={cand.documents.aadhar} target="_blank" rel="noreferrer">View</a>
                        ) : "Not uploaded"}
                      </td>
                      <td>
                        {cand.documents.degree ? (
                          <a href={cand.documents.degree} target="_blank" rel="noreferrer">View</a>
                        ) : "Not uploaded"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminViewUploads;
