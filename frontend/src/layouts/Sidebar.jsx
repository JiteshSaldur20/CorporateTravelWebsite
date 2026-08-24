import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

const SUPPORT_PHONE = '+91-1800-123-4567'

export default function Sidebar() {
  const { user, hasRole } = useAuth()
  const { darkMode } = useTheme()
  const location = useLocation()
  const navigate = useNavigate()

  const isActive = (path) => location.pathname === path

  const navItems = [
    { path: '/flights', icon: 'fa-plane', label: 'Flights' },
    { path: '/hotels', icon: 'fa-hotel', label: 'Hotels' },
    { path: '/bookings', icon: 'fa-book', label: 'My Bookings' },
    { path: '/support', icon: 'fa-life-ring', label: 'Support' },
    { path: '/policies', icon: 'fa-file-alt', label: 'Travel Policy' },
    { path: '/profile', icon: 'fa-user', label: 'Profile' },
  ]

  const approverItems = [
    { path: '/approvals', icon: 'fa-check-double', label: 'Approvals' },
    { path: '/approver-dashboard', icon: 'fa-chart-line', label: 'Approver Dashboard' },
  ]

  const adminItems = [
    { path: '/admin/dashboard', icon: 'fa-tachometer-alt', label: 'Admin Dashboard' },
    { path: '/admin/payments', icon: 'fa-credit-card', label: 'Payments' },
    { path: '/admin/audit', icon: 'fa-clipboard-list', label: 'Audit' },
    { path: '/admin/support', icon: 'fa-headset', label: 'Support Admin' },
    { path: '/admin/policies', icon: 'fa-file-alt', label: 'Policy Manager' },
  ]

  const SectionLabel = ({ children }) => (
    <li className="nav-item mt-4 mb-2 px-3">
      <span className="section-label" style={{
        color: '#718078',
        textTransform: 'uppercase',
        letterSpacing: '0.16em',
        fontSize: '10px',
        display: 'block',
        padding: '0',
      }}>
        {children}
      </span>
    </li>
  )

  const NavItem = ({ item }) => {
    const active = isActive(item.path)
    return (
      <li className="nav-item mb-1" key={item.path}>
        <Link
          to={item.path}
          className="nav-link d-flex align-items-center"
          style={{
            color: active ? '#fff9f1' : '#abb6ad',
            backgroundColor: active ? '#273731' : 'transparent',
            boxShadow: active ? 'inset 3px 0 #e86f3d' : 'none',
            borderRadius: '4px',
            padding: '10px 12px',
            fontSize: '13px',
            fontWeight: active ? 500 : 400,
            transition: 'background 0.2s ease, color 0.2s ease',
          }}
          onMouseEnter={(e) => {
            if (!active) {
              e.currentTarget.style.backgroundColor = '#273731'
              e.currentTarget.style.color = '#fff9f1'
            }
          }}
          onMouseLeave={(e) => {
            if (!active) {
              e.currentTarget.style.backgroundColor = 'transparent'
              e.currentTarget.style.color = '#abb6ad'
            }
          }}
        >
          <i className={`fas ${item.icon} me-3`} style={{ width: '20px', textAlign: 'center', fontSize: '13px' }} />
          {item.label}
        </Link>
      </li>
    )
  }

  return (
    <div
      className="d-flex flex-column"
      style={{
        width: '238px',
        minWidth: '238px',
        minHeight: '100vh',
        background: '#17231f',
        color: '#abb6ad',
        flexShrink: 0,
        position: 'sticky',
        top: 0,
        height: '100vh',
        overflow: 'hidden',
      }}
    >
      {/* Brand */}
      <div style={{ padding: '28px 18px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/" className="d-flex align-items-center text-decoration-none" style={{ gap: '8px' }}>
          <img src="/images/brand-icon.png" alt="Sunrise" style={{ width: '31px', height: '31px', objectFit: 'contain' }} />
          <span style={{
            fontFamily: "'DM Serif Display', Georgia, serif",
            fontSize: '21px',
            color: '#fff9f1',
            letterSpacing: '-0.03em',
            fontWeight: 400,
          }}>
            Sunrise
          </span>
        </Link>
      </div>

      {/* Workspace label */}
      <div style={{
        color: '#a6b0a6',
        textTransform: 'uppercase',
        letterSpacing: '0.15em',
        fontSize: '10px',
        padding: '0 11px 15px',
        marginTop: '8px',
      }}>
        Corporate Travel
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '0 8px' }}>
        <ul className="nav flex-column" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {navItems.map((item) => (
            <NavItem key={item.path} item={item} />
          ))}

          {/* Approver Section */}
          {hasRole('MANAGER') && (
            <>
              <div style={{ borderTop: '1px solid #324039', margin: '16px 0' }} />
              <SectionLabel>Approver</SectionLabel>
              {approverItems.map((item) => (
                <NavItem key={item.path} item={item} />
              ))}
            </>
          )}

          {/* Admin Section */}
          {hasRole('ADMIN') && (
            <>
              <div style={{ borderTop: '1px solid #324039', margin: '16px 0' }} />
              <SectionLabel>Admin</SectionLabel>
              {adminItems.map((item) => (
                <NavItem key={item.path} item={item} />
              ))}
            </>
          )}
        </ul>
      </nav>

      {/* Support / User bottom */}
      <div style={{ borderTop: '1px solid #324039', padding: '18px 14px 14px' }}>
        {/* Support help card */}
        <div style={{
          backgroundColor: 'rgba(255,255,255,0.06)',
          borderRadius: '4px',
          padding: '14px',
          marginBottom: '14px',
        }}>
          <div className="d-flex align-items-center mb-2" style={{ gap: '8px' }}>
            <i className="fas fa-headset" style={{ color: '#e86f3d', fontSize: '12px' }} />
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#fff9f1' }}>Need Help?</span>
          </div>
          <p style={{ fontSize: '10px', color: '#a6b0a6', margin: '0 0 10px', lineHeight: 1.5 }}>
            Contact our support team
          </p>
          <a
            href={`tel:${SUPPORT_PHONE}`}
            style={{
              color: '#fff9f1',
              fontSize: '11px',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              textDecoration: 'none',
            }}
          >
            <i className="fas fa-phone-alt" style={{ fontSize: '10px' }} />
            {SUPPORT_PHONE}
          </a>
          <span style={{ fontSize: '9px', color: '#718078', display: 'block', marginTop: '6px' }}>
            Mon–Sat, 9 AM – 8 PM IST
          </span>
        </div>

        {/* User chip */}
        <div
          className="d-flex align-items-center"
          style={{ gap: '9px', padding: '4px 4px', cursor: 'pointer' }}
          onClick={() => navigate('/profile')}
        >
          <div style={{
            width: '31px',
            height: '31px',
            borderRadius: '50%',
            background: '#e86f3d',
            color: '#fff9f1',
            display: 'grid',
            placeItems: 'center',
            fontSize: '10px',
            fontWeight: 600,
            flexShrink: 0,
          }}>
            {user?.fullName?.charAt(0) || 'U'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '12px', fontWeight: 500, color: '#fff9f1', lineHeight: 1.2 }}>
              {user?.fullName || 'User'}
            </div>
            <div style={{ fontSize: '10px', color: '#849088', marginTop: '2px' }}>
              {user?.roles?.[0]?.replace('ROLE_', '') || 'Employee'}
            </div>
          </div>
          <i className="fas fa-chevron-right" style={{ color: '#849088', fontSize: '10px' }} />
        </div>
      </div>
    </div>
  )
}
