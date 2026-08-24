import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import api from '../../services/api'
import { useToast } from '../../context/ToastContext'
import useColors from '../../hooks/useColors'
import PageHeader from '../../components/PageHeader'

const PURPOSES = ['Client Meeting', 'Business Conference', 'Training', 'Project/On-site Work', 'Sales Meeting', 'Internal Office Visit', 'Business Development', 'Vendor/Supplier Meeting', 'Interview/Recruitment', 'Other']

export default function BookingCreatePage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { addToast } = useToast()
  const c = useColors()
  const [flight, setFlight] = useState(null)
  const [hotel, setHotel] = useState(null)
  const [room, setRoom] = useState(null)
  const [form, setForm] = useState({
    travelPurpose: '', travelPurposeDescription: '',
    travelStartDate: '', travelEndDate: '', numberOfPassengers: 1,
    hotelNights: 1
  })
  const [policyWarning, setPolicyWarning] = useState(null)
  const [loading, setLoading] = useState(false)

  const type = searchParams.get('type')
  const flightId = searchParams.get('flightId')
  const hotelId = searchParams.get('hotelId')
  const roomId = searchParams.get('roomId')

  useEffect(() => {
    const loadData = async () => {
      if (flightId) {
        const { data } = await api.get(`/api/flights/${flightId}`)
        setFlight(data)
      }
      if (hotelId && roomId) {
        const { data: h } = await api.get(`/api/hotels/${hotelId}`)
        setHotel(h)
        const selectedRoom = h.rooms?.find(r => r.id === parseInt(roomId))
        setRoom(selectedRoom)
      }
    }
    loadData()
  }, [flightId, hotelId, roomId])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = {
        travelPurpose: form.travelPurpose,
        travelPurposeDescription: form.travelPurposeDescription,
        travelStartDate: form.travelStartDate,
        travelEndDate: form.travelEndDate,
        numberOfPassengers: parseInt(form.numberOfPassengers),
        origin: flight?.origin || hotel?.city,
        destination: flight?.destination || hotel?.city,
        flightId: flight ? parseInt(flightId) : null,
        flightClass: flight?.travelClass || null,
        hotelId: hotel ? parseInt(hotelId) : null,
        hotelRoomId: room ? parseInt(roomId) : null,
        hotelNights: room ? parseInt(form.hotelNights) : null,
      }
      const { data } = await api.post('/api/bookings', payload)
      addToast('Booking submitted! Reference: ' + data.bookingReference, 'success')
      navigate('/bookings')
    } catch (err) {
      addToast(err.response?.data?.message || 'Booking failed', 'danger')
    }
    setLoading(false)
  }

  const inputStyle = {
    width: '100%', padding: '10px 12px', fontSize: '13px',
    border: `1px solid ${c.border}`, borderRadius: '4px',
    backgroundColor: c.card, color: c.text,
    outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s',
  }

  return (
    <div className="animate-in">
      <PageHeader section="Bookings" title="Create Travel Request" icon="fa-plus-circle" />

      {policyWarning && (
        <div style={{
          background: '#fde8e8', borderLeft: '3px solid #c0392b',
          padding: '16px 20px', marginBottom: '24px', borderRadius: '4px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <i className="fas fa-exclamation-triangle" style={{ color: '#c0392b' }} />
            <strong style={{ fontSize: '12px', color: '#922b21' }}>Policy Violation</strong>
          </div>
          <p style={{ fontSize: '11px', color: '#922b21', margin: 0 }}>
            <strong>{policyWarning.policyName}:</strong> {policyWarning.message}
          </p>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '24px' }}>
        {/* Form */}
        <div style={{
          background: c.card, border: `1px solid ${c.cardBorder}`,
          borderRadius: '4px', padding: '24px',
        }}>
          <form onSubmit={handleSubmit}>
            {/* Selected option */}
            {flight && (
              <div style={{
                background: c.bg, border: `1px solid ${c.border}`,
                borderRadius: '4px', padding: '14px 16px', marginBottom: '20px',
                display: 'flex', alignItems: 'center', gap: '12px',
              }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '4px', background: c.primaryLight || '#f7e1d6', display: 'grid', placeItems: 'center' }}>
                  <i className="fas fa-plane" style={{ color: c.primary, fontSize: '12px' }} />
                </div>
                <div>
                  <span style={{ fontSize: '11px', fontWeight: 500, color: c.text }}>
                    {flight.flightNumber} ({flight.airline}) — {flight.origin} → {flight.destination}
                  </span>
                  <br />
                  <span style={{ fontSize: '10px', color: '#879087' }}>
                    {flight.travelClass.replace('_', ' ')} • ₹{flight.price.toLocaleString()}
                  </span>
                </div>
              </div>
            )}
            {hotel && room && (
              <div style={{
                background: '#e8eee5', border: '1px solid #d5e3d9',
                borderRadius: '4px', padding: '14px 16px', marginBottom: '20px',
                display: 'flex', alignItems: 'center', gap: '12px',
              }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '4px', background: c.successBg, display: 'grid', placeItems: 'center' }}>
                  <i className="fas fa-hotel" style={{ color: c.success, fontSize: '12px' }} />
                </div>
                <div>
                  <span style={{ fontSize: '11px', fontWeight: 500, color: c.text }}>
                    {hotel.name} — {room.roomType}
                  </span>
                  <br />
                  <span style={{ fontSize: '10px', color: '#879087' }}>
                    ₹{room.pricePerNight.toLocaleString()}/night
                  </span>
                </div>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: c.text, marginBottom: '6px' }}>Travel Purpose *</label>
                <select
                  value={form.travelPurpose}
                  onChange={e => setForm(p => ({...p, travelPurpose: e.target.value}))}
                  required
                  style={inputStyle}
                >
                  <option value="">Select Purpose</option>
                  {PURPOSES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              {form.travelPurpose === 'Other' && (
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: c.text, marginBottom: '6px' }}>Description *</label>
                  <input
                    value={form.travelPurposeDescription}
                    onChange={e => setForm(p => ({...p, travelPurposeDescription: e.target.value}))}
                    required
                    style={inputStyle}
                  />
                </div>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: c.text, marginBottom: '6px' }}>Start Date *</label>
                <input type="date" value={form.travelStartDate} onChange={e => setForm(p => ({...p, travelStartDate: e.target.value}))} required style={inputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: c.text, marginBottom: '6px' }}>End Date *</label>
                <input type="date" value={form.travelEndDate} onChange={e => setForm(p => ({...p, travelEndDate: e.target.value}))} required style={inputStyle} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: c.text, marginBottom: '6px' }}>Passengers</label>
                <input type="number" value={form.numberOfPassengers} onChange={e => setForm(p => ({...p, numberOfPassengers: e.target.value}))} min="1" max="10" style={inputStyle} />
              </div>
              {room && (
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: c.text, marginBottom: '6px' }}>Hotel Nights</label>
                  <input type="number" value={form.hotelNights} onChange={e => setForm(p => ({...p, hotelNights: e.target.value}))} min="1" style={inputStyle} />
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="submit"
                disabled={loading || !!policyWarning}
                style={{
                  padding: '11px 20px', fontSize: '12px', fontWeight: 500,
                  background: c.primary, color: c.primaryFg, border: 'none',
                  borderRadius: '4px', cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading || policyWarning ? 0.6 : 1,
                  transition: 'transform 0.16s ease, box-shadow 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  if (!loading && !policyWarning) {
                    e.currentTarget.style.transform = 'translateY(-1px)'
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(232, 111, 61, 0.3)'
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                {loading ? <><span className="spinner-border spinner-border-sm me-2" /> Submitting...</> : 'Submit Request'}
              </button>
              <button
                type="button"
                onClick={() => navigate(-1)}
                style={{
                  padding: '11px 20px', fontSize: '12px', fontWeight: 500,
                  background: 'transparent', color: c.textSecondary,
                  border: `1px solid ${c.border}`, borderRadius: '4px',
                  cursor: 'pointer', transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = c.textMuted
                  e.currentTarget.style.color = c.text
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = c.border
                  e.currentTarget.style.color = c.textSecondary
                }}
              >Cancel</button>
            </div>
          </form>
        </div>

        {/* Trip Summary */}
        <div>
          <div style={{
            background: c.dark, borderRadius: '4px',
            padding: '20px', color: c.primaryFg,
          }}>
            <h6 style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: '16px', fontWeight: 400, color: c.primaryFg,
              margin: '0 0 16px',
            }}>Trip Summary</h6>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '11px' }}>
              <span style={{ color: c.textLight }}>Type</span>
              <span style={{
                background: c.darkMid, color: '#9bbbd0',
                fontSize: '9px', fontWeight: 500,
                padding: '2px 8px', borderRadius: '3px',
              }}>{type?.toUpperCase()}</span>
            </div>

            {flight && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '11px' }}>
                <span style={{ color: c.textLight }}>Flight</span>
                <span>₹{flight.price.toLocaleString()}</span>
              </div>
            )}
            {room && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '11px' }}>
                  <span style={{ color: c.textLight }}>Room</span>
                  <span>₹{room.pricePerNight.toLocaleString()}/night</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '11px' }}>
                  <span style={{ color: c.textLight }}>Nights</span>
                  <span>{form.hotelNights}</span>
                </div>
              </>
            )}

            <div style={{ borderTop: `1px solid ${c.darkBorder}`, paddingTop: '12px', marginTop: '4px', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '11px', fontWeight: 500, color: c.textLight }}>Estimated Total</span>
              <span style={{
                fontFamily: "'DM Serif Display', serif",
                fontSize: '18px', fontWeight: 400, color: c.primary,
              }}>
                ₹{(
                  (flight ? flight.price * form.numberOfPassengers : 0) +
                  (room ? room.pricePerNight * form.hotelNights : 0)
                ).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
