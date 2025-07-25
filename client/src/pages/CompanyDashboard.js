import React, { useState, useEffect, useCallback } from "react"; // 1. Import useCallback
import { useNavigate, useParams } from "react-router-dom";
import axios from "../api/axios";
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

    // 2. Wrap fetchCandidates in useCallback
    const fetchCandidates = useCallback(async () => {
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
        }
    }, [companyID, navigate]); // Dependencies for this function

    // 3. Add fetchCandidates to the dependency array
    useEffect(() => {
        fetchCandidates();
    }, [fetchCandidates]);

    const handleAddCandidate = async (e) => {
        e.preventDefault();
        try {
            await axios.post("/company/add-candidate", {
                companyID,
                name: form.name,
                email: form.email,
                phone: form.phone
            });
            fetchCandidates();
            setForm({ name: "", email: "", phone: "" });
        } catch (err) {
            console.error(err);
            alert("Failed to add candidate");
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
        <div className="company-dashboard">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>Welcome, {companyID}</h2>
                <button onClick={handleLogout} className="logout-btn">Logout</button>
            </div>

            {/* ... rest of your JSX ... */}
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
                        {filteredCandidates.length > 0 ? (
                            filteredCandidates.map((c, i) => (
                                <tr key={c._id || i}>
                                    <td>{c.name}</td>
                                    <td>{c.email}</td>
                                    <td>{c.phone}</td>
                                    <td>{c.createdAt ? new Date(c.createdAt).toLocaleDateString() : 'N/A'}</td>
                                    <td>{c.updatedAt ? new Date(c.updatedAt).toLocaleDateString() : 'N/A'}</td>
                                    <td>
                                        <button onClick={() =>
                                            navigate(`/company/${companyID}/candidate/${c._id}`)
                                        }>
                                            📄 Upload Docs
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6">No candidates found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CompanyDashboard;