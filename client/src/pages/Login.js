import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import '../pages/Login.css'; // Assuming you have this CSS file

const Login = () => {
    // Using your preferred variable names
    const [companyID, setCompanyID] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    // Renamed handler to handleSubmit as requested
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            // The backend expects 'companyId' (lowercase d), so we map it here
            const res = await axios.post('/company/login', {
                companyId: companyID,
                email,
                password,
            });

            // Save the token with the correct key for the protected route
            localStorage.setItem('companyToken', res.data.token);

            alert('Login successful');

            // Navigate to the correct dashboard URL
            navigate(`/company/dashboard/${res.data.companyId}`);
        } catch (err) {
            // Improved error alert
            alert(`Login failed: ${err.response?.data?.message || 'An error occurred'}`);
        }
    };

    return (
        <div className="login-container">
            <h2>Company Login</h2>
            <form className="login-form" onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Company ID"
                    value={companyID}
                    onChange={(e) => setCompanyID(e.target.value)}
                    required
                />
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit">Login</button>
            </form>
            {/* Kept the link to the admin login page */}
            <p style={{ marginTop: '10px' }}>
                Are you an Admin? <a href="/admin/login">Login here</a>
            </p>
        </div>
    );
};

export default Login;