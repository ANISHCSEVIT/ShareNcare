import axios from 'axios';

const instance = axios.create({
    baseURL: 'http://localhost:5000/api'
});

// This code runs before every API request is sent
instance.interceptors.request.use(
    (config) => {
        // Look for either an admin or company token
        const token = localStorage.getItem('adminToken') || localStorage.getItem('companyToken');
        
        if (token) {
            // If a token exists, add it to the request header
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default instance;