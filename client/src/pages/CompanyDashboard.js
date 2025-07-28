import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "../api/axios";
import "../pages/CompanyDashboard.css";

const CompanyDashboard = () => {
    const { companyID } = useParams();
    const navigate = useNavigate();

    const [candidates, setCandidates] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: ""
    });

    const fetchCandidates = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await axios.get(`/company/candidates/${companyID}`);
            setCandidates(res.data);
        } catch (err) {
            console.error(err);
            if (err.response && err.response.status === 401) {
                navigate('/login');
            } else {
                alert("Failed to load candidates");
            }
        } finally {
            setIsLoading(false);
        }
    }, [companyID, navigate]);

    useEffect(() => {
        fetchCandidates();
    }, [fetchCandidates]);

    const handleAddCandidate = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        try {
            await axios.post("/company/add-candidate", {
                companyID,
                name: form.name,
                email: form.email,
                phone: form.phone
            });
            fetchCandidates();
            setForm({ name: "", email: "", phone: "" });
            alert("Candidate added successfully!");
        } catch (err) {
            console.error(err);
            alert("Failed to add candidate");
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleLogout = () => {
        localStorage.removeItem('companyToken');
        navigate('/login');
    };

    const filteredCandidates = candidates.filter((c) =>
        (c.name && c.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (c.phone && c.phone.includes(searchTerm))
    );

    return (
        <div className="company-dashboard-page">
            <div className="company-dashboard-container">
                <div className="dashboard-header">
                    <div className="header-content">
                        <h1>Welcome, {companyID}</h1>
                        <p>Manage your candidates and document uploads</p>
                    </div>
                    <button onClick={handleLogout} className="logout-btn">
                        Logout
                    </button>
                </div>

                <div className="dashboard-content">
                    <div className="add-candidate-section">
                        <h2>Add New Candidate</h2>
                        <form className="candidate-form" onSubmit={handleAddCandidate}>
                            <div className="form-group">
                                <label htmlFor="name">Candidate Name</label>
                                <input
                                    id="name"
                                    type="text"
                                    placeholder="Enter candidate name"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="email">Email Address</label>
                                <input
                                    id="email"
                                    type="email"
                                    placeholder="Enter candidate email"
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="phone">Phone Number</label>
                                <input
                                    id="phone"
                                    type="tel"
                                    placeholder="Enter candidate phone"
                                    value={form.phone}
                                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                    required
                                />
                            </div>
                            <button 
                                type="submit" 
                                className="add-btn"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Adding...' : 'Add Candidate'}
                            </button>
                        </form>
                    </div>

                    <div className="candidates-section">
                        <div className="section-header">
                            <h2>Candidate List</h2>
                            <span className="candidate-count">{filteredCandidates.length} candidates</span>
                        </div>

                        <div className="search-section">
                            <div className="form-group">
                                <label htmlFor="search">Search Candidates</label>
                                <input
                                    id="search"
                                    type="text"
                                    placeholder="Search by name, email or phone"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="search-input"
                                />
                            </div>
                        </div>

                        {isLoading ? (
                            <div className="loading-state">
                                <p>Loading candidates...</p>
                            </div>
                        ) : filteredCandidates.length > 0 ? (
                            <div className="table-container">
                                <table className="candidates-table">
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Email</th>
                                            <th>Phone</th>
                                            <th>Created</th>
                                            <th>Updated</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredCandidates.map((c, i) => (
                                            <tr key={c._id || i}>
                                                <td className="name-cell">{c.name}</td>
                                                <td className="email-cell">{c.email}</td>
                                                <td className="phone-cell">{c.phone}</td>
                                                <td className="date-cell">
                                                    {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : 'N/A'}
                                                </td>
                                                <td className="date-cell">
                                                    {c.updatedAt ? new Date(c.updatedAt).toLocaleDateString() : 'N/A'}
                                                </td>
                                                <td className="action-cell">
                                                    <button 
                                                        onClick={() => navigate(`/company/${companyID}/candidate/${c._id}`)}
                                                        className="upload-docs-btn"
                                                    >
                                                        📄 Upload Docs
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="empty-state">
                                <p>No candidates found</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CompanyDashboard;
