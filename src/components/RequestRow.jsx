import { useState } from 'react'
import { supabase } from '../supabaseClient'
import StatusBadge from './StatusBadge'

const STATUS_OPTIONS = ['Pending', 'Withheld', 'With Account', 'Request Closed']

export default function RequestRow({ request, isExpanded, onToggle, userRole, onStatusChange }) {
  const r = request

  return (
    <>
      <tr onClick={onToggle}>
        <td><span className="req-no">{r.emp_no}</span></td>
        <td style={{ color: 'var(--text)', fontWeight: 500 }}>{r.emp_name}</td>
        <td>{r.dept}</td>
        <td>{r.mobile_set_name}</td>
        <td>{r.model}</td>
        <td style={{ fontWeight: 600, color: 'var(--text)' }}>₹{Number(r.cost).toLocaleString()}</td>
        <td onClick={e => e.stopPropagation()}>
          {userRole === 'admin'
            ? <StatusSelect requestId={r.id} currentStatus={r.status} onStatusChange={onStatusChange} />
            : <StatusBadge status={r.status} />
          }
        </td>
        <td style={{ color: 'var(--muted)', fontSize: 12 }}>{r.submitted_at?.split('T')[0]}</td>
      </tr>

      {isExpanded && (
        <tr>
          <td colSpan={8} style={{ padding: 0 }}>
            <ExpandedRecord r={r} onClose={onToggle} userRole={userRole} onStatusChange={onStatusChange} />
          </td>
        </tr>
      )}
    </>
  )
}

function StatusSelect({ requestId, currentStatus, onStatusChange }) {
  const [status, setStatus] = useState(currentStatus)
  const [saving, setSaving] = useState(false)

  const handleChange = async (e) => {
    const newStatus = e.target.value
    setSaving(true)
    const { error } = await supabase
      .from('requests')
      .update({ status: newStatus })
      .eq('id', requestId)

    if (!error) {
      setStatus(newStatus)
      onStatusChange && onStatusChange(requestId, newStatus)
    }
    setSaving(false)
  }

  return (
    <select
      value={status}
      onChange={handleChange}
      disabled={saving}
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
      {STATUS_OPTIONS.map(s => (
        <option key={s} value={s}>{s}</option>
      ))}
    </select>
  )
}

function FieldDisplay({ label, value }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span style={{
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: '0.07em',
        textTransform: 'uppercase',
        color: 'var(--muted)',
      }}>
        {label}
      </span>
      <div style={{
        padding: '8px 12px',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 8,
        fontSize: 14,
        color: value ? 'var(--text)' : 'var(--muted)',
        minHeight: 38,
        display: 'flex',
        alignItems: 'center',
      }}>
        {value || <span style={{ fontStyle: 'italic', opacity: 0.5 }}>—</span>}
      </div>
    </div>
  )
}

function SectionHeader({ children }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      marginBottom: '0.9rem',
    }}>
      <div style={{
        width: 4,
        height: 18,
        borderRadius: 2,
        background: 'var(--accent)',
        flexShrink: 0,
      }} />
      <span style={{
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: '0.09em',
        textTransform: 'uppercase',
        color: 'var(--accent)',
      }}>
        {children}
      </span>
    </div>
  )
}

function ExpandedRecord({ r, onClose, userRole, onStatusChange }) {
  return (
    <div className="expanded-card">

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text)' }}>
            Request Details — Emp ID: {r.emp_no}
          </div>
          <div style={{ color: 'var(--muted)', fontSize: 12, marginTop: 2 }}>
            TATA UISL
          </div>
        </div>
        <button
          onClick={e => { e.stopPropagation(); onClose() }}
          style={{
            background: 'none',
            border: '1px solid var(--border)',
            color: 'var(--muted)',
            borderRadius: 6,
            padding: '4px 10px',
            fontSize: 14,
            cursor: 'pointer',
          }}
        >✕</button>
      </div>

      {/* Employee Details */}
      <div style={{ marginBottom: 24 }}>
        <SectionHeader>Employee Details</SectionHeader>
        <div style={{
          background: 'var(--bg)',
          border: '1px solid var(--border)',
          borderRadius: 10,
          padding: '1rem 1.25rem',
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            <FieldDisplay label="Employee No"   value={r.emp_no} />
            <FieldDisplay label="Full Name"     value={r.emp_name} />
            <FieldDisplay label="Designation"   value={r.designation} />
            <FieldDisplay label="Level"         value={r.level} />
            <FieldDisplay label="Department"    value={r.dept} />
            <FieldDisplay label="Cost Centre"   value={r.cost_centre} />
            <FieldDisplay label="Employee Type" value={r.emp_type} />
          </div>
        </div>
      </div>

      {/* Mobile Set Particulars */}
      <div style={{ marginBottom: 24 }}>
        <SectionHeader>Particulars of New Mobile Set</SectionHeader>
        <div style={{
          background: 'var(--bg)',
          border: '1px solid var(--border)',
          borderRadius: 10,
          padding: '1rem 1.25rem',
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            <FieldDisplay label="Mobile Set Name"         value={r.mobile_set_name} />
            <FieldDisplay label="Model"                   value={r.model} />
            <FieldDisplay label="Serial No."              value={r.serial_no} />
            <FieldDisplay label="Place"                   value={r.place} />
            <FieldDisplay label="Cost (₹)"                value={r.cost ? `₹${Number(r.cost).toLocaleString()}` : null} />
            <FieldDisplay label="Mobile No."              value={r.mobile_no} />
            <FieldDisplay label="Brought from Agency"     value={r.agency} />
            <FieldDisplay label="Last Reimbursement Date" value={r.last_reim_date} />
            <FieldDisplay label="Mobile Purchase Date"    value={r.mobile_purchase_date} />
          </div>
        </div>
      </div>

      {/* Attachment */}
      {r.attachment_name && (
        <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 16 }}>
          {' '}
          {r.attachment_url ? (
            <a
              href={r.attachment_url}
              target="_blank"
              rel="noreferrer"
              onClick={e => e.stopPropagation()}
              style={{ color: 'var(--accent)', marginLeft: 6, textDecoration: 'underline', cursor: 'pointer' }}
            >
              {r.attachment_name}
            </a>
          ) : (
            <span style={{ color: 'var(--accent)', marginLeft: 6 }}>{r.attachment_name}</span>
          )}
        </div>
      )}

      {/* Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ color: 'var(--muted)', fontSize: 13 }}>Current Status:</span>
        {userRole === 'admin'
          ? <StatusSelect requestId={r.id} currentStatus={r.status} onStatusChange={onStatusChange} />
          : <StatusBadge status={r.status} />
        }
      </div>

    </div>
  )
}