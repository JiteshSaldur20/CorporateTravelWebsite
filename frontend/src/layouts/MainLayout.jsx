import { Outlet, useNavigate } from 'react-router-dom'
import { Dropdown, Button } from 'react-bootstrap'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import useColors from '../hooks/useColors'
import { useState, useEffect, useRef } from 'react'
import api from '../services/api'
import Sidebar from './Sidebar'

const NOTIF_ICONS = {
  BOOKING_SUBMITTED: 'fa-paper-plane',
  BOOKING_APPROVED: 'fa-check-circle',
  BOOKING_REJECTED: 'fa-times-circle',
  PAYMENT_SUCCESS: 'fa-credit-card',
  PAYMENT_FAILED: 'fa-credit-card',
  BOOKING_TICKETED: 'fa-ticket-alt',
  BOOKING_CANCELLED: 'fa-ban',
  SUPPORT_TICKET_CREATED: 'fa-life-ring',
  SUPPORT_TICKET_REPLY: 'fa-reply',
  SUPPORT_TICKET_STATUS_CHANGED: 'fa-exchange-alt',
  SUPPORT_TICKET_RESOLVED: 'fa-check',
  GENERAL: 'fa-info-circle',
}

const NOTIF_ICON_COLORS = {
  BOOKING_APPROVED: '#627b68',
  BOOKING_REJECTED: '#c0392b',
  PAYMENT_SUCCESS: '#627b68',
  PAYMENT_FAILED: '#c0392b',
  BOOKING_CANCELLED: '#f29a69',
}

export default function MainLayout() {
  const { user, logout, isProfileIncomplete } = useAuth()
  const { darkMode, toggleTheme } = useTheme()
  const c = useColors()
  const navigate = useNavigate()
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifications, setNotifications] = useState([])
  const [showNotifDropdown, setShowNotifDropdown] = useState(false)
  const dropdownRef = useRef(null)

  const fetchUnread = async () => {
    try {
      const { data } = await api.get('/api/notifications/unread-count')
      setUnreadCount(data.count)
    } catch (e) {}
  }

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get('/api/notifications?page=0&size=10')
      setNotifications(data.content || [])
    } catch (e) {}
  }

  useEffect(() => {
    fetchUnread()
    const interval = setInterval(fetchUnread, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowNotifDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const toggleNotifDropdown = async () => {
    if (!showNotifDropdown) {
      await fetchNotifications()
    }
    setShowNotifDropdown(!showNotifDropdown)
  }

  const markAsRead = async (id, notification) => {
    try {
      await api.patch(`/api/notifications/${id}/read`)
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
      fetchUnread()
    } catch (e) {}

    // Navigate to relevant page based on notification type
    setShowNotifDropdown(false)
    const notifType = notification?.type
    const entityType = notification?.entityType
    const entityId = notification?.entityId

    if (notifType === 'BOOKING_SUBMITTED' || notifType === 'BOOKING_APPROVED' ||
        notifType === 'BOOKING_REJECTED' || notifType === 'BOOKING_TICKETED' ||
        notifType === 'BOOKING_CANCELLED') {
      // Booking-related: go to approval page or booking detail
      if (entityType === 'BOOKING' && entityId) {
        navigate(`/bookings/${entityId}`)
      } else {
        navigate('/bookings')
      }
    } else if (notifType === 'PAYMENT_SUCCESS' || notifType === 'PAYMENT_FAILED') {
      // Payment-related: go to booking detail (where payment info lives)
      if (entityType === 'BOOKING' && entityId) {
        navigate(`/bookings/${entityId}`)
      } else if (entityType === 'PAYMENT' && entityId) {
        try {
          const { data } = await api.get(`/api/payments/${entityId}`)
          navigate(data.bookingId ? `/bookings/${data.bookingId}` : '/bookings')
        } catch {
          navigate('/bookings')
        }
      } else {
        navigate('/admin/payments')
      }
    } else if (notifType?.startsWith('SUPPORT_TICKET')) {
      navigate('/support')
    } else if (entityType === 'BOOKING' && entityId) {
      navigate(`/bookings/${entityId}`)
    } else {
      navigate('/')
    }
  }

  const markAllRead = async () => {
    try {
      await api.patch('/api/notifications/read-all')
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      setUnreadCount(0)
    } catch (e) {}
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="d-flex" style={{ minHeight: '100vh', background: c.bg }}>
      <Sidebar />

      <div className="d-flex flex-column flex-grow-1" style={{ minWidth: 0 }}>
        {/* Top bar */}
        <div
          style={{
            backgroundColor: c.card,
            borderBottom: `1px solid ${c.border}`,
            height: '72px',
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '16px',
            flexShrink: 0,
          }}
        >
          {/* Breadcrumb */}
          <div className="d-flex align-items-center" style={{
            marginRight: 'auto',
            fontSize: '12px',
            color: c.textMuted,
            gap: '8px',
          }}>
            <i className="fas fa-home" style={{ fontSize: '11px' }} />
            <span style={{ color: c.textMuted }}>/</span>
            <span style={{ color: c.text, fontWeight: 500 }}>
              {user?.fullName || 'Dashboard'}
            </span>
          </div>

          {/* Theme toggle */}
          <Button
            variant="link"
            onClick={toggleTheme}
            style={{
              color: c.textSecondary,
              padding: '5px',
              fontSize: '14px',
              border: 'none',
              background: 'none',
            }}
          >
            <i className={`fas ${darkMode ? 'fa-sun' : 'fa-moon'}`} />
          </Button>

          {/* Notification bell */}
          <div className="position-relative" ref={dropdownRef}>
            <div
              onClick={toggleNotifDropdown}
              style={{ cursor: 'pointer', position: 'relative', padding: '5px', color: c.textSecondary }}
            >
              <i className="fas fa-bell" style={{ fontSize: '15px' }} />
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute', top: '-2px', right: '-2px',
                  width: '8px', height: '8px', borderRadius: '50%',
                  background: c.primary,
                }} />
              )}
            </div>

            {showNotifDropdown && (
              <div
                style={{
                  position: 'absolute', top: '100%', right: 0,
                  width: '360px', maxHeight: '420px', overflowY: 'auto',
                  backgroundColor: c.card,
                  border: `1px solid ${c.border}`,
                  borderRadius: '4px',
                  boxShadow: '0 12px 30px rgba(22, 35, 31, 0.1)',
                  zIndex: 1050,
                }}
              >
                <div className="d-flex justify-content-between align-items-center"
                  style={{ padding: '14px 16px', borderBottom: `1px solid ${c.border}` }}>
                  <h6 className="mb-0" style={{
                    fontFamily: "'DM Serif Display', serif",
                    fontSize: '16px',
                    fontWeight: 400,
                    letterSpacing: '-0.02em',
                    color: c.text,
                  }}>Notifications</h6>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      style={{
                        background: 'none', border: 'none', color: c.primary,
                        fontSize: '11px', cursor: 'pointer', padding: 0,
                      }}
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                {notifications.length === 0 ? (
                  <div style={{ padding: '32px 16px', textAlign: 'center', color: c.textMuted }}>
                    <i className="fas fa-bell-slash" style={{ fontSize: '24px', marginBottom: '8px', display: 'block' }} />
                    <span style={{ fontSize: '12px' }}>No notifications</span>
                  </div>
                ) : (
                  notifications.map(n => (
                    <div
                      key={n.id}
                      className="d-flex align-items-start"
                      style={{
                        padding: '12px 16px',
                        borderBottom: `1px solid ${c.borderTable}`,
                        backgroundColor: !n.read ? 'rgba(232, 111, 61, 0.06)' : 'transparent',
                        cursor: 'pointer',
                      }}
                      onClick={() => markAsRead(n.id, n)}
                    >
                      <i
                        className={`fas ${NOTIF_ICONS[n.type] || 'fa-info-circle'} me-3 mt-1`}
                        style={{
                          color: NOTIF_ICON_COLORS[n.type] || c.textSecondary,
                          fontSize: '12px',
                          width: '16px',
                          textAlign: 'center',
                        }}
                      />
                      <div className="flex-grow-1" style={{ minWidth: 0 }}>
                        <div className="d-flex justify-content-between">
                          <span style={{ fontSize: '11px', fontWeight: 500, color: c.text }}>{n.title}</span>
                          {!n.read && (
                            <span style={{
                              width: '6px', height: '6px', borderRadius: '50%',
                              background: c.primary, flexShrink: 0, marginTop: '3px',
                            }} />
                          )}
                        </div>
                        <p style={{ margin: '3px 0 0', fontSize: '11px', color: c.textSecondary, lineHeight: 1.4 }}>
                          {n.message}
                        </p>
                        <span style={{ fontSize: '9px', color: c.textMuted }}>
                          {new Date(n.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* User dropdown */}
          <Dropdown align="end">
            <Dropdown.Toggle
              variant="link"
              id="user-dropdown"
              style={{
                color: c.text,
                fontSize: '12px',
                fontWeight: 500,
                padding: '7px 0',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                border: 'none',
                background: 'none',
                textDecoration: 'none',
              }}
            >
              <div style={{
                width: '28px', height: '28px', borderRadius: '50%',
                background: c.primary, color: c.primaryFg,
                display: 'grid', placeItems: 'center',
                fontSize: '10px', fontWeight: 600,
              }}>
                {user?.fullName?.charAt(0) || 'U'}
              </div>
              <span style={{ color: c.text }}>{user?.fullName || 'User'}</span>
              <i className="fas fa-chevron-down" style={{ fontSize: '9px', color: c.textMuted }} />
            </Dropdown.Toggle>
            <Dropdown.Menu style={{
              backgroundColor: c.card,
              border: `1px solid ${c.border}`,
              borderRadius: '4px',
              boxShadow: '0 12px 30px rgba(22, 35, 31, 0.1)',
              fontSize: '12px',
              minWidth: '200px',
            }}>
              <div style={{ padding: '10px 14px', borderBottom: `1px solid ${c.borderTable}` }}>
                <div style={{ fontSize: '12px', fontWeight: 500, color: c.text }}>{user?.fullName}</div>
                <div style={{ fontSize: '10px', color: c.textMuted, marginTop: '2px' }}>{user?.email}</div>
                <div style={{ marginTop: '6px' }}>
                  {user?.roles?.map((r) => (
                    <span key={r} style={{
                      display: 'inline-block',
                      background: c.successBg,
                      color: c.success,
                      fontSize: '9px',
                      fontWeight: 500,
                      padding: '2px 7px',
                      borderRadius: '3px',
                      marginRight: '4px',
                    }}>
                      {r.replace('ROLE_', '')}
                    </span>
                  ))}
                </div>
              </div>
              <Dropdown.Item onClick={() => navigate('/profile')} style={{ fontSize: '12px', color: c.textSecondary }}>
                <i className="fas fa-user me-2" /> Profile
              </Dropdown.Item>
              <div style={{ borderTop: `1px solid ${c.borderTable}` }} />
              <Dropdown.Item onClick={handleLogout} style={{ color: c.danger, fontSize: '12px' }}>
                <i className="fas fa-sign-out-alt me-2" /> Logout
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>

        {/* Registration nudge banner */}
        {isProfileIncomplete && (
          <div style={{
            background: '#fef4e0', borderLeft: '3px solid #f29a69',
            padding: '14px 24px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <i className="fas fa-exclamation-circle" style={{ color: '#8a6d3b', fontSize: '14px' }} />
              <span style={{ fontSize: '12px', color: '#8a6d3b' }}>
                Your profile is incomplete. Please <strong>complete your registration</strong> to enable all features.
              </span>
            </div>
            <button
              onClick={() => { setShowNotifDropdown(false); navigate('/profile') }}
              style={{
                background: '#e86f3d', color: '#fff9f1',
                border: 'none', borderRadius: '4px',
                padding: '8px 14px', fontSize: '11px', fontWeight: 500,
                cursor: 'pointer', whiteSpace: 'nowrap',
              }}
            >
              <i className="fas fa-user-edit me-1" /> Complete Profile
            </button>
          </div>
        )}

        {/* Page content */}
        <main style={{ flex: 1, padding: '32px 40px', overflow: 'auto' }}>
          <Outlet />
        </main>

        {/* Footer */}
        <footer style={{
          color: c.textMuted,
          borderTop: `1px solid ${c.border}`,
          padding: '12px 40px',
          fontSize: '10px',
          letterSpacing: '0.06em',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <span>Sunrise — Corporate Travel Booking Platform © 2026</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#a4c5a9' }} />
            All systems operational
          </span>
        </footer>
      </div>
    </div>
  )
}
