import axios from 'axios';

const instance = axios.create({
    // This will use your live backend URL in production, or localhost in development
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api'
});

// The interceptor to add the token remains the same
instance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('adminToken') || localStorage.getItem('companyToken');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default instance;