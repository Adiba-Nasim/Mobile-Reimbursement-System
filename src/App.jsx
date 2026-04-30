import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'

import Login from './pages/Login'
import Signup from './pages/Signup'
import RequestForm from './pages/RequestForm'
import AllRequests from './pages/AllRequests'
import MyRequests from './pages/MyRequests'
import Navbar from './components/Navbar'

export default function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) return <div className="loading">Loading...</div>

  return (
    <BrowserRouter>
      {session && <Navbar session={session} />}
      <Routes>
        <Route path="/login"       element={!session ? <Login />                         : <Navigate to="/form" />} />
        <Route path="/signup"      element={!session ? <Signup />                        : <Navigate to="/form" />} />
        <Route path="/requests"    element={session  ? <AllRequests session={session} /> : <Navigate to="/login" />} />
        <Route path="/my-requests" element={session  ? <MyRequests session={session} />  : <Navigate to="/login" />} />
        <Route path="/form"        element={session  ? <RequestForm session={session} /> : <Navigate to="/login" />} />
        <Route path="*"            element={<Navigate to={session ? "/form" : "/login"} />} />
      </Routes>
    </BrowserRouter>
  )
}