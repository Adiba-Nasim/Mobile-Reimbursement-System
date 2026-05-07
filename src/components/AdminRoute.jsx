import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

export default function AdminRoute({ children }) {
  const [isAdmin, setIsAdmin] = useState(null)

  useEffect(() => {
    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return setIsAdmin(false)

      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      console.log('AdminRoute data:', data)
      console.log('AdminRoute error:', error)

      setIsAdmin(data?.role === 'admin')
    }
    check()
  }, [])

  //  check isAdmin state, not role 
  if (isAdmin === null) return <div>Loading...</div>   // still checking
  if (!isAdmin) return <Navigate to="/my-requests" replace />  // not admin

  return children  // is admin, show the page
}