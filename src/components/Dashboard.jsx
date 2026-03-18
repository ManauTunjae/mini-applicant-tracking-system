import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

const Dashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      const { data, error } = await supabase.from("jobs").select("*");
      if (error) {
        console.error("Error fetching jobs:", error.message);
        setJobs([]);
      } else {
        setJobs(data);
      }
      setLoading(false);
    };

    fetchJobs();
  }, []);

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
