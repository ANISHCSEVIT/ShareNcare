import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios"; // Use the axios instance you created
import "../pages/Login.css";

const Login = () => {
  const [companyID, setCompanyID] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("/company/login", {
        companyID,
        email,
        password,
      });

      // Save JWT token to local storage
      localStorage.setItem("token", res.data.token);

      // Redirect to company dashboard
      navigate(`/company/${companyID}`);
    } catch (err) {
      alert("Login failed: " + err.response.data.message);
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
      <p style={{ marginTop: "10px" }}>
        Are you Admin? <a href="/admin-login">Login here</a>
      </p>
    </div>
  );
};

export default Login;
