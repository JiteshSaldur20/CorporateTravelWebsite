import { useState, useEffect } from 'react'
import api from '../../services/api'
import { useToast } from '../../context/ToastContext'
import useColors from '../../hooks/useColors'
import PageHeader from '../../components/PageHeader'

const BookingRouteDisplay = ({ booking }) => {
  const hasFlight = booking.type === 'FLIGHT' || booking.type === 'BOTH'
  const hasHotel = booking.type === 'HOTEL' || booking.type === 'BOTH'
  return (
    <>
      {hasFlight && (
        <>{booking.origin} → {booking.destination}</>
      )}
      {hasHotel && (
        <>{hasFlight && <br />}<i className="fas fa-hotel me-1" style={{ color: '#627b68', fontSize: '10px' }} />{booking.selectedHotel?.name || booking.destination}</>
      )}
      {!hasFlight && !hasHotel && <>{booking.origin} → {booking.destination}</>}
    </>
  )
}

export default function PaymentPage() {
  const [approvedBookings, setApprovedBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(null)
  const [showCheckout, setShowCheckout] = useState(false)
  const [orderId, setOrderId] = useState('')
  const [paymentId, setPaymentId] = useState('')
  const { addToast } = useToast()
  const c = useColors()

  useEffect(() => { loadApproved() }, [])

  const loadApproved = async () => {
    try {
      const { data } = await api.get('/api/bookings/approved')
      setApprovedBookings(data)
    } catch (e) {}
    setLoading(false)
  }

  const initiatePayment = async (bookingId) => {
    setProcessing(bookingId)
    try {
      const { data } = await api.post(`/api/payments/${bookingId}/order`, { currency: 'INR' })
      setOrderId(data.orderId)
      setShowCheckout(true)
      addToast('Payment order created: ' + data.orderId, 'success')
      loadApproved()
    } catch (err) { addToast(err.response?.data?.message || 'Payment order failed', 'danger') }
    setProcessing(null)
  }

  const verifyPayment = async () => {
    try {
      await api.post('/api/payments/verify', {
        razorpayOrderId: orderId,
        razorpayPaymentId: paymentId || `pay_test_${Date.now()}`,
        razorpaySignature: 'test_signature_' + Date.now()
      })
      addToast('Payment verified successfully!', 'success')
      setShowCheckout(false); setOrderId(''); setPaymentId('')
      loadApproved()
    } catch (err) { addToast(err.response?.data?.message || 'Verification failed', 'danger') }
  }

  const inputStyle = {
    width: '100%', padding: '10px 12px', fontSize: '13px',
    border: `1px solid ${c.border}`, borderRadius: '4px',
    backgroundColor: c.card, color: c.text, outline: 'none',
  }

  if (loading) return <div style={{ textAlign: 'center', padding: '60px 0' }}><div className="spinner-border" /></div>

  return (
    <div className="animate-in">
      <PageHeader section="Admin" title="Company Payments" icon="fa-credit-card" />

      <div style={{
        background: '#d5e3e6', borderLeft: '3px solid #9bbbd0',
        padding: '14px 18px', marginBottom: '24px', borderRadius: '4px',
        display: 'flex', alignItems: 'center', gap: '10px',
      }}>
        <i className="fas fa-info-circle" style={{ color: '#3a6b7a', fontSize: '14px' }} />
        <span style={{ fontSize: '12px', color: '#3a6b7a' }}>
          Only ADMIN can initiate payments for approved bookings. Use Razorpay test mode credentials.
        </span>
      </div>

      {approvedBookings.length === 0 ? (
        <div className="empty-state">
          <i className="fas fa-check-circle" style={{ fontSize: '36px' }} />
          <p>No approved bookings requiring payment</p>
        </div>
      ) : (
        <div style={{ background: c.card, border: `1px solid ${c.cardBorder}`, borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="table align-middle mb-0">
              <thead>
                <tr>
                  {['Reference', 'Employee', 'Route/Hotel', 'Purpose', 'Amount', 'Action'].map(h => (
                    <th key={h} style={{ background: c.bg, borderBottom: `1px solid ${c.border}`, fontSize: '9px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: c.textMuted, padding: '10px 14px', ...(h === 'Amount' || h === 'Action' ? { textAlign: 'right' } : {}) }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {approvedBookings.map(b => (
                  <tr key={b.id} style={{ borderBottom: '1px solid #eee9df' }}>
                    <td style={{ padding: '12px 14px', fontSize: '11px', fontWeight: 500, color: c.text }}>{b.bookingReference}</td>
                    <td style={{ padding: '12px 14px', fontSize: '11px', color: c.textSecondary }}>{b.employeeName}</td>
                    <td style={{ padding: '12px 14px', fontSize: '11px', color: c.textSecondary }}><BookingRouteDisplay booking={b} /></td>
                    <td style={{ padding: '12px 14px', fontSize: '11px', color: c.textSecondary }}>{b.travelPurpose}</td>
                    <td style={{ padding: '12px 14px', fontSize: '12px', fontWeight: 600, color: c.primary, textAlign: 'right' }}>₹{b.totalAmount?.toLocaleString()}</td>
                    <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                      <button onClick={() => initiatePayment(b.id)} disabled={processing === b.id} style={{
                        padding: '6px 14px', fontSize: '10px', fontWeight: 500,
                        background: c.primary, color: c.primaryFg, border: 'none',
                        borderRadius: '3px', cursor: 'pointer', opacity: processing === b.id ? 0.5 : 1,
                        transition: 'transform 0.16s ease, box-shadow 0.2s ease',
                      }}
                        onMouseEnter={(e) => { if (processing !== b.id) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(232,111,61,0.3)' } }}
                        onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}
                      >
                        {processing === b.id ? <span className="spinner-border spinner-border-sm" /> : <><i className="fas fa-credit-card me-1" /> Pay Now</>}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showCheckout && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'grid', placeItems: 'center', zIndex: 1050 }} onClick={() => setShowCheckout(false)}>
          <div style={{ background: c.card, borderRadius: '8px', width: '440px', maxWidth: '90vw', boxShadow: '0 20px 60px rgba(22,35,31,0.2)', animation: 'modalSlide 0.25s cubic-bezier(.23,1,.32,1)' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '20px 24px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h6 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '18px', fontWeight: 400, color: c.text, margin: 0 }}>Razorpay Checkout (Test Mode)</h6>
              <button onClick={() => setShowCheckout(false)} style={{ background: 'none', border: 'none', color: c.textMuted, fontSize: '16px', cursor: 'pointer' }}><i className="fas fa-times" /></button>
            </div>
            <div style={{ padding: '16px 24px' }}>
              <div style={{ background: '#fef4e0', borderLeft: '3px solid #f29a69', padding: '12px 14px', marginBottom: '16px', borderRadius: '4px', fontSize: '12px', color: '#8a6d3b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="fas fa-flask" style={{ color: '#f29a69' }} />
                <strong>Test Mode</strong> — Use Razorpay test credentials
              </div>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: c.text, marginBottom: '6px' }}>Order ID</label>
                <input value={orderId} disabled style={{ ...inputStyle, backgroundColor: c.bg }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: c.text, marginBottom: '6px' }}>Payment ID (from Razorpay)</label>
                <input placeholder="pay_test_..." value={paymentId} onChange={e => setPaymentId(e.target.value)} style={inputStyle} />
              </div>
            </div>
            <div style={{ padding: '12px 24px 20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => setShowCheckout(false)} style={{ padding: '8px 16px', fontSize: '12px', fontWeight: 500, background: 'transparent', color: c.textSecondary, border: `1px solid ${c.border}`, borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
              <button onClick={verifyPayment} style={{ padding: '8px 16px', fontSize: '12px', fontWeight: 500, background: c.primary, color: c.primaryFg, border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                <i className="fas fa-check me-1" /> Verify Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
