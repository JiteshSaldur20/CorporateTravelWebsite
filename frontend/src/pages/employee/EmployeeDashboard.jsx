import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import useColors from '../../hooks/useColors'
import Calendar from '../../components/Calendar'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Pie } from 'react-chartjs-2'

const BookingRouteDisplay = ({ booking }) => {
  const hasFlight = booking.type === 'FLIGHT' || booking.type === 'BOTH'
  const hasHotel = booking.type === 'HOTEL' || booking.type === 'BOTH'
  return (
    <>
      {hasFlight && (
        <><i className="fas fa-plane-departure me-1" style={{ color: '#e86f3d', fontSize: '10px' }} />{booking.origin} → {booking.destination}</>
      )}
      {hasHotel && (
        <>{hasFlight && <br />}<i className="fas fa-hotel me-1" style={{ color: '#627b68', fontSize: '10px' }} />{booking.selectedHotel?.name || booking.destination}</>
      )}
      {!hasFlight && !hasHotel && <>{booking.origin} → {booking.destination}</>}
    </>
  )
}

ChartJS.register(ArcElement, Tooltip, Legend)

const STATUS_COLORS = {
  PENDING: { bg: '#fef4e0', text: '#8a6d3b', dot: '#f29a69' },
  APPROVED: { bg: '#e8eee5', text: '#3d5a42', dot: '#627b68' },
  REJECTED: { bg: '#fde8e8', text: '#922b21', dot: '#c0392b' },
  PAYMENT_INITIATED: { bg: '#d5e3e6', text: '#3a6b7a', dot: '#9bbbd0' },
  PAYMENT_SUCCESS: { bg: '#f7e1d6', text: '#8a4a2e', dot: '#e86f3d' },
  PAYMENT_FAILED: { bg: '#fde8e8', text: '#922b21', dot: '#c0392b' },
  TICKETED: { bg: '#f7e1d6', text: '#8a4a2e', dot: '#e86f3d' },
  CANCELLED: { bg: '#ece8df', text: '#768078', dot: '#768078' },
}

const STAT_CARDS = [
  { label: 'Total Bookings', key: 'totalBookings', icon: 'fa-suitcase', iconBg: '#f7e1d6', iconColor: '#e86f3d' },
  { label: 'Pending', key: 'pendingBookings', icon: 'fa-clock', iconBg: '#fef4e0', iconColor: '#f29a69' },
  { label: 'Approved', key: 'approvedBookings', icon: 'fa-check-circle', iconBg: '#e8eee5', iconColor: '#627b68' },
  { label: 'Completed', key: 'completedTrips', icon: 'fa-plane-arrival', iconBg: '#d5e3e6', iconColor: '#3a6b7a' },
]

export default function EmployeeDashboard() {
  const { user } = useAuth()
  const c = useColors()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/api/dashboard/employee')
      .then(r => { setData(r.data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '60px 0' }}>
      <div className="spinner-border" style={{ color: c.primary }} />
    </div>
  )
  if (!data) return (
    <div style={{ textAlign: 'center', padding: '60px 0', color: c.textMuted }}>
      Failed to load dashboard
    </div>
  )

  const pieData = {
    labels: ['Pending', 'Approved', 'Completed', 'Cancelled'],
    datasets: [{
      data: [data.pendingBookings, data.approvedBookings, data.completedTrips, data.cancelledBookings || 0],
      backgroundColor: ['#f29a69', '#627b68', '#e86f3d', '#768078'],
      borderWidth: 0,
      hoverOffset: 8
    }]
  }

  const firstName = user?.fullName?.split(' ')[0] || 'there'

  return (
    <div className="animate-in">
      {/* Hero Card */}
      <div className="hero-card">
        <img src="/images/HeroImage.png" alt="Corporate Travel" />
        <div className="hero-copy">
          <div className="eyebrow light">
            <span className="eyebrow-line" />
            Employee Dashboard
          </div>
          <h2>
            Welcome <em>back, {firstName}!</em>
          </h2>
          <p>
            Manage your corporate travel with ease. Book flights, hotels, and track your expenses all in one place.
          </p>
          <Link to="/flights" className="ghost-button">
            <i className="fas fa-plane" style={{ fontSize: '11px' }} />
            Book a Flight
          </Link>
        </div>
        <div className="hero-stamp">
          <span>Total Travel Spend</span>
          <strong>₹{(data.totalSpend || 0).toLocaleString()}</strong>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="stat-grid" style={{ gridTemplateColumns: '1.18fr 1fr 1fr 1fr' }}>
        {STAT_CARDS.map((stat, i) => (
          <div key={i} className="stat-card animate-in">
            <div className="stat-label">{stat.label}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginTop: '12px' }}>
              <span className="stat-value">{data[stat.key] || 0}</span>
              <div style={{
                width: '36px', height: '36px', borderRadius: '4px',
                background: stat.iconBg, display: 'grid', placeItems: 'center',
              }}>
                <i className={`fas ${stat.icon}`} style={{ color: stat.iconColor, fontSize: '14px' }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Content columns */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.48fr 1fr', gap: '36px' }}>
        {/* Recent Bookings */}
        <div>
          <div className="section-heading">
            <div>
              <div className="eyebrow"><span className="eyebrow-line" /> Recent Activity</div>
              <h3>Recent Bookings</h3>
            </div>
            <Link to="/bookings" className="text-link">
              View All <span style={{ fontSize: '10px' }}>→</span>
            </Link>
          </div>

          <div style={{
            background: c.card,
            border: `1px solid ${c.cardBorder}`,
            borderRadius: '4px',
            overflow: 'hidden',
          }}>
            {data.recentBookings?.length > 0 ? (
              <table className="table align-middle mb-0">
                <thead>
                  <tr>
                    {['Reference', 'Route/Hotel', 'Purpose', 'Status', 'Amount'].map(h => (
                      <th key={h} style={{
                        background: c.bg,
                        borderBottom: `1px solid ${c.border}`,
                        fontSize: '9px', fontWeight: 600,
                        textTransform: 'uppercase', letterSpacing: '0.14em',
                        color: c.textMuted, padding: '10px 14px',
                        ...(h === 'Amount' ? { textAlign: 'right' } : {}),
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.recentBookings.slice(0, 5).map(b => {
                    const sc = STATUS_COLORS[b.status] || STATUS_COLORS.PENDING
                    return (
                      <tr key={b.id} style={{ cursor: 'pointer', borderBottom: `1px solid ${c.borderTable}` }}
                        onClick={() => window.location.href = `/bookings/${b.id}`}
                      >
                        <td style={{ padding: '12px 14px', fontSize: '11px', fontWeight: 500, color: c.text }}>
                          {b.bookingReference}
                        </td>
                        <td style={{ padding: '12px 14px', fontSize: '11px', color: c.textSecondary }}>
                          <BookingRouteDisplay booking={b} />
                        </td>
                        <td style={{ padding: '12px 14px', fontSize: '11px', color: c.textSecondary }}>
                          {b.travelPurpose}
                        </td>
                        <td style={{ padding: '12px 14px' }}>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: '5px',
                            background: sc.bg, color: sc.text,
                            fontSize: '9px', fontWeight: 500,
                            padding: '4px 8px', borderRadius: '3px',
                          }}>
                            <span className="status-dot" style={{ background: sc.dot }} />
                            {b.status}
                          </span>
                        </td>
                        <td style={{ padding: '12px 14px', fontSize: '11px', fontWeight: 500, color: c.text, textAlign: 'right' }}>
                          ₹{b.totalAmount?.toLocaleString()}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <i className="fas fa-suitcase" style={{ fontSize: '32px', color: c.border, marginBottom: '12px', display: 'block' }} />
                <p style={{ fontSize: '12px', color: c.textMuted, margin: '0 0 14px' }}>No bookings yet</p>
                <Link to="/flights" style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  background: c.primary, color: c.primaryFg,
                  padding: '10px 16px', fontSize: '12px', fontWeight: 500,
                  borderRadius: '4px', textDecoration: 'none',
                }}>
                  <i className="fas fa-plane" /> Book a Flight
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Chart + Quick Actions */}
        <div className="right-column">
          {/* Pie Chart */}
          <div style={{
            background: c.card,
            border: `1px solid ${c.cardBorder}`,
            borderRadius: '4px',
            padding: '20px',
            marginBottom: '20px',
          }}>
            <h6 style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: '16px',
              fontWeight: 400,
              color: c.text,
              margin: '0 0 16px',
            }}>Booking Overview</h6>
            <div style={{ maxWidth: '200px', margin: '0 auto' }}>
              <Pie data={pieData} options={{
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: { padding: 12, usePointStyle: true, font: { size: 10, family: "'IBM Plex Sans'" } }
                  }
                }
              }} />
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{
            background: c.card,
            border: `1px solid ${c.cardBorder}`,
            borderRadius: '4px',
            padding: '20px',
          }}>
            <h6 style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: '16px',
              fontWeight: 400,
              color: c.text,
              margin: '0 0 16px',
            }}>Quick Actions</h6>
            {[
              { to: '/flights', icon: 'fa-plane', label: 'Search Flights', iconBg: '#f7e1d6', iconColor: '#e86f3d' },
              { to: '/hotels', icon: 'fa-hotel', label: 'Search Hotels', iconBg: '#e8eee5', iconColor: '#627b68' },
              { to: '/bookings', icon: 'fa-list', label: 'My Bookings', iconBg: '#d5e3e6', iconColor: '#3a6b7a' },
              { to: '/support', icon: 'fa-life-ring', label: 'Get Support', iconBg: '#fef4e0', iconColor: '#f29a69' },
            ].map((action, i) => (
              <Link
                key={i}
                to={action.to}
                className="role-module"
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '12px 14px', marginBottom: '8px',
                  textDecoration: 'none',
                }}
              >
                <div style={{
                  width: '28px', height: '28px', borderRadius: '4px',
                  background: action.iconBg, display: 'grid', placeItems: 'center',
                  flexShrink: 0,
                }}>
                  <i className={`fas ${action.icon}`} style={{ color: action.iconColor, fontSize: '12px' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: '11px', fontWeight: 500, color: c.text, display: 'block' }}>
                    {action.label}
                  </span>
                </div>
                <i className="fas fa-chevron-right" style={{ color: c.textMuted, fontSize: '9px' }} />
              </Link>
            ))}
          </div>

          {/* Calendar */}
          <div style={{ marginTop: '20px' }}>
            <Calendar
              highlightDates={
                data.recentBookings
                  ?.filter(b => b.travelStartDate)
                  .map(b => new Date(b.travelStartDate))
                  .slice(0, 3) || []
              }
            />
          </div>
        </div>
      </div>
    </div>
  )
}
