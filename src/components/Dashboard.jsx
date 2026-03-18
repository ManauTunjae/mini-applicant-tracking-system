import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient.js";

const Dashboard = () => {
  // --- STATE ---
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [adding, setAdding] = useState(false);
  const [candidatesByJob, setCandidatesByJob] = useState({});
  const [showCandidatesFor, setShowCandidatesFor] = useState({});

  const navigate = useNavigate();

  // --- LOGIK: HÄMTA DATA ---
  // KOMMENTAR: Vi har slagit ihop fetchJobs och kandidat-hämtningen till en funktion.
  // Detta kallas "Single Source of Truth" och förhindrar att vi gör onödiga anrop.
  // 1. Inkludera alla externa verktyg som används inuti funktionen
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;

      if (!user) {
        setJobs([]);
        setCandidatesByJob({});
        setLoading(false);
        return;
      }

      const { data: jobsData, error: jobsError } = await supabase
        .from("jobs")
        .select("*")
        .eq("customer_id", user.id)
        .order("id", { ascending: false });

      if (jobsError) throw jobsError;

      const jobIds = jobsData?.map((j) => j.id) || [];
      let candsByJob = {};

      if (jobIds.length > 0) {
        const { data: allCandidates, error: cErr } = await supabase
          .from("candidates")
          .select("*")
          .in("job_id", jobIds);

        if (cErr) throw cErr;

        candsByJob = allCandidates.reduce((acc, cand) => {
          const jid = cand.job_id;
          if (!acc[jid]) acc[jid] = [];
          acc[jid].push(cand);
          return acc;
        }, {});
      }

      setJobs(jobsData || []);
      setCandidatesByJob(candsByJob);
    } catch (err) {
      console.error("Fetch error:", err.message);
    } finally {
      setLoading(false);
    }
  }, []); 

  // 2. useEffect lyssnar på fetchData
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- HANDLERS ---
  const handleToggleCandidates = (jobId) => {
    setShowCandidatesFor((prev) => ({
      ...prev,
      [jobId]: !prev[jobId],
    }));
  };

  const handleAddJob = async (e) => {
    e.preventDefault();
    setAdding(true);

    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;

    if (!user) {
      alert("Session expired, please log in again.");
      navigate("/");
      setAdding(false);
      return;
    }

    const { error: insertError } = await supabase.from("jobs").insert([
      {
        title: jobTitle,
        company: company,
        customer_id: user.id,
        status: "Open",
      },
    ]);

    if (insertError) {
      alert("Error: " + insertError.message);
    } else {
      setJobTitle("");
      setCompany("");
      await fetchData();
    }
    setAdding(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  // --- RENDERING (JSX) ---
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Dashboard</h1>

        {/* ADD JOB FORM */}
        <form onSubmit={handleAddJob} style={styles.form}>
          <input
            type="text"
            placeholder="Job Title"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            style={styles.input}
            required
          />
          <input
            type="text"
            placeholder="Company Name"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            style={styles.input}
            required
          />
          <button type="submit" style={styles.buttonPrimary} disabled={adding}>
            {adding ? "Adding..." : "Add Job"}
          </button>
        </form>

        <button onClick={handleLogout} style={styles.buttonSecondary}>
          Logout
        </button>
      </div>

      {loading ? (
        <div style={styles.loading}>Loading...</div>
      ) : (
        <div style={styles.grid}>
          {jobs.map((job) => (
            <div key={job.id} style={styles.card}>
              {/* CARD HEADER */}
              <div style={styles.cardHeader}>
                <span>{job.title}</span>
                <span style={styles.badge}>
                  {candidatesByJob[job.id]?.length || 0}{" "}
                  {candidatesByJob[job.id]?.length === 1
                    ? "applicant"
                    : "applicants"}
                </span>
              </div>

              <div style={styles.companyName}>{job.company}</div>

              {/* STATUS TAG */}
              <div
                style={{
                  ...styles.statusTag,
                  background: job.status === "Open" ? "#e8f7ee" : "#fcecea",
                  color: job.status === "Open" ? "#14804a" : "#d63447",
                }}
              >
                {job.status}
              </div>

              {/* ACTION BUTTON */}
              <button
                type="button"
                onClick={() => handleToggleCandidates(job.id)}
                style={styles.buttonAction}
              >
                {showCandidatesFor[job.id]
                  ? "Hide Applicants"
                  : "View Applicants"}
              </button>

              {/* CANDIDATE LIST (CONDITIONAL) */}
              {showCandidatesFor[job.id] && (
                <div style={styles.candidateSection}>
                  {candidatesByJob[job.id]?.length > 0 ? (
                    <ul style={styles.list}>
                      {candidatesByJob[job.id].map((candidate) => (
                        <li key={candidate.id} style={styles.listItem}>
                          <span style={{ fontWeight: 500 }}>
                            {candidate.name}
                          </span>
                          <a
                            href={`mailto:${candidate.email}`}
                            style={styles.emailLink}
                          >
                            {candidate.email}
                          </a>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div style={styles.noData}>No applicants yet.</div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// --- STYLES OBJECT ---
// KOMMENTAR: Jag flyttade ut stylingen för att göra huvudkoden renare och mer lättläst för Jonas.
const styles = {
  container: {
    minHeight: "100vh",
    background: "#f5f6fa",
    padding: "32px",
    fontFamily: "Segoe UI, Arial, sans-serif",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 32,
  },
  title: { margin: 0, fontWeight: 700, fontSize: 32, color: "#222" },
  form: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    background: "#eef1f6",
    padding: "20px 24px",
    borderRadius: "10px",
    border: "1px solid #dadfe4",
  },
  input: {
    padding: "10px 14px",
    borderRadius: "6px",
    border: "1px solid #ccd1d8",
    fontSize: "16px",
    outline: "none",
    background: "#fff",
    width: 200,
  },
  buttonPrimary: {
    padding: "10px 28px",
    backgroundColor: "#222",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    fontWeight: 600,
    cursor: "pointer",
  },
  buttonSecondary: {
    padding: "10px 24px",
    backgroundColor: "#222",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 600,
  },
  loading: { fontSize: 22, color: "#666", marginTop: 40 },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
    gap: "28px",
  },
  card: {
    background: "#fff",
    border: "1px solid #e2e6ea",
    boxShadow: "0 2px 6px rgba(60, 60, 70, 0.08)",
    borderRadius: 12,
    padding: "28px 24px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  cardHeader: {
    fontWeight: 600,
    fontSize: 22,
    color: "#1d2128",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  badge: {
    background: "#e5e7eb",
    color: "#333",
    borderRadius: "12px",
    fontSize: 13,
    fontWeight: 500,
    padding: "4px 10px",
  },
  companyName: { color: "#607080", fontSize: 16, fontWeight: 500 },
  statusTag: {
    alignSelf: "flex-start",
    marginTop: 8,
    padding: "5px 15px",
    borderRadius: 20,
    fontSize: 14,
    fontWeight: 600,
    border: "1px solid #f1f1f3",
  },
  buttonAction: {
    marginTop: 10,
    alignSelf: "flex-start",
    background: "#f3f4f6",
    border: "1px solid #e5e7eb",
    borderRadius: 6,
    fontSize: 14,
    fontWeight: 500,
    padding: "6px 14px",
    cursor: "pointer",
  },
  candidateSection: {
    marginTop: 14,
    paddingTop: 10,
    borderTop: "1px solid #eee",
    background: "#fafafa",
    borderRadius: 6,
    padding: 10,
  },
  list: { listStyle: "none", padding: 0, margin: 0 },
  listItem: {
    marginBottom: 6,
    display: "flex",
    justifyContent: "space-between",
    fontSize: 14,
  },
  emailLink: { color: "#2563eb", textDecoration: "none", fontSize: 13 },
  noData: { color: "#8e98a5", fontSize: 14, fontStyle: "italic" },
};

export default Dashboard;
