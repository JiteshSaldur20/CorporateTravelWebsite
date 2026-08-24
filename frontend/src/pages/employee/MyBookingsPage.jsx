import { useState, useEffect } from 'react'
import { Card, Badge, Table, Button, Spinner } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import { useToast } from '../../context/ToastContext'
import useColors from '../../hooks/useColors'

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

const STATUS_COLORS = {
  PENDING: 'warning', APPROVED: 'success', REJECTED: 'danger',
  PAYMENT_INITIATED: 'info', PAYMENT_SUCCESS: 'primary',
  PAYMENT_FAILED: 'danger', TICKETED: 'success', CANCELLED: 'secondary'
}

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const { addToast } = useToast()
  const c = useColors()

  useEffect(() => {
    loadBookings()
  }, [])

  const loadBookings = async () => {
    try {
      const { data } = await api.get('/api/bookings/my')
      setBookings(data)
    } catch (err) {
      addToast('Failed to load bookings', 'danger')
    }
    setLoading(false)
  }

  if (loading) return <div className="text-center py-5"><Spinner animation="border" /></div>

  return (
    <div>
      <div className="d-flex justify-content-between align-items-end mb-4">
        <div>
          <div className="eyebrow" style={{ marginBottom: '4px' }}><span className="eyebrow-line" /> Bookings</div>
          <h4 style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: '28px',
            fontWeight: 400,
            letterSpacing: '-0.03em',
            color: c.text,
            margin: 0,
          }}><i className="fas fa-book me-2" style={{ color: c.primary }} />My Bookings</h4>
        </div>
        <Link to="/flights" style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          background: c.primary, color: c.primaryFg,
          padding: '10px 16px', fontSize: '12px', fontWeight: 500,
          borderRadius: '4px', textDecoration: 'none',
        }}>
          <i className="fas fa-plus" style={{ fontSize: '10px' }} /> New Booking
        </Link>
      </div>

      {bookings.length === 0 ? (
        <Card className="text-center py-5 shadow-sm">
          <Card.Body>
            <i className="fas fa-book-open fa-3x text-muted mb-3" />
            <h5>No bookings yet</h5>
            <p className="text-muted">Start by searching for flights or hotels</p>
          </Card.Body>
        </Card>
      ) : (
        <Card className="shadow-sm">
          <Card.Body className="table-responsive">
            <Table hover>
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Route/Hotel</th>
                  <th>Type</th>
                  <th>Purpose</th>
                  <th>Dates</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map(booking => (
                  <tr key={booking.id}>
                    <td><strong>{booking.bookingReference}</strong></td>
                    <td><BookingRouteDisplay booking={booking} /></td>
                    <td><Badge bg="info">{booking.type}</Badge></td>
                    <td>{booking.travelPurpose}</td>
                    <td>
                      <small>{booking.travelStartDate}</small>
                      <br /><small className="text-muted">to {booking.travelEndDate}</small>
                    </td>
                    <td><strong>₹{booking.totalAmount?.toLocaleString()}</strong></td>
                    <td><Badge bg={STATUS_COLORS[booking.status]}>{booking.status}</Badge></td>
                    <td>
                      <Button as={Link} to={`/bookings/${booking.id}`} variant="outline-primary" size="sm">
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}
    </div>
  )
}
