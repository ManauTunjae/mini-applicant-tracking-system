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
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;

      if (!user) {
        navigate("/");
        return;
      }

      const { data: jobsData, error: jobsError } = await supabase
        .from("jobs")
        .select("*")
        .eq("customer_id", user.id)
        .eq("is_deleted", false) // Hämtar bara icke-arkiverade jobb
        .order("id", { ascending: false });

      if (jobsError) throw jobsError;

      const jobIds = jobsData?.map((j) => j.id) || [];
      let candsByJob = {};

      if (jobIds.length > 0) {
        const { data: allCandidates, error: cErr } = await supabase
          .from("candidates")
          .select("*")
          .in("job_id", jobIds)
          .order("id", { ascending: true });

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
  }, [navigate]);

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

    const { error: insertError } = await supabase.from("jobs").insert([
      {
        title: jobTitle,
        company: company,
        customer_id: userData.user.id,
        status: "Open",
      },
    ]);

    if (!insertError) {
      setJobTitle("");
      setCompany("");
      await fetchData();
    }
    setAdding(false);
  };

  const handleDeleteJob = async (jobId) => {
    const confirmDelete = window.confirm(
      "Are you sure that you want to archive this job? This will remove it from your active list!",
    );

    if (confirmDelete) {
      // FIX: Ändrat från .select() till .update() för korrekt Soft Delete
      const { error } = await supabase
        .from("jobs")
        .update({ is_deleted: true })
        .eq("id", jobId);

      if (!error) {
        fetchData();
      } else {
        alert("Could not archive job: " + error.message);
      }
    }
  };

  const analyzeCandidate = async (candidateId, experience) => {
    if (!experience) {
      alert("No bio provided for analysis.");
      return;
    }
    const textLength = experience.length;
    let matchScore =
      textLength > 100
        ? "Match: 90% - Detailed profile ✨"
        : textLength > 30
          ? "Match: 65% - Solid foundation 🤔"
          : "Match: 30% - Brief profile 📞";
    await supabase
      .from("candidates")
      .update({ ai_score: matchScore })
      .eq("id", candidateId);
    fetchData();
  };

  const analyzeAllForJob = async (jobId) => {
    const candidates = candidatesByJob[jobId];
    if (!candidates) return;
    const updates = candidates.map((cand) => {
      const textLength = cand.experience?.length || 0;
      let score =
        textLength > 100
          ? "Match: 95% ✨"
          : textLength > 30
            ? "Match: 60% 🤔"
            : "Match: 20% 📞";
      return supabase
        .from("candidates")
        .update({ ai_score: score })
        .eq("id", cand.id);
    });
    await Promise.all(updates);
    fetchData();
  };

  const updateCandidateStatus = async (candidateId, newStatus) => {
    const { error } = await supabase
      .from("candidates")
      .update({ status: newStatus })
      .eq("id", candidateId);
    if (!error) fetchData();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>ATS Dashboard</h1>
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
            placeholder="Company"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            style={styles.input}
            required
          />
          <button type="submit" style={styles.buttonPrimary} disabled={adding}>
            {adding ? "Saving..." : "Create Job"}
          </button>
        </form>
        <button onClick={handleLogout} style={styles.buttonSecondary}>
          Logout
        </button>
      </div>

      {loading ? (
        <div style={styles.loading}>Loading data...</div>
      ) : (
        <div style={styles.grid}>
          {jobs.map((job) => (
            <div key={job.id} style={styles.card}>
              {/* NY LAYOUT: Titel & Arkiv-knapp */}
              <div style={styles.cardHeaderTop}>
                <div style={styles.titleGroup}>
                  <span style={styles.jobTitleText}>{job.title}</span>
                  <span style={styles.companyName}>{job.company}</span>

                  {/* Badges under titeln */}
                  <div style={styles.badgeGroup}>
                    <span style={styles.badge}>
                      {candidatesByJob[job.id]?.length || 0} applicants
                    </span>
                    <div
                      style={{
                        ...styles.statusTag,
                        background:
                          job.status === "Open" ? "#e8f7ee" : "#fcecea",
                        color: job.status === "Open" ? "#14804a" : "#d63447",
                      }}
                    >
                      {job.status}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteJob(job.id)}
                  style={styles.archiveButton}
                  title="Archive Job"
                >
                  🗑️ Arkivera
                </button>
              </div>

              <button
                onClick={() => handleToggleCandidates(job.id)}
                style={styles.buttonAction}
              >
                {showCandidatesFor[job.id] ? "Hide List" : "View Applicants"}
              </button>

              {showCandidatesFor[job.id] && (
                <div style={styles.candidateSection}>
                  {candidatesByJob[job.id]?.length > 0 && (
                    <button
                      onClick={() => analyzeAllForJob(job.id)}
                      style={styles.bulkAiButton}
                    >
                      Analyze All with AI 🤖✨
                    </button>
                  )}
                  {candidatesByJob[job.id]?.length > 0 ? (
                    <ul style={styles.list}>
                      {candidatesByJob[job.id].map((candidate) => (
                        <li key={candidate.id} style={styles.listItem}>
                          <div style={styles.candidateHeader}>
                            <div style={styles.candidateName}>
                              {candidate.name}
                              <a
                                href={`mailto:${candidate.email}`}
                                style={styles.emailLink}
                              >
                                {candidate.email}
                              </a>
                            </div>
                            <select
                              value={candidate.status || "New"}
                              onChange={(e) =>
                                updateCandidateStatus(
                                  candidate.id,
                                  e.target.value,
                                )
                              }
                              style={styles.statusSelect}
                            >
                              <option value="New">New 🟢</option>
                              <option value="Interview">Interview 🤝</option>
                              <option value="Technical Test">
                                Technical 💻
                              </option>
                              <option value="Offer">Offer ✨</option>
                              <option value="Hired">Hired 🏆</option>
                              <option value="Rejected">Rejected 🔴</option>
                            </select>
                          </div>
                          {candidate.ai_score && (
                            <div style={styles.aiBadge}>
                              <strong>AI Score:</strong> {candidate.ai_score}
                            </div>
                          )}
                          <button
                            onClick={() =>
                              analyzeCandidate(
                                candidate.id,
                                candidate.experience,
                              )
                            }
                            style={styles.aiButton}
                          >
                            {candidate.ai_score ? "Re-analyze" : "AI Scan ✨"}
                          </button>
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

// --- STYLES ---
const styles = {
  container: {
    minHeight: "100vh",
    background: "#f8fafc",
    padding: "40px 4rem",
    fontFamily: "'Inter', sans-serif",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    maxWidth: "1600px",
    margin: "0 auto 40px",
  },
  title: { margin: 0, fontWeight: 800, fontSize: "36px", color: "#0f172a" },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))",
    gap: "32px",
    maxWidth: "1600px",
    margin: "0 auto",
  },
  card: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: "16px",
    padding: "32px",
    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
  },

  // Nya layout-styles
  cardHeaderTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "10px",
  },
  titleGroup: { display: "flex", flexDirection: "column", gap: "4px" },
  jobTitleText: { fontSize: "22px", fontWeight: "700", color: "#1e293b" },
  companyName: { color: "#64748b", fontSize: "16px" },
  badgeGroup: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginTop: "12px",
  },

  badge: {
    background: "#f1f5f9",
    color: "#475569",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
    padding: "4px 12px",
  },
  statusTag: {
    display: "inline-block",
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: "600",
  },
  archiveButton: {
    background: "none",
    border: "none",
    color: "#ef4444",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    opacity: 0.7,
    transition: "opacity 0.2s",
    boxShadow: "0 3px 7px rgba(34, 16, 107, 0.16)",
    borderRadius: "0.2rem",
  },

  buttonAction: {
    width: "100%",
    marginTop: "24px",
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "10px",
    padding: "12px",
    fontWeight: "600",
    fontSize: "14px",
    color: "#475569",
    cursor: "pointer",
    boxShadow: "0 3px 7px rgba(34, 16, 107, 0.55)",
    display: "flex",
    alignItems: "center",
    justifyCenter: "center",
    gap: "8px",
  },
  candidateSection: {
    marginTop: "20px",
    padding: "16px",
    background: "#f8fafc",
    borderRadius: "12px",
  },
  list: { listStyle: "none", padding: 0 },
  listItem: {
    padding: "20px 0",
    borderBottom: "1px solid #e2e8f0",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  candidateHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: "5px",
  },
  candidateName: {
    fontSize: "17px",
    fontWeight: "700",
    color: "#0f172a",
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },
  emailLink: {
    color: "#3b82f6",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: "500",
  },
  statusSelect: {
    padding: "6px 10px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    fontSize: "13px",
    fontWeight: "600",
    background: "#fff",
    cursor: "pointer",
  },
  aiBadge: {
    background: "#ecfdf5",
    borderLeft: "4px solid #10b981",
    padding: "12px",
    borderRadius: "8px",
    color: "#065f46",
    fontSize: "14px",
  },
  aiButton: {
    alignSelf: "flex-start",
    padding: "8px 16px",
    background: "linear-gradient(135deg, #6366f1, #a855f7)",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontWeight: "600",
    cursor: "pointer",
    boxShadow: "0 3px 7px rgba(34, 16, 107, 0.55)",
  },
  bulkAiButton: {
    width: "100%",
    marginBottom: "20px",
    padding: "12px",
    background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontWeight: "700",
    cursor: "pointer",
    boxShadow: "0 3px 7px rgba(34, 16, 107, 0.55)",
  },
  form: {
    display: "flex",
    gap: "12px",
    background: "#fff",
    padding: "16px",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
  },
  input: {
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    width: "180px",
  },
  buttonPrimary: {
    padding: "10px 20px",
    background: "#0f172a",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontWeight: "600",
    cursor: "pointer",
    boxShadow: "0 3px 7px rgba(34, 16, 107, 0.55)",
  },
  buttonSecondary: {
    padding: "10px 20px",
    background: "#ef4444",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    boxShadow: "0 3px 7px rgba(34, 16, 107, 0.55)",
  },
  loading: {
    fontSize: "18px",
    color: "#64748b",
    textAlign: "center",
    marginTop: "50px",
  },
  noData: { color: "#94a3b8", fontStyle: "italic" },
};

export default Dashboard;
