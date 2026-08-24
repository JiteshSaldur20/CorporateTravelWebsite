import { useState, useEffect } from 'react'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import useColors from '../../hooks/useColors'
import PageHeader from '../../components/PageHeader'

const EMPTY_FORM = {
  policyName: '',
  description: '',
  salaryBand: '',
  maxFlightClass: 'ECONOMY',
  maxFlightPrice: '',
  maxFlightDurationHours: '',
  maxHotelStarRating: '',
  maxHotelPricePerNight: '',
  active: true,
}

export default function TravelPolicyPage() {
  const [policies, setPolicies] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const { user } = useAuth()
  const { addToast } = useToast()
  const c = useColors()

  const isAdmin = user?.roles?.some(r => r === 'ROLE_ADMIN' || r === 'ADMIN')

  useEffect(() => { loadPolicies() }, [])

  const loadPolicies = async () => {
    setLoading(true)
    try {
      const url = isAdmin ? '/api/policies/all' : '/api/policies'
      const { data } = await api.get(url)
      setPolicies(data)
    } catch (err) {
      addToast('Failed to load travel policies', 'danger')
    }
    setLoading(false)
  }

  const openCreate = () => {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setShowForm(true)
  }

  const openEdit = (policy) => {
    setEditingId(policy.id)
    setForm({
      policyName: policy.policyName || '',
      description: policy.description || '',
      salaryBand: policy.salaryBand || '',
      maxFlightClass: policy.maxFlightClass || 'ECONOMY',
      maxFlightPrice: policy.maxFlightPrice || '',
      maxFlightDurationHours: policy.maxFlightDurationHours || '',
      maxHotelStarRating: policy.maxHotelStarRating || '',
      maxHotelPricePerNight: policy.maxHotelPricePerNight || '',
      active: policy.active !== false,
    })
    setShowForm(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        ...form,
        maxFlightPrice: parseFloat(form.maxFlightPrice),
        maxFlightDurationHours: parseInt(form.maxFlightDurationHours),
        maxHotelStarRating: parseInt(form.maxHotelStarRating),
        maxHotelPricePerNight: parseFloat(form.maxHotelPricePerNight),
      }
      if (editingId) {
        await api.put(`/api/policies/${editingId}`, payload)
        addToast('Policy updated successfully', 'success')
      } else {
        await api.post('/api/policies', payload)
        addToast('Policy created successfully', 'success')
      }
      setShowForm(false)
      loadPolicies()
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to save policy', 'danger')
    }
    setSaving(false)
  }

  const handleDeactivate = async (id) => {
    if (!window.confirm('Deactivate this policy?')) return
    try {
      await api.delete(`/api/policies/${id}`)
      addToast('Policy deactivated', 'success')
      loadPolicies()
    } catch (err) {
      addToast('Failed to deactivate policy', 'danger')
    }
  }

  const toggleActive = async (policy) => {
    try {
      await api.put(`/api/policies/${policy.id}`, { ...policy, active: !policy.active })
      addToast(policy.active ? 'Policy deactivated' : 'Policy activated', 'success')
      loadPolicies()
    } catch (err) {
      addToast('Failed to toggle policy', 'danger')
    }
  }

  const inputStyle = {
    width: '100%', padding: '10px 12px', fontSize: '13px',
    border: `1px solid ${c.border}`, borderRadius: '4px',
    backgroundColor: c.card, color: c.text, outline: 'none',
    transition: 'border-color 0.2s',
    fontFamily: "'IBM Plex Sans', sans-serif",
  }

  const labelStyle = {
    display: 'block', fontSize: '9px', fontWeight: 600,
    textTransform: 'uppercase', letterSpacing: '0.1em',
    color: c.textMuted, marginBottom: '6px',
  }

  const cardStyle = {
    background: c.card, border: `1px solid ${c.cardBorder}`,
    borderRadius: '4px', overflow: 'hidden',
  }

  return (
    <div className="animate-in">
      <PageHeader
        section="Admin"
        title="Travel Policy"
        icon="fa-file-alt"
        action={isAdmin ? { label: 'New Policy', onClick: openCreate } : undefined}
      />

      {/* Policy Form Modal */}
      {showForm && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, animation: 'fadeIn 0.2s ease',
        }} onClick={() => setShowForm(false)}>
          <div style={{
            background: c.card, borderRadius: '8px', padding: '28px 32px',
            width: '520px', maxWidth: '90vw', maxHeight: '85vh', overflowY: 'auto',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          }} onClick={e => e.stopPropagation()}>
            <h3 style={{
              fontFamily: "'DM Serif Display', serif", fontSize: '22px',
              color: c.text, margin: '0 0 24px', letterSpacing: '-0.03em',
            }}>
              {editingId ? 'Edit Policy' : 'Create Policy'}
            </h3>

            <form onSubmit={handleSave}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Policy Name</label>
                  <input
                    value={form.policyName}
                    onChange={e => setForm(p => ({ ...p, policyName: e.target.value }))}
                    placeholder="e.g. Standard Band A"
                    required style={inputStyle}
                  />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Description</label>
                  <textarea
                    value={form.description}
                    onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                    placeholder="Describe this policy..."
                    required rows={3}
                    style={{ ...inputStyle, resize: 'vertical' }}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Salary Band</label>
                  <input
                    value={form.salaryBand}
                    onChange={e => setForm(p => ({ ...p, salaryBand: e.target.value }))}
                    placeholder="e.g. BAND_A"
                    required style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Max Flight Class</label>
                  <select
                    value={form.maxFlightClass}
                    onChange={e => setForm(p => ({ ...p, maxFlightClass: e.target.value }))}
                    style={inputStyle}
                  >
                    <option value="ECONOMY">Economy</option>
                    <option value="PREMIUM_ECONOMY">Premium Economy</option>
                    <option value="BUSINESS">Business</option>
                    <option value="FIRST">First Class</option>
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Max Flight Price (₹)</label>
                  <input
                    type="number" step="0.01"
                    value={form.maxFlightPrice}
                    onChange={e => setForm(p => ({ ...p, maxFlightPrice: e.target.value }))}
                    placeholder="e.g. 25000"
                    required style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Max Flight Duration (hrs)</label>
                  <input
                    type="number"
                    value={form.maxFlightDurationHours}
                    onChange={e => setForm(p => ({ ...p, maxFlightDurationHours: e.target.value }))}
                    placeholder="e.g. 8"
                    required style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Max Hotel Stars</label>
                  <select
                    value={form.maxHotelStarRating}
                    onChange={e => setForm(p => ({ ...p, maxHotelStarRating: e.target.value }))}
                    style={inputStyle}
                  >
                    <option value="">Select</option>
                    <option value="3">3 Stars</option>
                    <option value="4">4 Stars</option>
                    <option value="5">5 Stars</option>
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Max Hotel Price/Night (₹)</label>
                  <input
                    type="number" step="0.01"
                    value={form.maxHotelPricePerNight}
                    onChange={e => setForm(p => ({ ...p, maxHotelPricePerNight: e.target.value }))}
                    placeholder="e.g. 8000"
                    required style={inputStyle}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
                <button
                  type="button" onClick={() => setShowForm(false)}
                  style={{
                    padding: '10px 18px', fontSize: '12px', borderRadius: '4px',
                    border: `1px solid ${c.border}`, background: 'transparent',
                    color: c.textSecondary, cursor: 'pointer',
                    fontFamily: "'IBM Plex Sans', sans-serif",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit" disabled={saving}
                  style={{
                    padding: '10px 20px', fontSize: '12px', fontWeight: 600,
                    borderRadius: '4px', border: 'none',
                    background: '#e86f3d', color: '#fff9f1', cursor: 'pointer',
                    opacity: saving ? 0.7 : 1,
                    fontFamily: "'IBM Plex Sans', sans-serif",
                  }}
                >
                  {saving ? 'Saving...' : editingId ? 'Update Policy' : 'Create Policy'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Policies List */}
      {loading ? (
        <div className="text-center p-5"><div className="spinner-border" /></div>
      ) : policies.length === 0 ? (
        <div style={{ ...cardStyle, padding: '48px', textAlign: 'center' }}>
          <i className="fas fa-file-alt" style={{ fontSize: '32px', color: c.border, display: 'block', marginBottom: '12px' }} />
          <p style={{ color: c.textMuted, fontSize: '13px', margin: 0 }}>No travel policies found.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {policies.map(policy => (
            <div key={policy.id} style={{
              ...cardStyle, padding: '20px 24px',
              opacity: policy.active ? 1 : 0.55,
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.06)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <h4 style={{
                      fontFamily: "'DM Serif Display', serif", fontSize: '18px',
                      color: c.text, margin: 0, letterSpacing: '-0.02em',
                    }}>
                      {policy.policyName}
                    </h4>
                    <span style={{
                      fontSize: '9px', fontWeight: 600, textTransform: 'uppercase',
                      letterSpacing: '0.08em', padding: '3px 8px', borderRadius: '3px',
                      background: policy.active ? '#e8eee5' : '#fde8e8',
                      color: policy.active ? '#3d5a42' : '#922b21',
                    }}>
                      {policy.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p style={{ fontSize: '12px', color: c.textSecondary, margin: '0 0 12px', lineHeight: 1.5 }}>
                    {policy.description}
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '11px', color: c.textMuted }}>
                    <span><strong style={{ color: c.textSecondary }}>Band:</strong> {policy.salaryBand}</span>
                    <span><strong style={{ color: c.textSecondary }}>Flight:</strong> {policy.maxFlightClass?.replace('_', ' ')} up to ₹{policy.maxFlightPrice?.toLocaleString()}</span>
                    <span><strong style={{ color: c.textSecondary }}>Duration:</strong> {policy.maxFlightDurationHours}h</span>
                    <span><strong style={{ color: c.textSecondary }}>Hotel:</strong> {policy.maxHotelStarRating}★ up to ₹{policy.maxHotelPricePerNight?.toLocaleString()}/night</span>
                  </div>
                </div>

                {isAdmin && (
                  <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                    <button
                      onClick={() => openEdit(policy)}
                      style={{
                        padding: '7px 14px', fontSize: '11px', borderRadius: '4px',
                        border: `1px solid ${c.border}`, background: 'transparent',
                        color: c.textSecondary, cursor: 'pointer', fontWeight: 500,
                        fontFamily: "'IBM Plex Sans', sans-serif",
                        transition: 'all 0.15s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = '#e86f3d'; e.currentTarget.style.color = '#e86f3d' }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = c.border; e.currentTarget.style.color = c.textSecondary }}
                    >
                      <i className="fas fa-edit me-1" /> Edit
                    </button>
                    <button
                      onClick={() => toggleActive(policy)}
                      style={{
                        padding: '7px 14px', fontSize: '11px', borderRadius: '4px',
                        border: `1px solid ${c.border}`, background: 'transparent',
                        color: policy.active ? '#c0392b' : '#627b68',
                        cursor: 'pointer', fontWeight: 500,
                        fontFamily: "'IBM Plex Sans', sans-serif",
                        transition: 'all 0.15s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.opacity = '0.7' }}
                      onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
                    >
                      <i className={`fas ${policy.active ? 'fa-ban' : 'fa-check'} me-1`} />
                      {policy.active ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
