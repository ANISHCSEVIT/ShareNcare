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

    const fetchCompanies = async () => {
        try {
            const res = await axios.get("/admin/companies");
            setCompanies(res.data);
        } catch (err) {
            console.error(err);
            alert("Failed to load companies");
        }
    };

    useEffect(() => {
        fetchCompanies();
    }, []);

    const handleCreateCompany = async (e) => {
        e.preventDefault();
        if (!companyID || !email || !password) return;
        try {
            await axios.post("/admin/create-company", {
                companyID,
                email,
                password
            });
            fetchCompanies(); // Refresh the list from the server
            setCompanyID("");
            setEmail("");
            setPassword("");
            alert("Company created successfully!");
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || "Error creating company");
        }
    };

    // **NEW**: Function to handle deleting a company
    const handleDeleteCompany = async (companyDbId) => {
        // Confirm before deleting
        if (window.confirm("Are you sure you want to delete this company and all its data? This cannot be undone.")) {
            try {
                await axios.delete(`/admin/companies/${companyDbId}`);
                alert("Company deleted successfully.");
                // Refresh the company list to reflect the change
                fetchCompanies();
            } catch (err) {
                console.error(err);
                alert(err.response?.data?.message || "Failed to delete company.");
            }
        }
    };

    const handleViewUploads = () => {
        navigate("/admin/uploads");
    };

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        navigate('/admin/login');
    };

    return (
        <div className="admin-dashboard-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>Admin Dashboard</h2>
                <button onClick={handleLogout} className="logout-btn">Logout</button>
            </div>

            <form className="company-form" onSubmit={handleCreateCompany}>
                {/* ... form inputs ... */}
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
                    {companies.map((company) => (
                        // Use the database _id for the key and for deletion
                        <li key={company._id}>
                            <span>
                                <strong>{company.companyId}</strong> — {company.email}
                            </span>
                            {/* **NEW**: Delete Button */}
                            <button
                                className="delete-company-btn"
                                onClick={() => handleDeleteCompany(company._id)}
                            >
                                Delete
                            </button>
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