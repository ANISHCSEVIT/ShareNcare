import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children, forAdmin }) => {
    // Check for the correct token based on the 'forAdmin' prop
    const token = forAdmin 
        ? localStorage.getItem('adminToken') 
        : localStorage.getItem('companyToken');
        
    const location = useLocation();

    if (!token) {
        // If no token, redirect to the correct login page
        const redirectTo = forAdmin ? '/admin/login' : '/login';
        return <Navigate to={redirectTo} state={{ from: location }} replace />;
    }

    // If token exists, show the requested page
    return children;
};

export default ProtectedRoute;