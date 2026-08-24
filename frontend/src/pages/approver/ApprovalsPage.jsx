import { useState, useEffect } from 'react'
import { Card, Table, Button, Badge, Modal, Form, Spinner } from 'react-bootstrap'
import api from '../../services/api'
import { useToast } from '../../context/ToastContext'
import { useNavigate } from 'react-router-dom'
import useColors from '../../hooks/useColors'

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

export default function ApprovalsPage() {
  const [pending, setPending] = useState([])
  const [loading, setLoading] = useState(true)
  const [showReject, setShowReject] = useState(false)
  const [selectedId, setSelectedId] = useState(null)
  const [rejectReason, setRejectReason] = useState('')
  const { addToast } = useToast()
  const navigate = useNavigate()
  const c = useColors()

  useEffect(() => { loadPending() }, [])

  const loadPending = async () => {
    try {
      const { data } = await api.get('/api/approvals/pending')
      setPending(data)
    } catch (e) {}
    setLoading(false)
  }

  const approve = async (id) => {
    try {
      await api.post(`/api/approvals/${id}/approve`)
      addToast('Booking approved!', 'success')
      loadPending()
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed', 'danger')
    }
  }

  const reject = async () => {
    try {
      await api.post(`/api/approvals/${selectedId}/reject`, { rejectionReason: rejectReason })
      addToast('Booking rejected', 'info')
      setShowReject(false)
      setRejectReason('')
      loadPending()
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed', 'danger')
    }
  }

  if (loading) return <div className="text-center py-5"><Spinner animation="border" /></div>

  return (
    <div>
      <div className="eyebrow" style={{ marginBottom: '4px' }}><span className="eyebrow-line" /> Approvals</div>
      <h4 style={{
        fontFamily: "'DM Serif Display', serif",
        fontSize: '28px',
        fontWeight: 400,
        letterSpacing: '-0.03em',
        color: c.text,
        margin: '6px 0 24px',
      }}><i className="fas fa-check-double me-2" style={{ color: c.primary }} />Pending Approvals</h4>

      {pending.length === 0 ? (
        <Card className="text-center py-5 shadow-sm">
          <Card.Body>
            <i className="fas fa-check-circle fa-3x text-success mb-3" />
            <h5>All caught up!</h5>
            <p className="text-muted">No pending approvals</p>
          </Card.Body>
        </Card>
      ) : (
        <div className="table-responsive">
          <Table hover className="shadow-sm">
            <thead className="table-light">
              <tr><th>Reference</th><th>Employee</th><th>Route/Hotel</th><th>Purpose</th><th>Dates</th><th>Amount</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {pending.map(b => (
                <tr key={b.id}>
                  <td><strong>{b.bookingReference}</strong></td>
                  <td>{b.employeeName}<br /><small className="text-muted">{b.employeeEmail}</small></td>
                  <td><BookingRouteDisplay booking={b} /></td>
                  <td>{b.travelPurpose}</td>
                  <td><small>{b.travelStartDate} to {b.travelEndDate}</small></td>
                  <td><strong>₹{b.totalAmount?.toLocaleString()}</strong></td>
                  <td>
                    <button
                      onClick={() => approve(b.id)}
                      style={{
                        background: c.success, color: c.primaryFg, border: 'none',
                        padding: '6px 12px', fontSize: '10px', fontWeight: 500,
                        borderRadius: '3px', cursor: 'pointer', marginRight: '6px',
                      }}
                    >
                      <i className="fas fa-check me-1" /> Approve
                    </button>
                    <button
                      onClick={() => { setSelectedId(b.id); setShowReject(true) }}
                      style={{
                        background: 'transparent', color: c.danger,
                        border: `1px solid ${c.danger}`,
                        padding: '6px 12px', fontSize: '10px', fontWeight: 500,
                        borderRadius: '3px', cursor: 'pointer',
                      }}
                    >
                      <i className="fas fa-times me-1" /> Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}

      <Modal show={showReject} onHide={() => setShowReject(false)}>
        <Modal.Header closeButton><Modal.Title>Reject Booking</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Rejection Reason *</Form.Label>
            <Form.Control as="textarea" rows={3} value={rejectReason} onChange={e => setRejectReason(e.target.value)} required />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowReject(false)}>Cancel</Button>
          <Button variant="danger" onClick={reject} disabled={!rejectReason}>Confirm Reject</Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}
