// Logout.jsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Logout.css";

function Logout() {
  const navigate = useNavigate();

  useEffect(() => {
    // Remove token or user info from local storage (if that's how you store it)
    localStorage.removeItem("token");
    // You could also clear other data like localStorage.removeItem("user") or sessionStorage, etc.
  }, []);

  // Optionally redirect after a few seconds:
  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     navigate("/login");
  //   }, 3000);
  //   return () => clearTimeout(timer);
  // }, [navigate]);

  return (
    <div className="logout-container">
      <h2>You have been logged out</h2>
      <p>Thank you for using GMU Study Match!</p>
      <button onClick={() => navigate("/login")} className="logout-button">
        Log-in again
      </button>
    </div>
  );
}

export default Logout;
