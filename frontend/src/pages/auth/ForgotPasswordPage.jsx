import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Container, Card, Form, Button, Alert } from 'react-bootstrap'
import api from '../../services/api'
import { useToast } from '../../context/ToastContext'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const { addToast } = useToast()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/api/auth/forgot-password', { email })
      setSent(true)
      addToast('If an account exists, a reset link has been sent', 'info')
    } catch (err) {
      addToast('If an account exists, a reset link has been sent', 'info')
      setSent(true)
    }
    setLoading(false)
  }

  return (
    <Container className="d-flex align-items-center justify-content-center min-vh-100">
      <Card className="shadow" style={{ width: '420px' }}>
        <Card.Body className="p-4">
          <h4 className="text-center mb-4">Reset Password</h4>
          {sent ? (
            <Alert variant="success">
              <i className="fas fa-check-circle me-2" />
              If an account with that email exists, a reset link has been sent.
              <div className="mt-3">
                <Link to="/login" className="btn btn-outline-primary btn-sm">Back to Login</Link>
              </div>
            </Alert>
          ) : (
            <Form onSubmit={handleSubmit}>
              <p className="text-muted mb-3">Enter your email to receive a password reset link.</p>
              <Form.Group className="mb-3">
                <Form.Label>Email address</Form.Label>
                <Form.Control type="email" value={email} onChange={e => setEmail(e.target.value)} required />
              </Form.Group>
              <Button variant="primary" type="submit" className="w-100" disabled={loading}>
                {loading ? <span className="spinner-border spinner-border-sm me-2" /> : null}
                Send Reset Link
              </Button>
              <div className="text-center mt-3">
                <Link to="/login" className="text-decoration-none">Back to Login</Link>
              </div>
            </Form>
          )}
        </Card.Body>
      </Card>
    </Container>
  )
}
