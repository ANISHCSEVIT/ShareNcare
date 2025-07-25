import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import "../pages/AdminLogin.css";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleAdminLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("/admin/login", { email, password });

      // Save token to localStorage
      localStorage.setItem("adminToken", res.data.token);

      // Navigate to Admin Dashboard
      navigate("/admin");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Login failed. Check credentials.");
    }
  };

  return (
    <div className="admin-login-container">
      <h2>Admin Login</h2>
      <form className="admin-login-form" onSubmit={handleAdminLogin}>
        <input
          type="email"
          placeholder="Admin Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Admin Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit">Login</button>
      </form>
      <p style={{ marginTop: "10px" }}>
        Not an admin? <a href="/">Login as Company</a>
      </p>
    </div>
  );
};

export default AdminLogin;
