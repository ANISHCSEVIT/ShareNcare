import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import '../pages/Login.css';

const Login = () => {
    const [companyID, setCompanyID] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const res = await axios.post('/company/login', {
                companyId: companyID,
                email,
                password,
            });

            localStorage.setItem('companyToken', res.data.token);
            alert('Login successful');
            navigate(`/company/dashboard/${res.data.companyId}`);
        } catch (err) {
            alert(`Login failed: ${err.response?.data?.message || 'An error occurred'}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-container">
                <div className="login-header">
                    <h1>Welcome Back</h1>
                    <p>Sign in to your company account</p>
                </div>
                
                <form className="login-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="companyID">Company ID</label>
                        <input
                            id="companyID"
                            type="text"
                            placeholder="Enter your company ID"
                            value={companyID}
                            onChange={(e) => setCompanyID(e.target.value)}
                            required
                        />
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                            id="email"
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    
                    <button 
                        type="submit" 
                        className="login-button"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>
                
                <div className="login-footer">
                    <p>Are you an Admin? <a href="/admin/login">Login here</a></p>
                </div>
            </div>
        </div>
    );
};

export default Login;
