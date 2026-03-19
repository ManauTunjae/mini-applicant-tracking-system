import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../supabaseClient";

const ApplyJob = () => {
  const { jobId } = useParams();
  const [job, setjob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [experience, setExperience] = useState("");

  useEffect(() => {
    const fetchJobDetails = async () => {
      const { data, error } = await supabase
        .from("jobs")
        .select("title, company")
        .eq("id", jobId)
        .single();

      if (!error) setjob(data);
      setLoading(false);
    };
    fetchJobDetails();
  }, [jobId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { error } = await supabase.from("candidates").insert([
      {
        name,
        email,
        linkedin_url: linkedin,
        experience,
        job_id: parseInt(jobId),
        status: "New",
      },
    ]);

    if (error) {
      alert("Error: " + error.message);
    } else {
      setSubmitted(true);
    }
  };

  if (loading) return <div style={styles.container}>Loading...</div>;
  if (!job) return <div style={styles.container}>Job not found.</div>;

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {submitted ? (
          <div style={styles.successContainer}>
            <div style={styles.successIcon}>✅</div>
            <h2 style={styles.successTitle}>Application Sent!</h2>
            <p style={styles.successText}>
              Thank you, <strong>{name}</strong>. {job.company} has received
              your interest in the <strong>{job.title}</strong> role.
            </p>
            <Link to="/" style={styles.homeButton}>
              Return to Jobs
            </Link>
          </div>
        ) : (
          <div>
            <header style={styles.header}>
              <h1 style={styles.title}>Apply for {job.title}</h1>
              <p style={styles.subtitle}>at {job.company}</p>
            </header>

            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.field}>
                <label style={styles.label}>Full Name</label>
                <input
                  style={styles.input}
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="John Doe"
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Email Address</label>
                <input
                  style={styles.input}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="john@example.com"
                />
              </div>

              {/* FIL-SEKTION (FÖR DEMO) */}
              <div style={styles.fileSection}>
                <div style={styles.field}>
                  <label style={styles.label}>Resume / CV (PDF)</label>
                  <div style={styles.filePlaceholder}>
                    <span style={{ fontSize: "12px", color: "#94a3b8" }}>
                      Feature coming soon: Drag & Drop PDF
                    </span>
                  </div>
                </div>
              </div>

              <div style={styles.field}>
                <label style={styles.label}>LinkedIn Profile (Optional)</label>
                <input
                  style={styles.input}
                  type="url"
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  placeholder="https://linkedin.com/in/..."
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Why are you a good fit?</label>
                <textarea
                  style={{
                    ...styles.input,
                    minHeight: "120px",
                    resize: "none",
                  }}
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  required
                  placeholder="Describe your technical background and experience..."
                />
              </div>

              <button type="submit" style={styles.button}>
                Submit Application
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

// --- PREMIUM STYLES ---
const styles = {
  container: {
    maxHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f8fafc", // Samma som Dashboard
    padding: "40px 20px",
    fontFamily: "'Inter', system-ui, sans-serif",
  },
  card: {
    background: "#fff",
    padding: "48px",
    borderRadius: "24px",
    boxShadow:
      "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    maxWidth: "500px",
    width: "100%",
    border: "1px solid #e2e8f0",
  },
  header: { marginBottom: "32px" },
  title: {
    margin: "0 0 8px 0",
    fontSize: "28px",
    color: "#0f172a",
    fontWeight: "800",
    letterSpacing: "-0.025em",
  },
  subtitle: {
    margin: 0,
    color: "#64748b",
    fontSize: "18px",
    fontWeight: "500",
  },
  form: { display: "flex", flexDirection: "column", gap: "24px" },
  field: { display: "flex", flexDirection: "column", gap: "8px" },
  label: { fontWeight: "600", fontSize: "14px", color: "#475569" },
  input: {
    padding: "12px 16px",
    borderRadius: "12px",
    border: "1px solid #cbd5e1",
    fontSize: "15px",
    outline: "none",
    background: "#fcfcfc",
    transition: "border-color 0.2s",
    fontFamily: "'Inter', system-ui, sans-serif",
  },
  fileSection: {
    padding: "16px",
    background: "#f1f5f9",
    borderRadius: "12px",
    border: "2px dashed #cbd5e1",
  },
  filePlaceholder: {
    height: "40px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#fff",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
  },
  button: {
    padding: "14px",
    background:
      "linear-gradient(135deg,rgba(14, 13, 61, 0.78) 0%,rgb(59, 30, 40) 100%)",
    color: "#fff",
    border: "none",
    borderRadius: "12px",
    fontWeight: "700",
    fontSize: "16px",
    cursor: "pointer",
    boxShadow: "0 3px 7px rgba(34, 16, 107, 0.55)",
    marginTop: "8px",
  },
  // Success state styles
  successContainer: { textAlign: "center", padding: "20px 0" },
  successIcon: { fontSize: "64px", marginBottom: "16px" },
  successTitle: {
    fontSize: "24px",
    color: "#059669",
    fontWeight: "800",
    marginBottom: "12px",
  },
  successText: { color: "#475569", lineHeight: "1.6", fontSize: "16px" },
  homeButton: {
    display: "inline-block",
    marginTop: "32px",
    padding: "12px 24px",
    background: "#f1f5f9",
    color: "#0f172a",
    fontWeight: "600",
    borderRadius: "10px",
    textDecoration: "none",
    transition: "background 0.2s",
  },
};

export default ApplyJob;
