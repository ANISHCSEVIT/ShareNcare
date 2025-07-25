import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import Pages
import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import CompanyDashboard from './pages/CompanyDashboard';
import UploadDocs from './pages/UploadDocs';
import AdminViewUploads from './pages/AdminViewUploads';

// Import our new gatekeeper component
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public Routes - Anyone can see these */}
          <Route path="/login" element={<Login />} />
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Protected Admin Routes - Must have 'adminToken' */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute forAdmin={true}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/uploads"
            element={
              <ProtectedRoute forAdmin={true}>
                <AdminViewUploads />
              </ProtectedRoute>
            }
          />

          {/* Protected Company Routes - Must have 'companyToken' */}
          <Route
            path="/company/dashboard/:companyID"
            element={
              <ProtectedRoute forAdmin={false}>
                <CompanyDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/company/:companyID/candidate/:candidateID"
            element={
              <ProtectedRoute forAdmin={false}>
                <UploadDocs />
              </ProtectedRoute>
            }
          />

          {/* A default route to redirect users */}
          <Route path="/" element={<Login />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;