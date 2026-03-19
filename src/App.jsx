import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import ApplyJob from "./components/ApplyJob";

function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/apply/:jobId" element={<ApplyJob />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
