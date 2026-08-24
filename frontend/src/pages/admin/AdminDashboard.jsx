import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js'
import { Pie, Bar } from 'react-chartjs-2'
import useColors from '../../hooks/useColors'
import PageHeader from '../../components/PageHeader'

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

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement)

const STATUS_STYLES = {
  PENDING: { bg: '#fef4e0', text: '#8a6d3b', dot: '#f29a69' },
  APPROVED: { bg: '#e8eee5', text: '#3d5a42', dot: '#627b68' },
  REJECTED: { bg: '#fde8e8', text: '#922b21', dot: '#c0392b' },
  TICKETED: { bg: '#f7e1d6', text: '#8a4a2e', dot: '#e86f3d' },
  CANCELLED: { bg: '#ece8df', text: '#768078', dot: '#768078' },
  PAYMENT_SUCCESS: { bg: '#d5e3e6', text: '#3a6b7a', dot: '#9bbbd0' },
  PAYMENT_INITIATED: { bg: '#d5e3e6', text: '#3a6b7a', dot: '#9bbbd0' },
  PAYMENT_FAILED: { bg: '#fde8e8', text: '#922b21', dot: '#c0392b' },
}

const STAT_CARDS = [
  { label: 'Total Users', key: 'totalUsers', icon: 'fa-users', iconBg: '#f7e1d6', iconColor: '#e86f3d' },
  { label: 'Total Bookings', key: 'totalBookings', icon: 'fa-suitcase', iconBg: '#fef4e0', iconColor: '#f29a69' },
  { label: 'Pending Approvals', key: 'pendingApprovals', icon: 'fa-clock', iconBg: '#d5e3e6', iconColor: '#9bbbd0' },
  { label: 'Cancelled', key: 'cancelledBookings', icon: 'fa-times-circle', iconBg: '#ece8df', iconColor: '#768078' },
]

export default function AdminDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/api/dashboard/admin')
      .then(r => { setData(r.data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return <div style={{ textAlign: 'center', padding: '60px 0' }}><div className="spinner-border" /></div>
  const c = useColors()

  if (!data) return <div style={{ textAlign: 'center', padding: '60px 0', color: c.textMuted }}>Failed to load dashboard</div>

  const statusPieData = {
    labels: Object.keys(data.bookingStatusDistribution || {}),
    datasets: [{
      data: Object.values(data.bookingStatusDistribution || {}),
      backgroundColor: ['#f29a69', '#627b68', '#c0392b', '#e86f3d', '#768078', '#9bbbd0'],
      borderWidth: 0, hoverOffset: 8
    }]
  }

  const purposeBarData = {
    labels: Object.keys(data.travelPurposeDistribution || {}).slice(0, 6),
    datasets: [{
      label: 'Bookings',
      data: Object.values(data.travelPurposeDistribution || {}).slice(0, 6),
      backgroundColor: '#e86f3d',
      borderRadius: 4, borderSkipped: false,
    }]
  }

  return (
    <div className="animate-in">
      {/* Hero Banner */}
      <div style={{
        background: c.dark, borderRadius: '4px',
        padding: '32px 36px', marginBottom: '24px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div>
          <div className="eyebrow" style={{ color: c.textLight, marginBottom: '4px' }}><span className="eyebrow-line" /> Admin</div>
          <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '32px', fontWeight: 400, letterSpacing: '-0.04em', color: c.primaryFg, margin: '8px 0 4px', lineHeight: 0.94 }}>
            Admin Dashboard
          </h2>
          <p style={{ color: c.textHero, fontSize: '13px', margin: 0 }}>Overview of corporate travel operations</p>
        </div>
        <div style={{ textAlign: 'right', borderLeft: '1px solid #f29a69', paddingLeft: '14px' }}>
          <span style={{ fontSize: '10px', color: c.textLight, display: 'block' }}>Total Company Spend</span>
          <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: '28px', fontWeight: 400, color: c.primaryFg, display: 'block', lineHeight: 1.1 }}>
            ₹{(data.totalSpend || 0).toLocaleString()}
          </span>
        </div>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
        {STAT_CARDS.map((stat, i) => (
          <div key={i} className="stat-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div className="stat-label">{stat.label}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginTop: '12px' }}>
              <span className="stat-value">{data[stat.key] || 0}</span>
              <div style={{ width: '36px', height: '36px', borderRadius: '4px', background: stat.iconBg, display: 'grid', placeItems: 'center' }}>
                <i className={`fas ${stat.icon}`} style={{ color: stat.iconColor, fontSize: '14px' }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
        {[
          { label: "Today's Bookings", value: data.todayBookings || 0, icon: 'fa-calendar-day', iconBg: '#e8eee5', iconColor: '#627b68' },
          { label: 'Monthly Spend', value: `₹${(data.monthlySpend || 0).toLocaleString()}`, icon: 'fa-calendar', iconBg: '#f7e1d6', iconColor: '#e86f3d' },
          { label: 'Most Travelled', value: data.mostTravelledCity || 'N/A', icon: 'fa-map-marker-alt', iconBg: '#d5e3e6', iconColor: '#9bbbd0' },
          { label: 'Pending Approvals', value: data.pendingApprovals || 0, icon: 'fa-clock', iconBg: '#fef4e0', iconColor: '#f29a69' },
        ].map((stat, i) => (
          <div key={i} className="stat-card" style={{ display: 'flex', alignItems: 'center', gap: '14px', minHeight: '80px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '4px', background: stat.iconBg, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
              <i className={`fas ${stat.icon}`} style={{ color: stat.iconColor, fontSize: '16px' }} />
            </div>
            <div>
              <span style={{ fontSize: '16px', fontWeight: 500, color: c.text, display: 'block' }}>{stat.value}</span>
              <span style={{ fontSize: '10px', color: c.textMuted }}>{stat.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: c.card, border: `1px solid ${c.cardBorder}`, borderRadius: '4px', padding: '20px' }}>
          <h6 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '16px', fontWeight: 400, color: c.text, margin: '0 0 16px' }}>
            <i className="fas fa-chart-pie me-2" style={{ color: c.primary }} />Booking Status Distribution
          </h6>
          <div style={{ maxWidth: '260px', margin: '0 auto' }}>
            <Pie data={statusPieData} options={{ plugins: { legend: { position: 'bottom', labels: { padding: 12, usePointStyle: true, font: { size: 10, family: "'IBM Plex Sans'" } } } } }} />
          </div>
        </div>
        <div style={{ background: c.card, border: `1px solid ${c.cardBorder}`, borderRadius: '4px', padding: '20px' }}>
          <h6 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '16px', fontWeight: 400, color: c.text, margin: '0 0 16px' }}>
            <i className="fas fa-chart-bar me-2" style={{ color: c.success }} />Travel Purpose Distribution
          </h6>
          <Bar data={purposeBarData} options={{
            indexAxis: 'y',
            plugins: { legend: { display: false } },
            scales: { x: { grid: { display: false } }, y: { grid: { display: false } } }
          }} />
        </div>
      </div>

      {/* Recent Bookings Table */}
      <div style={{ background: c.card, border: `1px solid ${c.cardBorder}`, borderRadius: '4px', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: `1px solid ${c.cardBorder}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h6 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '16px', fontWeight: 400, color: c.text, margin: 0 }}>
            <i className="fas fa-history me-2" style={{ color: c.primary }} />Recent Bookings
          </h6>
          <span style={{ fontSize: '10px', color: c.textMuted }}>{data.recentBookings?.length || 0} bookings</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="table align-middle mb-0">
            <thead>
              <tr>
                {['Reference', 'Employee', 'Route/Hotel', 'Purpose', 'Status', 'Amount'].map(h => (
                  <th key={h} style={{
                    background: c.bg, borderBottom: `1px solid ${c.border}`,
                    fontSize: '9px', fontWeight: 600, textTransform: 'uppercase',
                    letterSpacing: '0.1em', color: c.textMuted, padding: '10px 14px',
                    ...(h === 'Amount' ? { textAlign: 'right' } : {}),
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.recentBookings?.map(b => {
                const sc = STATUS_STYLES[b.status] || STATUS_STYLES.PENDING
                return (
                  <tr key={b.id} style={{ cursor: 'pointer', borderBottom: '1px solid #eee9df' }}
                    onClick={() => window.location.href = `/bookings/${b.id}`}>
                    <td style={{ padding: '12px 14px', fontSize: '11px', fontWeight: 500, color: c.text }}>{b.bookingReference}</td>
                    <td style={{ padding: '12px 14px', fontSize: '11px', color: c.textSecondary }}>{b.employeeName}</td>
                    <td style={{ padding: '12px 14px', fontSize: '11px', color: c.textSecondary }}>
                      <BookingRouteDisplay booking={b} />
                    </td>
                    <td style={{ padding: '12px 14px', fontSize: '11px', color: c.textSecondary }}>{b.travelPurpose}</td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '5px',
                        background: sc.bg, color: sc.text,
                        fontSize: '9px', fontWeight: 500, padding: '4px 8px', borderRadius: '3px',
                      }}>
                        <span className="status-dot" style={{ background: sc.dot }} />{b.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px', fontSize: '11px', fontWeight: 500, color: c.text, textAlign: 'right' }}>₹{b.totalAmount?.toLocaleString()}</td>
                  </tr>
                )
              })}
              {!data.recentBookings?.length && (
                <tr><td colSpan="6" className="text-center" style={{ padding: '24px', color: c.textMuted, fontSize: '11px' }}>No recent bookings</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
