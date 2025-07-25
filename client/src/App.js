import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import CompanyDashboard from "./pages/CompanyDashboard";
import UploadDocs from "./pages/UploadDocs";
import AdminViewUploads from "./pages/AdminViewUploads";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/uploads" element={<AdminViewUploads />} />
        <Route path="/company/:companyID" element={<CompanyDashboard />} />
        <Route path="/company/:companyID/candidate/:candidateID" element={<UploadDocs />} />
      </Routes>
    </Router>
  );
}

export default App;
