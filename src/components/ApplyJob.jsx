import { React, useEffect, useState } from "react";
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
          <div style={{ textAlign: "center" }}>
            <div style={{ fontsize: "50px", marginBottom: "2px" }}>✅</div>
            <h2 style={{ color: "#14804a", marginBottom: "10px" }}>
              Application Sent!
            </h2>
            <p style={{ color: "#666" }}>
              Thank you, {name}. {job.company} has received your interest in the{" "}
              {job.title} role.
            </p>
            <Link to='/'
              style={{
                display: "inline-block",
                marginTop: "20px",
                color: "#222",
                fontWeight: "600",
                textDecoration: "underline"
              }}
            >
              Return Home
            </Link>
          </div>
        ) : (
          <div>
            <h1 style={styles.title}>Apply for {job.title}</h1>
            <p style={styles.subtitle}>at {job.company}</p>

            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.field}>
                <label style={styles.label}>Full Name</label>
                <input
                  style={styles.input}
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Your full name"
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
                  placeholder="email@example.com"
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>LinkedIn Profile</label>
                <input
                  style={styles.input}
                  type="url"
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  placeholder="https://linkedin.com/in/..."
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

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f8fafc",
    padding: "20px",
    fontFamily: "Segoe UI, sans-serif",
  },
  card: {
    background: "#fff",
    padding: "40px",
    borderRadius: "16px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
    maxWidth: "450px",
    width: "100%",
    border: "1px solid #e2e8f0",
  },
  title: {
    margin: "0 0 8px 0",
    fontSize: "28px",
    color: "#1e293b",
    fontWeight: "700",
  },
  subtitle: { margin: "0 0 32px 0", color: "#64748b", fontSize: "18px" },
  form: { display: "flex", flexDirection: "column", gap: "20px" },
  field: { display: "flex", flexDirection: "column", gap: "8px" },
  label: { fontWeight: "600", fontSize: "14px", color: "#475569" },
  input: {
    padding: "12px 16px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    fontSize: "16px",
    outline: "none",
  },
  button: {
    padding: "14px",
    background: "#1e293b",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontWeight: "600",
    fontSize: "16px",
    cursor: "pointer",
    marginTop: "10px",
  },
};

export default ApplyJob;
