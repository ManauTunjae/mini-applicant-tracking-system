import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Login from './components/Login'

function App() {
  return (
    <Router>
      <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', display: 'flex', flexDirection: 'column' }}>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<div style={{ padding: '40px', textAlign: 'center' }}><h1>Dashboard - Du är inloggad! 🎉</h1></div>} />
        </Routes>
      </div>
    </Router>
  )
}

export default App