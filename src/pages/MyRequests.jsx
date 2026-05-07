import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import RequestRow from '../components/RequestRow'
import StatusBadge from '../components/StatusBadge'

export default function MyRequests({ session }) {
  const [requests, setRequests]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [expandedId, setExpandedId] = useState(null)

  useEffect(() => {
    const fetchMyRequests = async () => {
      setLoading(true)
      const { data } = await supabase
        .from('requests')
        .select('*')
        .eq('user_id', session.user.id)
        .order('submitted_at', { ascending: false })
      setRequests(data || [])
      setLoading(false)
    }
    fetchMyRequests()
  }, [session])

  return (
    <div className="page-wrap">
      <div className="page-header">
        <h2 className="page-title">My Requests</h2>
        <div style={{ fontSize: 13, color: 'var(--muted)' }}>
          {requests.length} submission{requests.length !== 1 ? 's' : ''}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--muted)' }}>
          Loading your requests...
        </div>
      ) : requests.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 80, color: 'var(--muted)' }}>
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>
            No requests yet
          </div>
          <div style={{ fontSize: 13 }}>Submit your first request</div>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Employee ID</th>
                  <th>Employee Name</th>
                  <th>Department</th>
                  <th>Mobile Set Name</th>
                  <th>Model</th>
                  <th>Cost (₹)</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {requests.map(r => (
                  <RequestRow
                    key={r.id}
                    request={r}
                    isExpanded={expandedId === r.id}
                    onToggle={() => setExpandedId(expandedId === r.id ? null : r.id)}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="mobile-cards">
            {requests.map(r => (
              <MobileCard
                key={r.id}
                r={r}
                isExpanded={expandedId === r.id}
                onToggle={() => setExpandedId(expandedId === r.id ? null : r.id)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function MobileCard({ r, isExpanded, onToggle }) {
  return (
    <div className="mobile-card" onClick={onToggle}>
      {/* Card Header */}
      <div className="mobile-card-header">
        <span className="req-no">{r.id}</span>
        <StatusBadge status={r.status} />
      </div>
      
      <div className="mobile-card-name">{r.emp_name}</div>
      <div className="mobile-card-meta">{r.dept} · {r.mobile_set_name}</div>
      <div className="mobile-card-cost">₹{Number(r.cost).toLocaleString()}</div>
      
      {/* Expanded Details */}
      {isExpanded && (
        <div style={{ marginTop: 14 }}>
          
          {/* SECTION 1: Employee Details */}
          <div style={{ 
            borderTop: '1px solid var(--border)', 
            paddingTop: 14,
            marginBottom: 14 
          }}>
            <div style={{ 
              fontSize: 11, 
              fontWeight: 700, 
              color: 'var(--accent)', 
              marginBottom: 10,
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Employee Details
            </div>
            {[
              ['Employee No', r.emp_no],
              ['Full Name', r.emp_name],
              ['Designation', r.designation],
              ['Level', r.level],
              ['Department', r.dept],
              ['Cost Centre', r.cost_centre],
              ['Employee Type', r.emp_type],
            ].map(([label, value]) => (
              <div 
                key={label} 
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  padding: '5px 0', 
                  fontSize: 13 
                }}
              >
                <span style={{ color: 'var(--muted)' }}>{label}</span>
                <span style={{ fontWeight: 600 }}>{value || '—'}</span>
              </div>
            ))}
          </div>

          {/* SECTION 2: Mobile Set Details */}
          <div style={{ 
            borderTop: '1px solid var(--border)', 
            paddingTop: 14 
          }}>
            <div style={{ 
              fontSize: 11, 
              fontWeight: 700, 
              color: 'var(--accent)', 
              marginBottom: 10,
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Particulars of New Mobile Set
            </div>
            {[
              ['Mobile Set Name', r.mobile_set_name],
              ['Model', r.model],
              ['Serial No.', r.serial_no],
              ['Place', r.place],
              ['Cost (₹)', r.cost ? `₹${Number(r.cost).toLocaleString()}` : '—'],
              ['Mobile No.', r.mobile_no],
              ['Agency', r.agency],
              ['Purchase Date', r.mobile_purchase_date],
              ['Last Reim. Date', r.last_reim_date],
            ].map(([label, value]) => (
              <div 
                key={label} 
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  padding: '5px 0', 
                  fontSize: 13 
                }}
              >
                <span style={{ color: 'var(--muted)' }}>{label}</span>
                <span style={{ fontWeight: 600 }}>{value || '—'}</span>
              </div>
            ))}
          </div>

        </div>
      )}
    </div>
  )
}