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
            <Link
              style={{
                display: "inline-block",
                marginTop: "20px",
                color: "#222",
                fontWeight: "600",
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
                  placeholder="apply@example.com"
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

export default ApplyJob;
