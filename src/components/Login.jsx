import React, { useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState(""); 
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (isSignUp) {
      // --- SKAPA KONTO ---
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName }, // Sparar namnet i metadata
        },
      });
      if (error) alert(error.message);
      else alert("Check your email for confirmation!");
    } else {
      // --- LOGGA IN ---
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) alert(error.message);
      else navigate("/dashboard");
    }
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* DYNAMISK IKON: Plus för Sign Up, @ för Login */}
        <div style={{
          ...styles.iconContainer,
          background: isSignUp ? "#ecfdf5" : "#f1f5f9", 
          color: isSignUp ? "#059669" : "#0f172a",
          boxShadow: isSignUp ? "0 3px 10px rgba(16, 185, 129, 0.3)" : "0 3px 10px rgba(34, 16, 107, 0.3)"
        }}>
          {isSignUp ? "＋" : "＠"}
        </div>

        {/* DYNAMISK RUBRIK */}
        <h1 style={styles.title}>
          {isSignUp ? "Join Mini-ATS" : "Welcome Back"}
        </h1>
        <p style={styles.subtitle}>
          {isSignUp ? "Start managing your hiring pipeline" : "Smart Applicant Tracking for Teams"}
        </p>

        <form style={styles.form} onSubmit={handleSubmit}>
          {/* NAMNFÄLT: Visas bara vid Sign Up */}
          {isSignUp && (
            <div style={styles.inputGroup}>
              <label style={styles.label}>Full Name</label>
              <input
                type="text"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                style={styles.input}
                required
              />
            </div>
          )}

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

          {/* DYNAMISK KNAPP: Grön för Sign Up, Lila för Login */}
          <button 
            type="submit" 
            disabled={loading} 
            style={{
              ...styles.loginButton,
              background: isSignUp 
                ? "linear-gradient(135deg, #059669 0%, #10b981 100%)" 
                : "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)"
            }}
          >
            {loading ? "Processing..." : isSignUp ? "Create My Account" : "Sign In to Dashboard"}
          </button>
        </form>

        {/* VÄXLINGSKNAPP: Byter mellan lägena */}
        <button
          onClick={() => setIsSignUp(!isSignUp)}
          style={styles.signUpButton}
        >
          {isSignUp ? (
            <>Already have an account? <span style={styles.linkText}>Sign In</span></>
          ) : (
            <>New here? <span style={styles.linkText}>Create an account</span></>
          )}
        </button>
      </div>
    </div>
  );
}

// --- PREMIUM STYLES ---
const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: "100vw",
    height: "100vh",
    margin: "-8px", 
    padding: "0",
    boxSizing: "border-box",
    backgroundImage:
      "radial-gradient(at 0% 0%, rgba(47, 50, 210, 0.15) 0, transparent 50%), radial-gradient(at 100% 0%, rgba(47, 50, 210, 0.15) 0, transparent 50%)",
    backgroundColor: "#f8fafc",
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
