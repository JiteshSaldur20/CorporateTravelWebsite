import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Container, Card, Form, Button, Alert } from 'react-bootstrap'
import api from '../../services/api'
import { useToast } from '../../context/ToastContext'

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const { addToast } = useToast()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      addToast('Passwords do not match', 'danger')
      return
    }
    setLoading(true)
    try {
      await api.post('/api/auth/reset-password', { token, newPassword })
      setSuccess(true)
      addToast('Password reset successful!', 'success')
    } catch (err) {
      addToast(err.response?.data?.message || 'Reset failed', 'danger')
    }
    setLoading(false)
  }

  if (!token) return <Container className="py-5"><Alert variant="danger">Invalid reset link</Alert></Container>

  return (
    <Container className="d-flex align-items-center justify-content-center min-vh-100">
      <Card className="shadow" style={{ width: '420px' }}>
        <Card.Body className="p-4">
          <h4 className="text-center mb-4">Set New Password</h4>
          {success ? (
            <Alert variant="success">
              <i className="fas fa-check-circle me-2" />
              Password has been reset successfully!
              <div className="mt-3"><Link to="/login" className="btn btn-primary btn-sm">Go to Login</Link></div>
            </Alert>
          ) : (
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>New Password</Form.Label>
                <Form.Control type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={8} />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Confirm Password</Form.Label>
                <Form.Control type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
              </Form.Group>
              <Button variant="primary" type="submit" className="w-100" disabled={loading}>
                {loading ? <span className="spinner-border spinner-border-sm me-2" /> : null}
                Reset Password
              </Button>
            </Form>
          )}
        </Card.Body>
      </Card>
    </Container>
  )
}
