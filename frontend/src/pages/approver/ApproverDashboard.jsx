import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Pie } from 'react-chartjs-2'
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

ChartJS.register(ArcElement, Tooltip, Legend)

export default function ApproverDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/api/dashboard/approver').then(r => { setData(r.data); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  if (loading) return <div style={{ textAlign: 'center', padding: '60px 0' }}><div className="spinner-border" /></div>
  const c = useColors()

  if (!data) return <div style={{ textAlign: 'center', padding: '60px 0', color: c.textMuted }}>Failed to load</div>

  const pieData = {
    labels: Object.keys(data.travelPurposeDistribution || {}),
    datasets: [{
      data: Object.values(data.travelPurposeDistribution || {}),
      backgroundColor: ['#e86f3d', '#627b68', '#f29a69', '#c0392b', '#9bbbd0', '#768078'],
      borderWidth: 0, hoverOffset: 8,
    }]
  }

  return (
    <div className="animate-in">
      <PageHeader section="Approver" title="Approver Dashboard" icon="fa-chart-line" />

      {/* Hero */}
      <div style={{
        background: c.dark, borderRadius: '4px',
        padding: '24px 28px', marginBottom: '24px',
        display: 'flex', gap: '32px', alignItems: 'center',
      }}>
        <div style={{ flex: 1, textAlign: 'center', borderRight: `1px solid ${c.darkBorder}`, paddingRight: '32px' }}>
          <span style={{ fontSize: '10px', color: c.textMuted, textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '4px' }}>Pending Approvals</span>
          <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: '32px', fontWeight: 400, color: '#f29a69', display: 'block' }}>{data.pendingApprovals}</span>
        </div>
        <div style={{ flex: 1, textAlign: 'center', borderRight: `1px solid ${c.darkBorder}`, paddingRight: '32px' }}>
          <span style={{ fontSize: '10px', color: c.textMuted, textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '4px' }}>Total Approved</span>
          <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: '32px', fontWeight: 400, color: '#627b68', display: 'block' }}>{data.totalApproved}</span>
        </div>
        <div style={{ flex: 1, textAlign: 'center', borderRight: `1px solid ${c.darkBorder}`, paddingRight: '32px' }}>
          <span style={{ fontSize: '10px', color: c.textMuted, textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '4px' }}>Total Rejected</span>
          <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: '32px', fontWeight: 400, color: '#c0392b', display: 'block' }}>{data.totalRejected}</span>
        </div>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <span style={{ fontSize: '10px', color: c.textMuted, textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '4px' }}>Team Spend</span>
          <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: '32px', fontWeight: 400, color: c.primary, display: 'block' }}>₹{data.teamSpend?.toLocaleString() || 0}</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '24px' }}>
        {/* Pending Approvals */}
        <div style={{ background: c.card, border: `1px solid ${c.cardBorder}`, borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: `1px solid ${c.cardBorder}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h6 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '16px', fontWeight: 400, color: c.text, margin: 0 }}>Pending Approvals</h6>
            <Link to="/approvals" className="view-all-link">View All <span>→</span></Link>
          </div>
          <div style={{ padding: '8px 0' }}>
            {data.pendingBookings?.length > 0 ? (
              data.pendingBookings.slice(0, 5).map(b => (
                <div key={b.id} style={{
                  padding: '12px 20px', borderBottom: `1px solid ${c.borderTable}`,
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  cursor: 'pointer', transition: 'background 0.15s ease',
                }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(232,111,61,0.04)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <div>
                    <span style={{ fontSize: '11px', fontWeight: 500, color: c.text }}>{b.bookingReference}</span>
                    <span style={{ fontSize: '10px', color: c.textMuted, marginLeft: '8px' }}>{b.employeeName}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <BookingRouteDisplay booking={b} />
                    <br />
                    <span style={{ fontSize: '11px', fontWeight: 500, color: c.text }}>₹{b.totalAmount?.toLocaleString()}</span>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '32px', color: c.textMuted, fontSize: '12px' }}>No pending approvals</div>
            )}
          </div>
        </div>

        {/* Chart */}
        <div style={{ background: c.card, border: `1px solid ${c.cardBorder}`, borderRadius: '4px', padding: '20px' }}>
          <h6 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '16px', fontWeight: 400, color: c.text, margin: '0 0 16px' }}>Travel Purpose Distribution</h6>
          <div style={{ maxWidth: '280px', margin: '0 auto' }}>
            <Pie data={pieData} options={{ plugins: { legend: { position: 'bottom', labels: { padding: 10, usePointStyle: true, font: { size: 10, family: "'IBM Plex Sans'" } } } } }} />
          </div>
        </div>
      </div>
    </div>
  )
}
