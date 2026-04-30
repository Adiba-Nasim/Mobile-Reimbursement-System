const STATUS_COLORS = {
  'Pending':        '#1a56db',
  'With HOD':       '#b45309',
  'With Account':   '#1a7f4b',
  'Request Closed': '#4a6fa5',
}

export default function StatusBadge({ status }) {
  const color = STATUS_COLORS[status] || '#1a56db'
  return (
    <span style={{
      padding: '3px 10px',
      borderRadius: 2,
      fontSize: 11,
      fontWeight: 600,
      background: color + '18',
      color: color,
      border: `1px solid ${color}44`,
      whiteSpace: 'nowrap',
    }}>
      {status}
    </span>
  )
}