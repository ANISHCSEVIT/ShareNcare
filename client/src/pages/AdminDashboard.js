import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import "../pages/AdminDashboard.css";

const AdminDashboard = () => {
  const [companyID, setCompanyID] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companies, setCompanies] = useState([]);

  const navigate = useNavigate();

  // Fetch companies from backend on load
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await axios.get("/admin/companies", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        });
        setCompanies(res.data);
      } catch (err) {
        console.error(err);
        alert("Failed to load companies");
      }
    };

    fetchCompanies();
  }, []);

  const handleCreateCompany = async (e) => {
  e.preventDefault();

  if (!companyID || !email || !password) return;

  try {
    const token = localStorage.getItem("adminToken"); // Use the admin token

    const res = await axios.post("/admin/create-company", {
      companyID,
      email,
      password
    }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    // Update frontend list
    setCompanies([...companies, res.data.company]);

    // Reset form
    setCompanyID("");
    setEmail("");
    setPassword("");
    
    alert("Company created successfully!");

  } catch (err) {
    console.error(err);
    alert(err.response?.data?.message || "Error creating company");
  }
};

  const handleViewUploads = () => {
    navigate("/admin/uploads");
  };

  return (
    <div className="admin-dashboard-container">
      <h2>Admin Dashboard</h2>

      <form className="company-form" onSubmit={handleCreateCompany}>
        <input
          type="text"
          placeholder="Company ID"
          value={companyID}
          onChange={(e) => setCompanyID(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Company Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Company Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Create Company</button>
      </form>

      <div className="company-list">
        <h3>Registered Companies</h3>
        <ul>
          {companies.map((company, index) => (
            <li key={index}>
              <strong>{company.companyID}</strong> — {company.email}
            </li>
          ))}
        </ul>
      </div>

      <div className="view-uploads">
        <button onClick={handleViewUploads}>📂 View All Uploads</button>
      </div>
    </div>
  );
};

export default AdminDashboard;
