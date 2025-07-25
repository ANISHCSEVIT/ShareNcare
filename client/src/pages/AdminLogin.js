import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import '../pages/AdminLogin.css'; // Make sure this CSS file exists

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('/admin/login', { email, password });
            localStorage.setItem('adminToken', res.data.token); // Save the admin token
            alert('Admin login successful');
            navigate('/admin/dashboard');
        } catch (err) {
            alert(err.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div className="login-container">
            <h2>Admin Login</h2>
            <form className="login-form" onSubmit={handleLogin}>
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
            <p style={{ marginTop: '10px' }}>
                Not an Admin? <a href="/login">Login as Company</a>
            </p>
        </div>
    );
};

export default AdminLogin;