import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

export default function Navbar({ session }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()

  const logout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  const firstName = session?.user?.user_metadata?.name?.split(' ')[0] || 'User'

  return (
    <header className="navbar">
      <div className="nav-inner">

        {/* Brand */}
        <NavLink to="/requests" className="brand">
          <div>
            <div className="brand-name">MRP System</div>
            <div className="brand-sub">TATA UISL MRP SYSTEM</div>
          </div>
        </NavLink>

        {/* Desktop Nav */}
        <nav className="desktop-nav">
          <NavLink to="/requests"    className={({ isActive }) => 'nav-btn' + (isActive ? ' active' : '')}>All Requests</NavLink>
          <NavLink to="/my-requests" className={({ isActive }) => 'nav-btn' + (isActive ? ' active' : '')}>My Requests</NavLink>
          <NavLink to="/form"        className="nav-btn new-req">+ New Request</NavLink>
          <div className="user-badge">
            <span className="user-dot" />
            <span className="user-name">{firstName}</span>
            <button className="logout-btn" onClick={logout}>Logout</button>
          </div>
        </nav>

        {/* Hamburger */}
        <button className="hamburger" onClick={() => setMenuOpen(o => !o)}>
          <span className="ham-line" />
          <span className="ham-line" />
          <span className="ham-line" />
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="mobile-menu">
          <NavLink to="/requests"    className="mobile-nav-btn" onClick={() => setMenuOpen(false)}>All Requests</NavLink>
          <NavLink to="/my-requests" className="mobile-nav-btn" onClick={() => setMenuOpen(false)}>My Requests</NavLink>
          <NavLink to="/form"        className="mobile-nav-btn" style={{ color: '#2563eb', fontWeight: 700 }} onClick={() => setMenuOpen(false)}>+ New Request</NavLink>
          <button className="mobile-nav-btn" style={{ color: 'var(--red)' }} onClick={logout}>Logout</button>
          <div style={{ padding: '8px 20px', fontSize: 12, color: 'var(--muted)' }}>Logged in as {firstName}</div>
        </div>
      )}
    </header>
  )
}