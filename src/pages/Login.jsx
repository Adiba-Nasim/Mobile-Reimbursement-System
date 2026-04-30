import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

export default function Login() {
  const [email, setEmail]   = useState('')
  const [pass, setPass]     = useState('')
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handle = async () => {
    if (!email || !pass) return setError('Please fill all fields')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError('Enter a valid email address')

    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({ email, password: pass })

    if (error) {
      setError('Invalid email or password')
      setLoading(false)
    } else {
      navigate('/form')
    }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <h1 className="auth-title">TATA UISL</h1>
        <p className="auth-sub">Mobile Reimbursement Process System</p>
        <div className="auth-divider" />

        {error && <div style={{ background: '#ef444420', border: '1px solid #ef444440', borderRadius: 2, padding: '10px 14px', color: '#ef4444', fontSize: 13, marginBottom: 16 }}>{error}</div>}

        <div className="field">
          <label>Email</label>
          <input
            type="email"
            placeholder="you@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handle()}
            style={{ borderColor: email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? 'var(--red)' : '' }}
          />
          {email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && (
            <div style={{ color: 'var(--red)', fontSize: 11, marginTop: 4 }}>Enter a valid email address</div>
          )}
        </div>

        <div className="field">
          <label>Password</label>
          <input
            type="password"
            placeholder="••••••"
            value={pass}
            onChange={e => setPass(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handle()}
          />
        </div>

        <button className="btn-primary" onClick={handle} disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>

        <p className="auth-link">Don't have an account? <span onClick={() => navigate('/signup')}>Sign Up</span></p>
      </div>
    </div>
  )
}