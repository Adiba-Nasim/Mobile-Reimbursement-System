import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

const AGENCIES = ["National Electronics", "Samsung Store", "Apple Store", "Reliance Digital", "Croma", "Vijay Sales"]
const DEPARTMENTS = ["IT", "Finance", "HR", "Security", "Management"]

export default function RequestForm({ session }) {
  const navigate    = useNavigate()
  const [profile, setProfile]     = useState(null)
  const [loading, setLoading]     = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError]         = useState('')
  const [uploadProgress, setUploadProgress] = useState('')
  const [file, setFile]           = useState(null)

  const [emp, setEmp] = useState({
    name: '', designation: '', dept: DEPARTMENTS[0], costCentre: '', level: '', empType: ''
  })

  const [f, setF] = useState({
    mobileSetName: '', model: '', serialNo: '', place: '',
    cost: '', mobileNo: '', agency: AGENCIES[0],
    lastReimDate: '', mobilePurchaseDate: ''
  })

  const setField = (k, v) => setF(p => ({ ...p, [k]: v }))
  const setEmpField = (k, v) => setEmp(p => ({ ...p, [k]: v }))

  useEffect(() => {
    const fetchProfile = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()
      if (data) {
        setProfile(data)
        setEmp({
          name:        data.name        ?? '',
          designation: data.designation ?? '',
          dept:        data.dept        ?? DEPARTMENTS[0],
          costCentre:  data.cost_centre ?? '',
          level:       data.level       ?? '',
          empType:     data.emp_type    ?? ''
        })
        setF(p => ({ ...p, mobileNo: data.phone ?? '' }))
      }
    }
    fetchProfile()
  }, [session.user.id])

  const handleFileChange = (e) => {
    const selected = e.target.files[0]
    if (!selected) return
    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
    if (!allowed.includes(selected.type)) {
      setError('Only PDF, JPG or PNG files are allowed')
      return
    }
    if (selected.size > 5 * 1024 * 1024) {
      setError('File size must be under 5MB')
      return
    }
    setError('')
    setFile(selected)
  }

  const handle = async () => {
    if (!f.mobileSetName || !f.model || !f.serialNo || !f.cost || !f.mobileNo)
      return setError('Please fill all mandatory (*) fields')
    if (!/^\d{10}$/.test(f.mobileNo))
      return setError('Mobile number must be exactly 10 digits')
    if (isNaN(f.cost) || parseFloat(f.cost) <= 0)
      return setError('Enter a valid cost amount')

    setLoading(true)
    setError('')

    let attachmentUrl = ''
    let attachmentName = ''

    // Upload file if selected
    if (file) {
      setUploadProgress('Uploading file...')
      const fileName = `${session.user.id}/${Date.now()}_${file.name}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('attachments')
        .upload(fileName, file)

      if (uploadError) {
        setError('File upload failed: ' + uploadError.message)
        setLoading(false)
        setUploadProgress('')
        return
      }

      const { data: urlData } = supabase.storage
        .from('attachments')
        .getPublicUrl(fileName)

      attachmentUrl  = urlData.publicUrl
      attachmentName = file.name
      setUploadProgress('')
    }

    // Insert request
    const { error: insertError } = await supabase.from('requests').insert({
      user_id:              session.user.id,
      emp_no:               profile?.emp_no,
      emp_name:             emp.name,
      dept:                 emp.dept,
      mobile_set_name:      f.mobileSetName,
      model:                f.model,
      serial_no:            f.serialNo,
      place:                f.place,
      cost:                 parseFloat(f.cost),
      mobile_no:            f.mobileNo,
      agency:               f.agency,
      last_reim_date:       f.lastReimDate,
      mobile_purchase_date: f.mobilePurchaseDate,
      attachment_name:      attachmentName,
      attachment_url:       attachmentUrl,
      status:               'Pending',
    })

    setLoading(false)

    if (insertError) {
      setError(insertError.message)
    } else {
      setSubmitted(true)
    }
  }

  if (submitted) return (
    <div className="page-wrap success-wrap">
      <div className="success-card">
        <div className="success-icon">✅</div>
        <div className="success-title">Request Submitted!</div>
        <p className="success-sub">Your mobile reimbursement request has been submitted successfully.</p>
        <div className="success-btns">
          <button className="btn-primary" style={{ width: 'auto', padding: '11px 24px' }}
            onClick={() => {
              setSubmitted(false)
              setFile(null)
              setF({ mobileSetName: '', model: '', serialNo: '', place: '', cost: '', mobileNo: profile?.phone || '', agency: AGENCIES[0], lastReimDate: '', mobilePurchaseDate: '' })
            }}>
            Submit Another
          </button>
          <button className="btn-outline" onClick={() => navigate('/my-requests')}>View My Requests</button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="page-wrap">
      <div className="card" style={{ maxWidth: 860, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800 }}>MRP System</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)', marginTop: 2 }}>TATA UISL MRP SYSTEM</div>
          </div>
        </div>
        <div style={{ color: 'var(--muted)', fontSize: 12, marginBottom: 4 }}>* marks in the fields are mandatory</div>

        {error && <div style={{ background: '#ef444420', border: '1px solid #ef444440', borderRadius: 8, padding: '10px 14px', color: '#ef4444', fontSize: 13, margin: '12px 0' }}>{error}</div>}

        {/* Employee Details */}
        <div className="section-label">Employee Details</div>
        <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, padding: '4px 12px 12px', marginBottom: 8 }}>
          <div style={{ fontSize: 11, color: 'var(--muted)', margin: '8px 0 12px', fontStyle: 'italic' }}>
            You can edit the fields below if needed. Name and Department are fixed.
          </div>
          <div className="grid2">
            <ReadField label="Employee No"   value={profile?.emp_no} />
            <ReadField label="Full Name"     value={emp.name} />
            <EditField label="Designation"   value={emp.designation} onChange={v => setEmpField('designation', v)} placeholder="e.g. Manager" />
            <EditField label="Level"         value={emp.level}       onChange={v => setEmpField('level', v)} placeholder="e.g. JM9" />
            <ReadField label="Department"    value={emp.dept} />
            <EditField label="Cost Centre"   value={emp.costCentre}  onChange={v => setEmpField('costCentre', v)} placeholder="e.g. 1400" />
            <EditField label="Employee Type" value={emp.empType}     onChange={v => setEmpField('empType', v)} placeholder="e.g. Regular" />
          </div>
        </div>

        {/* Mobile Set */}
        <div className="section-label">Particulars of New Mobile Set</div>
        <div className="grid2">
          <FormField label="Mobile Set Name *" value={f.mobileSetName} onChange={v => setField('mobileSetName', v)} placeholder="e.g. SAMSUNG SM-A17 5G" />
          <FormField label="Model *"           value={f.model}         onChange={v => setField('model', v)}         placeholder="e.g. SAMSUNG SM-A17.5G" />
          <FormField label="Serial No. *"      value={f.serialNo}      onChange={v => setField('serialNo', v)}      placeholder="Device serial number" />
          <FormField label="Place"             value={f.place}         onChange={v => setField('place', v)}         placeholder="City / Location" />
          <div className="field">
            <label>Cost (₹) *</label>
            <input
              type="number" placeholder="e.g. 21000"
              value={f.cost} onChange={e => setField('cost', e.target.value)}
              style={{ borderColor: f.cost && (isNaN(f.cost) || parseFloat(f.cost) <= 0) ? 'var(--red)' : '' }}
            />
            {f.cost && (isNaN(f.cost) || parseFloat(f.cost) <= 0) && (
              <div style={{ color: 'var(--red)', fontSize: 11, marginTop: 4 }}>Enter a valid amount</div>
            )}
          </div>
          <div className="field">
            <label>Mobile No. *</label>
            <input
              type="tel" placeholder="10-digit number"
              value={f.mobileNo} maxLength={10}
              onChange={e => setField('mobileNo', e.target.value.replace(/\D/g, ''))}
              style={{ borderColor: f.mobileNo && f.mobileNo.length !== 10 ? 'var(--red)' : '' }}
            />
            {f.mobileNo && f.mobileNo.length !== 10 && (
              <div style={{ color: 'var(--red)', fontSize: 11, marginTop: 4 }}>{10 - f.mobileNo.length} more digits required</div>
            )}
          </div>
          <div className="field">
            <label>Brought from Agency</label>
            <select value={f.agency} onChange={e => setField('agency', e.target.value)}>
              {AGENCIES.map(a => <option key={a}>{a}</option>)}
            </select>
          </div>
          <FormField label="Last Reimbursement Date" value={f.lastReimDate}       onChange={v => setField('lastReimDate', v)}       type="date" />
          <FormField label="Mobile Purchase Date *"  value={f.mobilePurchaseDate} onChange={v => setField('mobilePurchaseDate', v)} type="date" />
        </div>

        {/* Attachment */}
        <div className="section-label">Invoice / Receipt Attachment</div>
        <div style={{ border: '2px dashed var(--border)', borderRadius: 12, padding: '24px', textAlign: 'center', background: 'var(--bg)', marginBottom: 8 }}>
          <input
            type="file" id="fileInput"
            accept=".pdf,.jpg,.jpeg,.png"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
          <label htmlFor="fileInput" style={{ cursor: 'pointer' }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent)' }}>
              {file ? file.name : 'Click to upload invoice / receipt'}
            </div>
            <div style={{ color: 'var(--muted)', fontSize: 12, marginTop: 4 }}>
              PDF, JPG or PNG · Max 5MB
            </div>
          </label>
          {file && (
            <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <span style={{ color: 'var(--green)', fontSize: 13 }}>✓ {file.name}</span>
              <button
                onClick={() => setFile(null)}
                style={{ background: 'none', border: 'none', color: 'var(--red)', fontSize: 13, cursor: 'pointer' }}
              >✕ Remove</button>
            </div>
          )}
          {uploadProgress && <div style={{ color: 'var(--accent)', fontSize: 13, marginTop: 8 }}>{uploadProgress}</div>}
        </div>

        <button className="btn-primary" style={{ marginTop: 16, padding: 14 }} onClick={handle} disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Request'}
        </button>
      </div>
    </div>
  )
}

function ReadField({ label, value }) {
  return (
    <div className="field">
      <label>{label}</label>
      <div className="read-field">{value || '—'}</div>
    </div>
  )
}

function EditField({ label, value, onChange, placeholder, type = 'text' }) {
  return (
    <div className="field">
      <label>{label}</label>
      <input type={type} placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} />
    </div>
  )
}

function FormField({ label, value, onChange, placeholder, type = 'text' }) {
  return (
    <div className="field">
      <label>{label}</label>
      <input type={type} placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} />
    </div>
  )
}