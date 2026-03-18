import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient.js";

const Dashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [adding, setAdding] = useState(false);
  const navigate = useNavigate();

  // 1. Skapa en funktion som vi kan återanvända
  const fetchJobs = useCallback(async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) return;

    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .eq("customer_id", userData.user.id) // FILTRERA: Se bara egna jobb!
      .order("created_at", { ascending: false }); // Nyast först

    if (error) {
      console.error("Error fetching jobs:", error.message);
    } else {
      setJobs(data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);
  // eslint-disable-next-line react-hooks/exhaustive-deps

  const handleAddJob = async (e) => {
    e.preventDefault();
    setAdding(true);

    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;

    if (!user) {
      alert("Session expired, please log in again.");
      navigate("/");
      return;
    }

    const { error: insertError } = await supabase.from("jobs").insert([
      {
        title: jobTitle,
        company: company,
        customer_id: user.id,
        status: "Open", // Sätt en default-status direkt
      },
    ]);

    if (insertError) {
      alert("Error: " + insertError.message);
    } else {
      setJobTitle("");
      setCompany("");
      await fetchJobs(); // 2. Anropa samma funktion igen
    }
    setAdding(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f5f6fa",
        padding: "32px",
        fontFamily: "Segoe UI, Arial, sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 32,
        }}
      >
        <h1 style={{ margin: 0, fontWeight: 700, fontSize: 32, color: "#222" }}>
          Dashboard
        </h1>
        <form
          onSubmit={handleAddJob}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            background: "#eef1f6",
            padding: "20px 24px",
            borderRadius: "10px",
            border: "1px solid #dadfe4",
            marginTop: "18px",
            marginBottom: "18px",
          }}
        >
          <input
            type="text"
            placeholder="Job Title"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            style={{
              padding: "10px 14px",
              borderRadius: "6px",
              border: "1px solid #ccd1d8",
              fontSize: "16px",
              outline: "none",
              flex: "0 0 210px",
              background: "#fff",
            }}
            required
          />
          <input
            type="text"
            placeholder="Company Name"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            style={{
              padding: "10px 14px",
              borderRadius: "6px",
              border: "1px solid #ccd1d8",
              fontSize: "16px",
              outline: "none",
              flex: "0 0 210px",
              background: "#fff",
            }}
            required
          />
          <button
            type="submit"
            style={{
              padding: "10px 28px",
              backgroundColor: "#222",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              fontWeight: 600,
              fontSize: "16px",
              cursor: "pointer",
            }}
            disabled={adding}
          >
            {adding ? "Adding..." : "Add Job"}
          </button>
        </form>
        <button
          onClick={handleLogout}
          style={{
            padding: "10px 24px",
            backgroundColor: "#222",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            fontWeight: 600,
            fontSize: 16,
          }}
        >
          Logout
        </button>
      </div>
      {loading ? (
        <div style={{ fontSize: 22, color: "#666", marginTop: 40 }}>
          Loading...
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: "28px",
          }}
        >
          {jobs.map((job) => (
            <div
              key={job.id}
              style={{
                background: "#fff",
                border: "1px solid #e2e6ea",
                boxShadow: "0 2px 6px rgba(60, 60, 70, 0.08)",
                borderRadius: 12,
                padding: "28px 24px",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                minHeight: 120,
              }}
            >
              <div style={{ fontWeight: 600, fontSize: 22, color: "#1d2128" }}>
                {job.title}
              </div>
              <div style={{ color: "#607080", fontSize: 16, fontWeight: 500 }}>
                {job.company}
              </div>
              <div
                style={{
                  alignSelf: "flex-start",
                  marginTop: 8,
                  padding: "5px 15px",
                  borderRadius: 20,
                  background: job.status === "Open" ? "#e8f7ee" : "#fcecea",
                  color: job.status === "Open" ? "#14804a" : "#d63447",
                  fontSize: 15,
                  fontWeight: 600,
                  letterSpacing: 0.2,
                  border: "1px solid #f1f1f3",
                }}
              >
                {job.status}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
