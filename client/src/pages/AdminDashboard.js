import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import "../pages/AdminDashboard.css";

const AdminDashboard = () => {
    const [companyID, setCompanyID] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [companies, setCompanies] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(null);
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
        setIsLoading(true);
        
        try {
            await axios.post("/admin/create-company", {
                companyID,
                email,
                password
            });
            fetchCompanies();
            setCompanyID("");
            setEmail("");
            setPassword("");
            alert("Company created successfully!");
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || "Error creating company");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteCompany = async (companyDbId) => {
        if (window.confirm("Are you sure you want to delete this company and all its data? This cannot be undone.")) {
            setIsDeleting(companyDbId);
            try {
                await axios.delete(`/admin/companies/${companyDbId}`);
                alert("Company deleted successfully.");
                fetchCompanies();
            } catch (err) {
                console.error(err);
                alert(err.response?.data?.message || "Failed to delete company.");
            } finally {
                setIsDeleting(null);
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
        <div className="admin-dashboard-page">
            <div className="admin-dashboard-container">
                <div className="dashboard-header">
                    <div className="header-content">
                        <h1>Admin Dashboard</h1>
                        <p>Manage companies and system settings</p>
                    </div>
                    <button onClick={handleLogout} className="logout-btn">
                        Logout
                    </button>
                </div>

                <div className="dashboard-content">
                    <div className="create-company-section">
                        <h2>Create New Company</h2>
                        <form className="company-form" onSubmit={handleCreateCompany}>
                            <div className="form-group">
                                <label htmlFor="companyID">Company ID</label>
                                <input
                                    id="companyID"
                                    type="text"
                                    placeholder="Enter company ID"
                                    value={companyID}
                                    onChange={(e) => setCompanyID(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="email">Company Email</label>
                                <input
                                    id="email"
                                    type="email"
                                    placeholder="Enter company email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="password">Company Password</label>
                                <input
                                    id="password"
                                    type="password"
                                    placeholder="Enter company password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <button 
                                type="submit" 
                                className="create-btn"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Creating...' : 'Create Company'}
                            </button>
                        </form>
                    </div>

                    <div className="companies-section">
                        <div className="section-header">
                            <h2>Registered Companies</h2>
                            <span className="company-count">{companies.length} companies</span>
                        </div>
                        
                        {companies.length === 0 ? (
                            <div className="empty-state">
                                <p>No companies registered yet</p>
                            </div>
                        ) : (
                            <div className="company-list">
                                {companies.map((company) => (
                                    <div key={company._id} className="company-item">
                                        <div className="company-info">
                                            <div className="company-id">{company.companyId}</div>
                                            <div className="company-email">{company.email}</div>
                                        </div>
                                        <button
                                            className="delete-btn"
                                            onClick={() => handleDeleteCompany(company._id)}
                                            disabled={isDeleting === company._id}
                                        >
                                            {isDeleting === company._id ? 'Deleting...' : 'Delete'}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="actions-section">
                        <button onClick={handleViewUploads} className="view-uploads-btn">
                            📂 View All Uploads
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
