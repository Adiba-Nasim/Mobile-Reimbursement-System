import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

const DEPARTMENTS = ["IT", "Finance", "HR", "Security", "Management"]

export default function Signup() {
  const navigate = useNavigate()
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [empNoTaken, setEmpNoTaken] = useState(false)
  const [f, setF] = useState({
    name: '', phone: '', email: '', empNo: '',
    dept: DEPARTMENTS[0], password: ''
  })

  const set = (k, v) => setF(p => ({ ...p, [k]: v }))

  const checkEmpNo = async (value) => {
    set('empNo', value)
    setEmpNoTaken(false)
    if (value.trim().length < 2) return

    const { data } = await supabase
      .from('profiles')
      .select('emp_no')
      .eq('emp_no', value.trim())
      .single()

    setEmpNoTaken(!!data)
  }

  const handle = async () => {
    if (!f.name || !f.phone || !f.email || !f.empNo || !f.password)
      return setError('Please fill all required fields')
    if (f.name.trim().length < 3)
      return setError('Name must be at least 3 characters')
    if (!/^\d{10}$/.test(f.phone))
      return setError('Phone number must be exactly 10 digits')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email))
      return setError('Please enter a valid email address')
    if (f.password.length < 6)
      return setError('Password must be at least 6 characters')
    if (empNoTaken)
      return setError('This Employee ID is already registered. Please use a different one or login.')

    setLoading(true)
    setError('')

    const { data: existingPhone } = await supabase
      .from('profiles')
      .select('phone')
      .eq('phone', f.phone)
      .single()

    if (existingPhone) {
      setError('This phone number is already registered. Please login instead.')
      setLoading(false)
      return
    }

    const { data: existingEmail } = await supabase
      .from('profiles')
      .select('email')
      .eq('email', f.email)
      .single()

    if (existingEmail) {
      setError('This email is already registered. Please login instead.')
      setLoading(false)
      return
    }

    const { data: existingEmp } = await supabase
      .from('profiles')
      .select('emp_no')
      .eq('emp_no', f.empNo.trim())
      .single()

    if (existingEmp) {
      setError('This Employee ID is already registered. If this is your ID, please login instead.')
      setLoading(false)
      return
    }

    const { data, error: authError } = await supabase.auth.signUp({
      email: f.email,
      password: f.password,
      options: { data: { name: f.name } }
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    const { error: profileError } = await supabase.from('profiles').insert({
      id:     data.user.id,
      phone:  f.phone,
      name:   f.name,
      emp_no: f.empNo.trim(),
      dept:   f.dept,
      email:  f.email,
    })

    if (profileError) {
      setError(profileError.message)
      setLoading(false)
      return
    }

    navigate('/form')  // ✅ fixed
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <h1 className="auth-title">Create Account</h1>
        <p className="auth-sub">Register to MRPS</p>
        <div className="auth-divider" />

        {error && (
          <div style={{ background: '#ef444420', border: '1px solid #ef444440', borderRadius: 8, padding: '10px 14px', color: '#ef4444', fontSize: 13, marginBottom: 16 }}>
            {error}
          </div>
        )}

        <div className="field">
          <label>Full Name *</label>
          <input
            placeholder="Jiwan Prakash Rao"
            value={f.name}
            onChange={e => set('name', e.target.value)}
            style={{ borderColor: f.name && f.name.trim().length < 3 ? 'var(--red)' : '' }}
          />
          {f.name && f.name.trim().length < 3 && (
            <div style={{ color: 'var(--red)', fontSize: 11, marginTop: 4 }}>Name must be at least 3 characters</div>
          )}
        </div>

        <div className="field">
          <label>Phone Number *</label>
          <input
            type="tel"
            placeholder="10-digit number"
            value={f.phone}
            maxLength={10}
            onChange={e => set('phone', e.target.value.replace(/\D/g, ''))}
            style={{ borderColor: f.phone && f.phone.length !== 10 ? 'var(--red)' : '' }}
          />
          {f.phone && f.phone.length !== 10 && (
            <div style={{ color: 'var(--red)', fontSize: 11, marginTop: 4 }}>
              {10 - f.phone.length} more digit{10 - f.phone.length !== 1 ? 's' : ''} required
            </div>
          )}
          {f.phone && f.phone.length === 10 && (
            <div style={{ color: 'var(--green)', fontSize: 11, marginTop: 4 }}>✓ Valid</div>
          )}
        </div>

        <div className="field">
          <label>Email *</label>
          <input
            type="email"
            placeholder="you@email.com"
            value={f.email}
            onChange={e => set('email', e.target.value)}
            style={{ borderColor: f.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email) ? 'var(--red)' : '' }}
          />
          {f.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email) && (
            <div style={{ color: 'var(--red)', fontSize: 11, marginTop: 4 }}>Enter a valid email address</div>
          )}
          {f.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email) && (
            <div style={{ color: 'var(--green)', fontSize: 11, marginTop: 4 }}>✓ Valid</div>
          )}
        </div>

        <div className="field">
          <label>Employee ID *</label>
          <input
            placeholder="150266"
            value={f.empNo}
            onChange={e => checkEmpNo(e.target.value)}
            style={{
              borderColor: f.empNo && (f.empNo.trim().length < 2 || empNoTaken) ? 'var(--red)' : f.empNo && !empNoTaken ? 'var(--green)' : ''
            }}
          />
          {f.empNo && f.empNo.trim().length < 2 && (
            <div style={{ color: 'var(--red)', fontSize: 11, marginTop: 4 }}>Enter a valid Employee ID</div>
          )}
          {f.empNo && f.empNo.trim().length >= 2 && empNoTaken && (
            <div style={{ color: 'var(--red)', fontSize: 11, marginTop: 4 }}>✕ This Employee ID is already registered</div>
          )}
          {f.empNo && f.empNo.trim().length >= 2 && !empNoTaken && (
            <div style={{ color: 'var(--green)', fontSize: 11, marginTop: 4 }}>✓ Available</div>
          )}
        </div>

        <div className="field">
          <label>Department</label>
          <select value={f.dept} onChange={e => set('dept', e.target.value)}>
            {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
          </select>
        </div>

        <div className="field">
          <label>Password * (min 6 characters)</label>
          <input
            type="password"
            placeholder="••••••••"
            value={f.password}
            onChange={e => set('password', e.target.value)}
            style={{ borderColor: f.password && f.password.length < 6 ? 'var(--red)' : '' }}
          />
          {f.password && f.password.length < 6 && (
            <div style={{ color: 'var(--red)', fontSize: 11, marginTop: 4 }}>
              {6 - f.password.length} more character{6 - f.password.length !== 1 ? 's' : ''} required
            </div>
          )}
          {f.password && f.password.length >= 6 && (
            <div style={{ color: 'var(--green)', fontSize: 11, marginTop: 4 }}>✓ Strong enough</div>
          )}
        </div>

        <button className="btn-primary" onClick={handle} disabled={loading || empNoTaken}>
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>

        <p className="auth-link">Already have an account? <span onClick={() => navigate('/login')}>Login</span></p>
      </div>
    </div>
  )
}