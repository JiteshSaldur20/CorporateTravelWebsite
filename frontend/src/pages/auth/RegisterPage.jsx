import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Container, Card, Form, Button, Row, Col } from 'react-bootstrap'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'

export default function RegisterPage() {
  const [form, setForm] = useState({
    fullName: '', email: '', password: '', confirmPassword: '',
    employeeId: '', designation: '', department: '', location: '', phone: ''
  })
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const { addToast } = useToast()
  const navigate = useNavigate()

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirmPassword) {
      addToast('Passwords do not match', 'danger')
      return
    }
    setLoading(true)
    try {
      const { confirmPassword, ...data } = form
      await register(data)
      addToast('Registration successful!', 'success')
      navigate('/')
    } catch (err) {
      addToast(err.response?.data?.message || 'Registration failed', 'danger')
    }
    setLoading(false)
  }

  return (
    <Container className="d-flex align-items-center justify-content-center py-5">
      <Card className="shadow" style={{ width: '600px' }}>
        <Card.Body className="p-4">
          <div className="text-center mb-4">
            <i className="fas fa-sun fa-3x text-warning mb-2" />
            <h3>Create Account</h3>
            <p className="text-muted">Join Sunrise</p>
          </div>

          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Full Name *</Form.Label>
                  <Form.Control name="fullName" value={form.fullName} onChange={handleChange} required />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Email *</Form.Label>
                  <Form.Control type="email" name="email" value={form.email} onChange={handleChange} required />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Employee ID</Form.Label>
                  <Form.Control name="employeeId" value={form.employeeId} onChange={handleChange} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Password *</Form.Label>
                  <Form.Control type="password" name="password" value={form.password} onChange={handleChange} required minLength={8} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Confirm Password *</Form.Label>
                  <Form.Control type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} required />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Designation</Form.Label>
                  <Form.Control name="designation" value={form.designation} onChange={handleChange} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Department</Form.Label>
                  <Form.Control name="department" value={form.department} onChange={handleChange} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Location</Form.Label>
                  <Form.Control name="location" value={form.location} onChange={handleChange} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Phone</Form.Label>
                  <Form.Control name="phone" value={form.phone} onChange={handleChange} />
                </Form.Group>
              </Col>
            </Row>

            <Button variant="primary" type="submit" className="w-100 mb-3" disabled={loading}>
              {loading ? <><span className="spinner-border spinner-border-sm me-2" /> Creating Account...</> : 'Create Account'}
            </Button>

            <div className="text-center">
              <span className="text-muted">Already have an account? </span>
              <Link to="/login" className="text-decoration-none">Sign In</Link>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  )
}
