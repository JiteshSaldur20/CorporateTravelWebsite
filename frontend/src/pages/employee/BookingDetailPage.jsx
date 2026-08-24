import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import useColors from '../../hooks/useColors'
import PageHeader from '../../components/PageHeader'

const STATUS_CONFIG = {
  PENDING: { label: 'Submitted', icon: 'fa-paper-plane', color: '#f29a69', bg: '#fef4e0', step: 0 },
  APPROVED: { label: 'Approved', icon: 'fa-check-circle', color: '#627b68', bg: '#e8eee5', step: 1 },
  REJECTED: { label: 'Rejected', icon: 'fa-times-circle', color: '#c0392b', bg: '#fde8e8', step: -1 },
  PAYMENT_INITIATED: { label: 'Payment Initiated', icon: 'fa-credit-card', color: '#9bbbd0', bg: '#d5e3e6', step: 2 },
  PAYMENT_SUCCESS: { label: 'Paid', icon: 'fa-check-double', color: '#627b68', bg: '#e8eee5', step: 3 },
  PAYMENT_FAILED: { label: 'Payment Failed', icon: 'fa-exclamation-triangle', color: '#c0392b', bg: '#fde8e8', step: -1 },
  TICKETED: { label: 'Ticketed', icon: 'fa-ticket-alt', color: '#e86f3d', bg: '#f7e1d6', step: 4 },
  CANCELLED: { label: 'Cancelled', icon: 'fa-ban', color: '#768078', bg: '#ece8df', step: -1 },
}

const TRACKER_STEPS = [
  { label: 'Submitted', icon: 'fa-paper-plane' },
  { label: 'Approved', icon: 'fa-check-circle' },
  { label: 'Payment', icon: 'fa-credit-card' },
  { label: 'Paid', icon: 'fa-check-double' },
  { label: 'Ticketed', icon: 'fa-ticket-alt' },
]

export default function BookingDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { addToast } = useToast()
  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showCancel, setShowCancel] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const c = useColors()

  useEffect(() => { loadBooking() }, [id])

  const loadBooking = async () => {
    try {
      const { data } = await api.get(`/api/bookings/${id}`)
      setBooking(data)
    } catch (err) {
      addToast('Failed to load booking', 'danger')
    }
    setLoading(false)
  }

  const handleCancel = async () => {
    try {
      await api.post(`/api/bookings/${id}/cancel`, { reason: cancelReason })
      addToast('Booking cancelled', 'success')
      setShowCancel(false)
      loadBooking()
    } catch (err) {
      addToast(err.response?.data?.message || 'Cancel failed', 'danger')
    }
  }

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '60px 0' }}>
      <div className="spinner-border" />
    </div>
  )
  if (!booking) return (
    <div style={{ textAlign: 'center', padding: '60px 0', color: '#c0392b' }}>
      Booking not found
    </div>
  )

  const statusConf = STATUS_CONFIG[booking.status] || STATUS_CONFIG.PENDING
  const currentStep = statusConf.step
  const isRejected = currentStep === -1
  const isCancelled = booking.status === 'CANCELLED'
  const canCancel = ['PENDING', 'APPROVED'].includes(booking.status) &&
    (booking.employeeId === user?.id || user?.roles?.includes('ROLE_ADMIN'))
  const canDownloadTicket = booking.status === 'TICKETED'

  const handleDownloadTicket = async () => {
    try {
      const response = await api.get(`/api/bookings/${id}/ticket`, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `ticket-${booking.bookingReference}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      addToast('Failed to download ticket', 'danger')
    }
  }

  return (
    <div className="animate-in">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-start" style={{ marginBottom: '24px' }}>
        <div>
          <button
            onClick={() => navigate('/bookings')}
            style={{
              background: 'none', border: 'none', color: c.primary,
              fontSize: '11px', cursor: 'pointer', padding: 0, marginBottom: '8px',
              display: 'flex', alignItems: 'center', gap: '6px',
              transition: 'gap 0.2s ease',
            }}
            onMouseEnter={(e) => e.currentTarget.style.gap = '10px'}
            onMouseLeave={(e) => e.currentTarget.style.gap = '6px'}
          >
            <i className="fas fa-arrow-left" /> Back to Bookings
          </button>
          <h4 style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: '28px', fontWeight: 400, letterSpacing: '-0.03em',
            color: c.text, margin: '4px 0 8px',
          }}>
            Booking {booking.bookingReference}
          </h4>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '5px',
            background: statusConf.bg, color: statusConf.color,
            fontSize: '10px', fontWeight: 500,
            padding: '5px 10px', borderRadius: '3px',
          }}>
            <span className="status-dot" style={{ background: statusConf.color }} />
            {statusConf.label}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {canDownloadTicket && (
            <button
              onClick={handleDownloadTicket}
              style={{
                padding: '8px 14px', fontSize: '11px', fontWeight: 500,
                background: c.primary, color: c.primaryFg,
                border: 'none', borderRadius: '4px',
                cursor: 'pointer', transition: 'all 0.2s ease',
                display: 'flex', alignItems: 'center', gap: '6px',
              }}
            >
              <i className="fas fa-download" style={{ fontSize: '10px' }} /> Download Ticket
            </button>
          )}
          {canCancel && (
            <button
              onClick={() => setShowCancel(true)}
              style={{
                padding: '8px 14px', fontSize: '11px', fontWeight: 500,
                background: 'transparent', color: c.danger,
                border: `1px solid ${c.danger}`, borderRadius: '4px',
                cursor: 'pointer', transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = c.danger
                e.currentTarget.style.color = c.primaryFg
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.color = c.danger
              }}
            >
              <i className="fas fa-times me-1" /> Cancel
            </button>
          )}
        </div>
      </div>

      {/* Status Tracker */}
      {!isRejected && !isCancelled && (
        <div style={{
          background: c.card, border: `1px solid ${c.cardBorder}`,
          borderRadius: '4px', padding: '24px 32px', marginBottom: '24px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
            {/* Progress line background */}
            <div style={{
              position: 'absolute', top: '18px', left: '40px', right: '40px',
              height: '3px', background: c.borderTable, zIndex: 0,
            }} />
            {/* Progress line filled */}
            <div style={{
              position: 'absolute', top: '18px', left: '40px',
              height: '3px', background: c.primary, zIndex: 1,
              width: `calc(${Math.min(100, (currentStep / (TRACKER_STEPS.length - 1)) * 100)}% - ${Math.min(100, (currentStep / (TRACKER_STEPS.length - 1)) * 100) * 80 / 100}px)`,
              transition: 'width 0.5s cubic-bezier(.23,1,.32,1)',
            }} />

            {TRACKER_STEPS.map((step, i) => {
              const isCompleted = currentStep > i
              const isCurrent = currentStep === i
              return (
                <div key={i} className="text-center" style={{ zIndex: 2, flex: 1 }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '50%',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    background: isCompleted || isCurrent ? c.primary : c.bg,
                    color: isCompleted || isCurrent ? c.primaryFg : c.textMuted,
                    border: isCurrent ? `3px solid ${c.primaryLight}` : 'none',
                    transition: 'all 0.3s ease',
                    marginBottom: '8px',
                  }}>
                    <i className={`fas ${isCompleted ? 'fa-check' : step.icon}`} style={{ fontSize: '12px' }} />
                  </div>
                  <div style={{
                    fontSize: '10px', fontWeight: 500,
                    color: isCompleted || isCurrent ? c.primary : c.textMuted,
                  }}>{step.label}</div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '24px' }}>
        {/* Left Column */}
        <div>
          {/* Travel Details */}
          <div style={{
            background: c.card, border: `1px solid ${c.cardBorder}`,
            borderRadius: '4px', padding: '20px 24px', marginBottom: '16px',
          }}>
            <h6 style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: '16px', fontWeight: 400, color: c.text,
              margin: '0 0 16px',
            }}><i className="fas fa-suitcase me-2" style={{ color: '#e86f3d' }} />Travel Details</h6>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ background: c.bg, borderRadius: '4px', padding: '12px 14px' }}>
                <span style={{ fontSize: '9px', color: c.textMuted, textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '4px' }}>Purpose</span>
                <span style={{ fontSize: '12px', fontWeight: 500, color: c.text }}>{booking.travelPurpose}</span>
              </div>
              <div style={{ background: c.bg, borderRadius: '4px', padding: '12px 14px' }}>
                <span style={{ fontSize: '9px', color: c.textMuted, textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '4px' }}>
                  {(booking.type === 'FLIGHT' || booking.type === 'BOTH') ? 'Route' : 'Hotel'}
                </span>
                <span style={{ fontSize: '12px', fontWeight: 500, color: c.text }}>
                  {(booking.type === 'FLIGHT' || booking.type === 'BOTH') ? (
                    <><i className="fas fa-plane-departure me-1" style={{ color: c.primary, fontSize: '10px' }} />{booking.origin} → {booking.destination}</>
                  ) : (
                    <><i className="fas fa-hotel me-1" style={{ color: c.success, fontSize: '10px' }} />{booking.selectedHotel?.name || 'N/A'}</>
                  )}
                </span>
              </div>
              <div style={{ background: c.bg, borderRadius: '4px', padding: '12px 14px' }}>
                <span style={{ fontSize: '9px', color: c.textMuted, textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '4px' }}>Start Date</span>
                <span style={{ fontSize: '12px', fontWeight: 500, color: c.text }}>{booking.travelStartDate}</span>
              </div>
              <div style={{ background: c.bg, borderRadius: '4px', padding: '12px 14px' }}>
                <span style={{ fontSize: '9px', color: c.textMuted, textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '4px' }}>End Date</span>
                <span style={{ fontSize: '12px', fontWeight: 500, color: c.text }}>{booking.travelEndDate}</span>
              </div>
              <div style={{ background: c.bg, borderRadius: '4px', padding: '12px 14px' }}>
                <span style={{ fontSize: '9px', color: c.textMuted, textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '4px' }}>Passengers</span>
                <span style={{ fontSize: '12px', fontWeight: 500, color: c.text }}>{booking.numberOfPassengers}</span>
              </div>
            </div>
          </div>

          {/* Flight / Hotel Details */}
          {booking.selectedFlight && (
            <div style={{
              background: c.card, border: `1px solid ${c.cardBorder}`,
              borderRadius: '4px', padding: '20px 24px', marginBottom: '16px',
            }}>
              <h6 style={{
                fontFamily: "'DM Serif Display', serif",
                fontSize: '16px', fontWeight: 400, color: c.text,
                margin: '0 0 12px',
              }}><i className="fas fa-plane me-2" style={{ color: c.primary }} />Flight Details</h6>
              <div style={{
                background: c.bg, borderRadius: '4px', padding: '14px 16px',
                display: 'flex', alignItems: 'center', gap: '16px',
              }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '4px', background: c.primaryLight, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                  <i className="fas fa-plane" style={{ color: c.primary, fontSize: '14px' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: '12px', fontWeight: 500, color: c.text }}>
                    {booking.selectedFlight.flightNumber} — {booking.selectedFlight.airline}
                  </span>
                  <br />
                  <span style={{ fontSize: '10px', color: c.textMuted }}>
                    {booking.selectedFlight.travelClass} • {booking.selectedFlight.durationMinutes} min • {booking.selectedFlight.stops === 0 ? 'Direct' : `${booking.selectedFlight.stops} stop(s)`}
                  </span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '16px', fontWeight: 600, color: c.primary }}>₹{booking.flightPrice?.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}

          {booking.selectedHotel && (
            <div style={{
              background: c.card, border: `1px solid ${c.cardBorder}`,
              borderRadius: '4px', padding: '20px 24px', marginBottom: '16px',
            }}>
              <h6 style={{
                fontFamily: "'DM Serif Display', serif",
                fontSize: '16px', fontWeight: 400, color: c.text,
                margin: '0 0 12px',
              }}><i className="fas fa-hotel me-2" style={{ color: c.success }} />Hotel Details</h6>
              <div style={{ background: c.successBg, borderRadius: '4px', padding: '14px 16px' }}>
                <span style={{ fontSize: '12px', fontWeight: 500, color: c.text }}>{booking.selectedHotel.name}</span>
                <br />
                <span style={{ fontSize: '10px', color: c.textMuted }}>
                  <i className="fas fa-map-marker-alt me-1" />{booking.selectedHotel.address}
                </span>
                <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    background: c.successBg, color: c.success,
                    fontSize: '9px', fontWeight: 500,
                    padding: '3px 8px', borderRadius: '3px',
                  }}>{booking.selectedRoomType}</span>                    <span style={{ fontSize: '10px', color: c.textMuted }}>
                    ₹{booking.hotelPricePerNight?.toLocaleString()} × {booking.hotelNights} nights
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div>
          {/* Total Amount */}
          <div style={{
            background: c.dark, borderRadius: '4px',
            padding: '24px', textAlign: 'center', marginBottom: '16px',
          }}>
            <span style={{ fontSize: '10px', color: c.textMuted, textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '6px' }}>Total Amount</span>
            <span style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: '28px', fontWeight: 400, color: c.primary,
              display: 'block',
            }}>₹{booking.totalAmount?.toLocaleString()}</span>
            <span style={{ fontSize: '10px', color: c.textMuted }}>Inclusive of all taxes</span>
          </div>

          {/* Ticket Download Card */}
          {canDownloadTicket && (
            <div style={{
              background: c.card, border: `1px solid ${c.cardBorder}`,
              borderRadius: '4px', padding: '20px', marginBottom: '16px',
              textAlign: 'center',
            }}>
              <div style={{
                width: '48px', height: '48px', borderRadius: '50%',
                background: '#e8eee5', display: 'grid', placeItems: 'center',
                margin: '0 auto 12px',
              }}>
                <i className="fas fa-ticket-alt" style={{ color: c.primary, fontSize: '20px' }} />
              </div>
              <h6 style={{
                fontFamily: "'DM Serif Display', serif",
                fontSize: '14px', fontWeight: 400, color: c.text,
                margin: '0 0 8px',
              }}>Your Ticket is Ready</h6>
              <p style={{ fontSize: '10px', color: c.textMuted, margin: '0 0 14px' }}>
                Download your travel ticket for check-in
              </p>
              <button
                onClick={handleDownloadTicket}
                style={{
                  padding: '10px 20px', fontSize: '12px', fontWeight: 500,
                  background: c.primary, color: c.primaryFg,
                  border: 'none', borderRadius: '4px',
                  cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px',
                  transition: 'all 0.2s ease',
                }}
              >
                <i className="fas fa-download" style={{ fontSize: '11px' }} />
                Download PDF Ticket
              </button>
            </div>
          )}

          {/* Policy Warning */}
          {!booking.policyCompliant && (
            <div style={{
              background: '#fef4e0', borderLeft: '3px solid #f29a69',
              borderRadius: '4px', padding: '14px 16px', marginBottom: '16px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <i className="fas fa-exclamation-triangle" style={{ color: '#f29a69', fontSize: '11px' }} />
                <span style={{ fontSize: '11px', fontWeight: 500, color: '#8a6d3b' }}>Policy Violation</span>
              </div>
              <p style={{ fontSize: '10px', color: '#8a6d3b', margin: 0 }}>{booking.policyViolationDetails}</p>
            </div>
          )}

          {/* Cancellation Info */}
          {isCancelled && (
            <div style={{
              background: c.card, border: `1px solid ${c.cardBorder}`,
              borderRadius: '4px', padding: '16px', marginBottom: '16px',
            }}>
              <h6 style={{ fontSize: '12px', fontWeight: 500, color: c.danger, margin: '0 0 8px' }}>
                <i className="fas fa-ban me-1" /> Cancellation Details
              </h6>
              <p style={{ fontSize: '10px', color: c.textMuted, margin: '0 0 4px' }}>
                <strong>Reason:</strong> {booking.cancellationReason}
              </p>
              {booking.cancelledAt && (
                <p style={{ fontSize: '10px', color: c.textMuted, margin: 0 }}>
                  <strong>Cancelled on:</strong> {new Date(booking.cancelledAt).toLocaleString()}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Cancel Modal */}
      {showCancel && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
          display: 'grid', placeItems: 'center', zIndex: 1050,
        }} onClick={() => setShowCancel(false)}>
          <div
            style={{
              background: c.card, borderRadius: '8px',
              width: '440px', maxWidth: '90vw',
              boxShadow: '0 20px 60px rgba(22, 35, 31, 0.2)',
              animation: 'modalSlide 0.25s cubic-bezier(.23,1,.32,1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              padding: '20px 24px 0',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <h6 style={{
                fontFamily: "'DM Serif Display', serif",
                fontSize: '18px', fontWeight: 400, color: c.text, margin: 0,
              }}>Cancel Booking</h6>
              <button onClick={() => setShowCancel(false)} style={{
                background: 'none', border: 'none', color: c.textMuted,
                fontSize: '16px', cursor: 'pointer',
              }}><i className="fas fa-times" /></button>
            </div>
            <div style={{ padding: '16px 24px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: c.text, marginBottom: '6px' }}>
                Reason for cancellation *
              </label>
              <textarea
                rows={3}
                value={cancelReason}
                onChange={e => setCancelReason(e.target.value)}
                placeholder="Please provide a reason..."
                style={{
                  width: '100%', padding: '10px 12px', fontSize: '13px',
                  border: `1px solid ${c.border}`, borderRadius: '4px',
                  backgroundColor: c.card, color: c.text,
                  outline: 'none', resize: 'vertical',
                }}
              />
            </div>
            <div style={{
              padding: '12px 24px 20px',
              display: 'flex', justifyContent: 'flex-end', gap: '10px',
            }}>
              <button onClick={() => setShowCancel(false)} style={{
                padding: '8px 16px', fontSize: '12px', fontWeight: 500,
                background: 'transparent', color: c.textSecondary,
                border: `1px solid ${c.border}`, borderRadius: '4px',
                cursor: 'pointer',
              }}>Close</button>
              <button onClick={handleCancel} disabled={!cancelReason} style={{
                padding: '8px 16px', fontSize: '12px', fontWeight: 500,
                background: c.danger, color: c.primaryFg, border: 'none',
                borderRadius: '4px', cursor: cancelReason ? 'pointer' : 'not-allowed',
                opacity: cancelReason ? 1 : 0.5,
              }}>Confirm Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
