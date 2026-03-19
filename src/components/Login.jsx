import React, { useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) alert(error.message);
    else navigate("/dashboard");
    setLoading(false);
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) alert("Please check your email for confirmation!");
    else alert("User created! Check your email to verify.");
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.iconContainer}>＠</div>
        <h1 style={styles.title}>Mini-ATS</h1>
        <p style={styles.subtitle}>Smart Applicant Tracking for Teams</p>

        <form style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address</label>
            <input
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            style={styles.loginButton}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>

          <button
            onClick={handleSignUp}
            disabled={loading}
            style={styles.signUpButton}
          >
            New here? <span style={styles.linkText}>Create an account</span>
          </button>
        </form>
      </div>
    </div>
  );
};

// --- PREMIUM STYLES ---
const styles = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
    fontFamily: "'Inter', system-ui, sans-serif",
  },
  card: {
    width: "100%",
    maxWidth: "420px",
    padding: "48px",
    background: "white",
    borderRadius: "24px",
    boxShadow:
      "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    textAlign: "center",
    border: "1px solid #f1f5f9",
  },
  iconContainer: {
    fontSize: "40px",
    marginBottom: "16px",
    background: "#f1f5f9",
    width: "70px",
    height: "70px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "20px",
    margin: "0 auto 20px auto",
    boxShadow: "0 3px 10px rgba(34, 16, 107, 0.55)",
  },
  title: {
    margin: "0 0 8px 0",
    color: "#0f172a",
    fontSize: "28px",
    fontWeight: "800",
    letterSpacing: "-0.025em",
  },
  subtitle: {
    margin: "0 0 32px 0",
    color: "#64748b",
    fontSize: "16px",
    fontWeight: "500",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    textAlign: "left",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  label: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#475569",
    marginLeft: "4px",
  },
  input: {
    padding: "12px 16px",
    borderRadius: "12px",
    border: "1px solid #cbd5e1",
    fontSize: "15px",
    outline: "none",
    background: "#fcfcfc",
    transition: "all 0.2s ease",
  },
  loginButton: {
    padding: "14px",
    background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
    color: "white",
    border: "none",
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: "700",
    fontSize: "16px",
    boxShadow: "0 3px 5px rgba(34, 16, 107, 0.55)",
    marginTop: "10px",
  },
  signUpButton: {
    background: "none",
    border: "none",
    color: "#64748b",
    cursor: "pointer",
    fontSize: "14px",
    marginTop: "8px",
    fontWeight: "500",
  },
  linkText: {
    color: "#4f46e5",
    fontWeight: "600",
    textDecoration: "underline",
  },
};

export default Login;
