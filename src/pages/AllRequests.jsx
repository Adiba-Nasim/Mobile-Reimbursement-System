import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import RequestRow from '../components/RequestRow'
import StatusBadge from '../components/StatusBadge'

export default function AllRequests() {
  const [requests, setRequests]     = useState([])
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState('')
  const [searchMode, setSearchMode] = useState('emp_no')
  const [expandedId, setExpandedId] = useState(null)
  const [userRole, setUserRole]     = useState('employee')

  useEffect(() => {
    fetchRoleAndRequests()
  }, [])

  const fetchRoleAndRequests = async () => {
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      const { data: profile, error: roleError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      console.log('user id:', user.id)
      console.log('profile:', profile)
      console.log('role error:', roleError)

      if (profile?.role) setUserRole(profile.role)
    }

    const { data } = await supabase
      .from('requests')
      .select('*')
      .order('submitted_at', { ascending: false })

    setRequests(data || [])
    setLoading(false)
  }

  const handleStatusChange = (requestId, newStatus) => {
    setRequests(prev =>
      prev.map(r => r.id === requestId ? { ...r, status: newStatus } : r)
    )
  }

  const filtered = requests.filter(r => {
    if (search === '') return true
    if (searchMode === 'emp_no')    return String(r.emp_no ?? '').toLowerCase() === search.toLowerCase()
    if (searchMode === 'mobile_no') return r.mobile_no?.includes(search)
    return true
  })

  return (
    <div className="page-wrap">
      <div className="page-header">
        <h2 className="page-title">All Requests</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border)' }}>
            {[['emp_no', 'Emp ID'], ['mobile_no', 'Phone']].map(([mode, label]) => (
              <button
                key={mode}
                onClick={() => { setSearchMode(mode); setSearch('') }}
                style={{
                  padding: '6px 14px',
                  fontSize: 12,
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  background: searchMode === mode ? 'var(--accent)' : 'var(--surface)',
                  color: searchMode === mode ? '#fff' : 'var(--muted)',
                  transition: 'all 0.15s',
                }}
              >{label}</button>
            ))}
          </div>
          <div className="search-box">
            <span></span>
            <input
              placeholder={searchMode === 'emp_no' ? 'Search by Employee ID...' : 'Search by phone number...'}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: 14 }}
              >✕</button>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--muted)' }}>Loading requests...</div>
      ) : (
        <>
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
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: 40, color: 'var(--muted)' }}>
                      No records found
                    </td>
                  </tr>
                )}
                {filtered.map(r => (
                  <RequestRow
                    key={r.id}
                    request={r}
                    isExpanded={expandedId === r.id}
                    onToggle={() => setExpandedId(expandedId === r.id ? null : r.id)}
                    userRole={userRole}
                    onStatusChange={handleStatusChange}
                  />
                ))}
              </tbody>
            </table>
          </div>

          <div className="mobile-cards">
            {filtered.length === 0 && (
              <div style={{ textAlign: 'center', padding: 40, color: 'var(--muted)' }}>No records found</div>
            )}
            {filtered.map(r => (
              <MobileCard
                key={r.id}
                r={r}
                isExpanded={expandedId === r.id}
                onToggle={() => setExpandedId(expandedId === r.id ? null : r.id)}
                userRole={userRole}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function MobileCard({ r, isExpanded, onToggle, userRole, onStatusChange }) {
  const [status, setStatus] = useState(r.status)
  const [saving, setSaving] = useState(false)

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value
    setSaving(true)
    const { error } = await supabase
      .from('requests')
      .update({ status: newStatus })
      .eq('id', r.id)

    if (!error) {
      setStatus(newStatus)
      onStatusChange && onStatusChange(r.id, newStatus)
    }
    setSaving(false)
  }

  return (
    <div className="mobile-card" onClick={onToggle}>
      <div className="mobile-card-header">
        <span className="req-no">{r.emp_no}</span>
        {userRole === 'admin' ? (
          <select
            value={status}
            onChange={handleStatusChange}
            disabled={saving}
            onClick={e => e.stopPropagation()}
            style={{
              padding: '3px 8px',
              borderRadius: 20,
              fontSize: 11,
              fontWeight: 600,
              border: '1px solid var(--border)',
              background: 'var(--surface)',
              color: 'var(--text)',
              cursor: 'pointer',
              opacity: saving ? 0.6 : 1,
            }}
          >
            {['Pending', 'Withheld', 'With Account', 'Request Closed'].map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        ) : (
          <StatusBadge status={status} />
        )}
      </div>
      <div className="mobile-card-name">{r.emp_name}</div>
      <div className="mobile-card-meta">{r.dept} · {r.mobile_set_name}</div>
      <div className="mobile-card-cost">₹{Number(r.cost).toLocaleString()}</div>
      {isExpanded && (
        <div style={{ marginTop: 14, borderTop: '1px solid var(--border)', paddingTop: 14 }}>
          <DetailItem label="Model"         value={r.model} />
          <DetailItem label="Serial No."    value={r.serial_no} />
          <DetailItem label="Mobile No."    value={r.mobile_no} />
          <DetailItem label="Agency"        value={r.agency} />
          <DetailItem label="Place"         value={r.place} />
          <DetailItem label="Purchase Date" value={r.mobile_purchase_date} />
          {r.attachment_name && (
            r.attachment_url ? (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: 13 }}>
                <span style={{ color: 'var(--muted)' }}>Attachment</span>
                <a
                  href={r.attachment_url}
                  target="_blank"
                  rel="noreferrer"
                  onClick={e => e.stopPropagation()}
                  style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'underline' }}
                >
                  {r.attachment_name}
                </a>
              </div>
            ) : (
              <DetailItem label="Attachment" value={r.attachment_name} />
            )
          )}
        </div>
      )}
    </div>
  )
}

function DetailItem({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: 13 }}>
      <span style={{ color: 'var(--muted)' }}>{label}</span>
      <span style={{ fontWeight: 600 }}>{value || '—'}</span>
    </div>
  )
}