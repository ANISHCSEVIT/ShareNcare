import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "../api/axios"; // Use your axios instance
import "../pages/CompanyDashboard.css";

const CompanyDashboard = () => {
  const { companyID } = useParams();
  const navigate = useNavigate();

  const [candidates, setCandidates] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: ""
  });

  // Fetch candidates from backend
  const fetchCandidates = async () => {
    try {
      const res = await axios.get(`/company/candidates/${companyID}`);
      setCandidates(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load candidates");
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  const handleAddCandidate = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/company/add-candidate", {
        companyID,
        name: form.name,
        email: form.email,
        phone: form.phone
      });
      fetchCandidates(); // Refresh list
      setForm({ name: "", email: "", phone: "" }); // Clear form
    } catch (err) {
      console.error(err);
      alert("Failed to add candidate");
    }
  };

  // Filter for search
  const filteredCandidates = candidates.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm)
  );

  return (
    <div className="company-dashboard">
      <h2>Welcome, {companyID}</h2>

      <form className="candidate-form" onSubmit={handleAddCandidate}>
        <h3>Add Candidate</h3>
        <input
          type="text"
          placeholder="Candidate Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <input
          type="email"
          placeholder="Candidate Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <input
          type="tel"
          placeholder="Candidate Phone"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          required
        />
        <button type="submit">Add Candidate</button>
      </form>

      <div className="search-candidate">
        <input
          type="text"
          placeholder="Search candidates by name, email or phone"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="candidate-table">
        <h3>Candidate List</h3>
        <table>
          <thead>
            <tr>
              <th>Name</th><th>Email</th><th>Phone</th>
              <th>Created</th><th>Updated</th><th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredCandidates.length === 0 ? (
              <tr>
                <td colSpan="6">No candidates found.</td>
              </tr>
            ) : (
              filteredCandidates.map((c, i) => (
                <tr key={i}>
                  <td>{c.name}</td>
                  <td>{c.email}</td>
                  <td>{c.phone}</td>
                  <td>{c.createdAt}</td>
                  <td>{c.updatedAt}</td>
                  <td>
                    <button onClick={() =>
                      navigate(`/company/${companyID}/candidate/${c._id}`)
                    }>
                      📄 Upload Docs
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CompanyDashboard;