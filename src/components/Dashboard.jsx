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

  const analyzeCandidate = async (candidateId, experience) => {
    // Anropa till en AI-tjänst senare men för demon simulerar vi en analys:
    const mockAiScores = [
      "Match: 85% - Strong technical background.",
      "Match: 40% - Lacks required leadership experience.",
      "Match: 95% - Perfect fit for this senior role!",
    ];
    const ramdomScore =
      mockAiScores[Math.floor(Math.random() * mockAiScores.length)];

    const { error } = await supabase
      .from("candidates")
      .update({ ai_score: ramdomScore })
      .eq("id", candidateId);

    if (!error) {
      fetchData();
    }
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
                          {/* Övre raden med namn och mejl */}
                          <div style={styles.candidateHeader}>
                            <span style={{ fontWeight: 600, color: "#1e293b" }}>
                              {candidate.name}
                            </span>
                            <a
                              href={`mailto:${candidate.email}`}
                              style={styles.emailLink}
                            >
                              {candidate.email}
                            </a>
                          </div>

                          {/* AI-analys rutan (visas bara om den finns) */}
                          {candidate.ai_score && (
                            <div style={styles.aiBadge}>
                              <strong>🤖 AI Analysis:</strong>{" "}
                              {candidate.ai_score}
                            </div>
                          )}

                          {/* AI-Knappen */}
                          <button
                            onClick={() =>
                              analyzeCandidate(
                                candidate.id,
                                candidate.experience,
                              )
                            }
                            style={styles.aiButton}
                          >
                            {candidate.ai_score
                              ? "Refresh Analysis"
                              : "Analyze with AI ✨"}
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

// --- STYLES OBJECT ---
// KOMMENTAR: Jag flyttade ut stylingen för att göra huvudkoden renare och mer lättläst för Jonas.
const styles = {
  container: {
    minHeight: "100vh",
    background: "#f8fafc", // Något ljusare och fräschare grå/blå
    padding: "20px 10px",
    fontFamily: "'Inter', 'Segoe UI', sans-serif", // 'Inter' ger en modernare tech-känsla
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    maxWidth: "1200px",
    margin: "0 auto 20px auto",
  },
  title: { margin: 0, fontWeight: 800, fontSize: "36px", color: "#0f172a" },

  // Grid-layout: Vi ändrar min-width till 380px för att få max 3 i bredd på stora skärmar
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "32px",
    maxWidth: "1200px",
    margin: "0 auto",
  },

  card: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    boxShadow:
      "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    borderRadius: "16px",
    padding: "32px",
    transition: "transform 0.2s ease",
  },

  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "8px",
  },
  jobTitle: {
    fontSize: "22px",
    fontWeight: "700",
    color: "#1e293b",
    margin: 0,
  },
  companyName: {
    color: "#64748b",
    fontSize: "16px",
    fontWeight: "500",
    marginBottom: "20px",
  },

  badge: {
    background: "#f1f5f9",
    color: "#475569",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
    padding: "4px 12px",
    border: "1px solid #e2e8f0",
  },

  buttonAction: {
    width: "100%",
    marginTop: "16px",
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    padding: "10px",
    cursor: "pointer",
    color: "#475569",
    transition: "all 0.2s",
  },

  candidateSection: {
    marginTop: "20px",
    padding: "16px",
    background: "#f8fafc",
    borderRadius: "12px",
    border: "1px solid #f1f5f9",
  },

  list: { listStyle: "none", padding: 0, margin: 0 },

  listItem: {
    padding: "20px 0",
    borderBottom: "1px solid #e2e8f0",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  // Sista objektet i listan ska inte ha någon border
  lastListItem: { borderBottom: "none" },

  candidateHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  candidateName: {
    fontSize: "17px", // Större namn för tydlighet
    fontWeight: "700",
    color: "#0f172a",
  },
  emailLink: {
    color: "#3b82f6",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: "500",
  },

  aiBadge: {
    background: "#ecfdf5",
    borderLeft: "4px solid #10b981",
    padding: "12px 16px",
    borderRadius: "8px",
    fontSize: "14px",
    color: "#065f46",
    marginTop: "4px",
    lineHeight: "1.6",
    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
  },

  aiButton: {
    alignSelf: "flex-start",
    padding: "8px 16px",
    background: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "600",
    boxShadow: "0 4px 12px rgba(168, 85, 247, 0.25)",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },

  // Form styles för att lägga till nya jobb
  form: {
    display: "flex",
    gap: "12px",
    background: "#fff",
    padding: "16px",
    borderRadius: "12px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    border: "1px solid #e2e8f0",
  },
  input: {
    padding: "10px 16px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    fontSize: "15px",
    outline: "none",
    width: "200px",
  },
  buttonPrimary: {
    padding: "10px 24px",
    backgroundColor: "#0f172a",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontWeight: "600",
    cursor: "pointer",
  },
};

export default Dashboard;
