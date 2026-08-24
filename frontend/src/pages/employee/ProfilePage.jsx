import { useState, useEffect } from 'react'
import { Card, Form, Button, Row, Col, Badge, Spinner } from 'react-bootstrap'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import useColors from '../../hooks/useColors'

export default function ProfilePage() {
  const { user, loadUser } = useAuth()
  const { addToast } = useToast()
  const c = useColors()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({})

  useEffect(() => {
    api.get('/api/users/me')
      .then(r => { setProfile(r.data); setForm(r.data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      // Flatten nested employeeProfile fields into top-level fields
      // so they match the backend UpdateProfileRequest DTO
      const payload = {
        fullName: form.fullName || null,
        designation: form.employeeProfile?.designation || null,
        department: form.employeeProfile?.department || null,
        phone: form.employeeProfile?.phone || null,
        location: form.employeeProfile?.location || null,
      }
      await api.patch('/api/users/me', payload)
      // Re-fetch the profile from GET to ensure we have the latest persisted data
      const { data: freshProfile } = await api.get('/api/users/me')
      setProfile(freshProfile)
      setForm(freshProfile)
      // Refresh auth context so isProfileIncomplete / profileComplete updates
      await loadUser()
      // Check if salary band was auto-set from designation
      if (freshProfile.employeeProfile?.salaryBand && freshProfile.employeeProfile.salaryBand !== (profile?.employeeProfile?.salaryBand || '')) {
        addToast('Profile updated! Salary band auto-set to ' + freshProfile.employeeProfile.salaryBand, 'success')
      } else {
        addToast('Profile updated!', 'success')
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Update failed', 'danger')
    }
    setSaving(false)
  }

  if (loading) return <div className="text-center py-5"><Spinner animation="border" /></div>

  return (
    <div>
      <div className="eyebrow" style={{ marginBottom: '4px' }}><span className="eyebrow-line" /> Profile</div>
      <h4 style={{
        fontFamily: "'DM Serif Display', serif",
        fontSize: '28px',
        fontWeight: 400,
        letterSpacing: '-0.03em',
        color: c.text,
        margin: '6px 0 24px',
      }}><i className="fas fa-user me-2" style={{ color: c.primary }} />My Profile</h4>
      <Row>
        <Col md={4}>
          <Card className="shadow-sm text-center py-4">
            <div style={{
              width: '64px', height: '64px', borderRadius: '50%',
              background: c.primary, color: c.primaryFg,
              display: 'grid', placeItems: 'center',
              fontSize: '24px', fontWeight: 600, margin: '0 auto 12px',
            }}>
              {profile?.fullName?.charAt(0) || 'U'}
            </div>
            <h5 style={{ fontFamily: "'DM Serif Display', serif", fontWeight: 400 }}>{profile?.fullName}</h5>
            <p className="text-muted">{profile?.email}</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '4px' }}>
              {profile?.roles?.map(r => <Badge key={r} bg="info" style={{ padding: '4px 12px', borderRadius: '999px', fontSize: '11px', fontWeight: 500 }}>{r.replace('ROLE_','')}</Badge>)}
            </div>
          </Card>
        </Col>
        <Col md={8}>
          <Card className="shadow-sm">
            <Card.Body>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Full Name</Form.Label>
                    <Form.Control value={form.fullName || ''} onChange={e => setForm(p => ({...p, fullName: e.target.value}))} />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control value={profile?.email} disabled />
                  </Form.Group>
                </Col>
                {profile?.employeeProfile != null && (
                  <>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Designation</Form.Label>
                        <Form.Control value={form.employeeProfile?.designation || ''} onChange={e => setForm(p => ({...p, employeeProfile: {...p.employeeProfile, designation: e.target.value}}))} />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Department</Form.Label>
                        <Form.Control value={form.employeeProfile?.department || ''} onChange={e => setForm(p => ({...p, employeeProfile: {...p.employeeProfile, department: e.target.value}}))} />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Phone</Form.Label>
                        <Form.Control value={form.employeeProfile?.phone || ''} onChange={e => setForm(p => ({...p, employeeProfile: {...p.employeeProfile, phone: e.target.value}}))} />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Location</Form.Label>
                        <Form.Control value={form.employeeProfile?.location || ''} onChange={e => setForm(p => ({...p, employeeProfile: {...p.employeeProfile, location: e.target.value}}))} />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Salary Band</Form.Label>
                        <Form.Control value={profile.employeeProfile?.salaryBand || 'Not assigned'} disabled />
                        <small className="text-muted">Auto-set based on designation</small>
                      </Form.Group>
                    </Col>
                  </>
                )}
              </Row>
              <Button variant="primary" onClick={handleSave} disabled={saving}>
                {saving ? <span className="spinner-border spinner-border-sm me-2" /> : null}
                Save Changes
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
