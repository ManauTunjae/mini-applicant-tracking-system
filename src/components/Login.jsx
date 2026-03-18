import React, { useState } from 'react'
import { supabase } from '../supabaseClient'
import { useNavigate } from 'react-router-dom'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) alert(error.message)
    else navigate('/dashboard')
    setLoading(false)
  }

  const handleSignUp = async (e) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) alert("Kolla din mejl för bekräftelse!")
    else alert("Användare skapad! Kolla din mejl.")
    setLoading(false)
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'sans-serif' }}>
      <div style={{ width: '100%', maxWidth: '350px', padding: '30px', background: 'white', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', textAlign: 'center' }}>
        <h1 style={{ marginBottom: '20px', color: '#1f2937' }}>Mini-ATS 🚀</h1>
        <form style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input 
            type="email" placeholder="E-post" value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ padding: '12px', borderRadius: '6px', border: '1px solid #d1d5db' }}
          />
          <input 
            type="password" placeholder="Lösenord" value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ padding: '12px', borderRadius: '6px', border: '1px solid #d1d5db' }}
          />
          <button onClick={handleLogin} disabled={loading} style={{ padding: '12px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
            {loading ? 'Laddar...' : 'Logga in'}
          </button>
          <button onClick={handleSignUp} disabled={loading} style={{ background: 'none', border: 'none', color: '#4b5563', cursor: 'pointer', fontSize: '14px' }}>
            Inget konto? Registrera dig här
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login