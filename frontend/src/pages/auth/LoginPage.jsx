import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { useTheme } from '../../context/ThemeContext'
import api from '../../services/api'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleEnabled, setGoogleEnabled] = useState(false)
  const { login } = useAuth()
  const { addToast } = useToast()
  const { darkMode, toggleTheme } = useTheme()
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/api/auth/oauth-status')
      .then(({ data }) => setGoogleEnabled(data.googleEnabled))
      .catch(() => {})
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(email, password)
      addToast('Login successful!', 'success')
      navigate('/')
    } catch (err) {
      addToast(err.response?.data?.message || 'Login failed', 'danger')
    }
    setLoading(false)
  }

  const primary = '#e86f3d'
  const primaryFg = '#fff9f1'

  return (
    <div
      className={`login-shell ${darkMode ? 'theme-dark' : ''}`}
      style={{
        minHeight: '100vh',
        display: 'grid',
        gridTemplateColumns: '1.08fr .92fr',
        fontFamily: "'IBM Plex Sans', sans-serif",
        color: darkMode ? '#f5f1e9' : '#16231f',
        background: darkMode ? '#111a16' : '#f7f4ee',
      }}
    >
      {/* ═══════════════════════════════════════════
          LEFT PANEL — Visual hero (background image)
          ═══════════════════════════════════════════ */}
      <div
        className="login-visual"
        style={{
          color: primaryFg,
          isolation: 'isolate',
          background: '#17231f',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minHeight: '100vh',
          padding: '40px 5vw',
          display: 'flex',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Hero background image */}
        <img
          src="/images/HeroImage.png"
          alt=""
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            zIndex: 0,
          }}
        />
        {/* Gradient overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(135deg, #17231f 10%, rgba(23,35,31,0.8) 56%, rgba(23,35,31,0.44)), linear-gradient(transparent 40%, rgba(23,35,31,0.58))',
          zIndex: 1,
        }} />

        {/* Brand */}
        <div className="login-brand" style={{ zIndex: 1, position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <img src="/images/brand-icon.png" alt="" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
            <span style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: '21px',
              letterSpacing: '-0.03em',
              color: primaryFg,
            }}>
              Sunrise
            </span>
          </div>
        </div>

        {/* Hero copy */}
        <div className="login-visual-copy" style={{
          zIndex: 1,
          maxWidth: '510px',
          margin: 'auto 0',
          padding: '5vh 0',
          position: 'relative',
        }}>
          <h1 style={{
            letterSpacing: '-0.06em',
            margin: '22px 0 24px',
            fontFamily: "'DM Serif Display', serif",
            fontSize: 'clamp(52px, 6vw, 86px)',
            fontWeight: 400,
            lineHeight: 0.9,
            color: primaryFg,
          }}>
            Make every<br />
            <em style={{ color: '#f29a69', fontStyle: 'italic' }}>departure</em><br />
            count.
          </h1>
          <p style={{ color: '#c4ccc4', maxWidth: '310px', fontSize: '14px', lineHeight: 1.7 }}>
            One calm command center for every trip,<br />
            approval, and policy decision.
          </p>

          {/* Route display */}
          <div className="login-route" style={{
            color: '#f29a69',
            letterSpacing: '0.16em',
            alignItems: 'center',
            gap: '12px',
            marginTop: '65px',
            fontSize: '11px',
            display: 'flex',
          }}>
            <span>SFO</span>
            <i style={{
              background: '#f29a69',
              width: '48px',
              height: '1px',
              position: 'relative',
              display: 'inline-block',
              fontStyle: 'normal',
            }}>
              <span style={{
                background: '#f29a69',
                borderRadius: '50%',
                width: '7px',
                height: '7px',
                position: 'absolute',
                top: '-3px',
                right: 0,
              }} />
            </i>
            <span>CPH</span>
            <i style={{
              background: '#f29a69',
              width: '48px',
              height: '1px',
              position: 'relative',
              display: 'inline-block',
              fontStyle: 'normal',
            }}>
              <span style={{
                background: '#f29a69',
                borderRadius: '50%',
                width: '7px',
                height: '7px',
                position: 'absolute',
                top: '-3px',
                right: 0,
              }} />
            </i>
            <span>SIN</span>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="login-foot" style={{
          zIndex: 1,
          color: '#a3aea5',
          letterSpacing: '0.08em',
          justifyContent: 'space-between',
          fontSize: '10px',
          display: 'flex',
          position: 'relative',
        }}>
          <span>Sunrise / travel operations</span>
          <span>Est. 2026</span>
        </div>
      </div>

      {/* ═══════════════════════════════════════════
          RIGHT PANEL — Login form
          ═══════════════════════════════════════════ */}
      <div
        className="login-form-side"
        style={{
          background: darkMode ? '#111a16' : '#fcfaf6',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '34px 6vw 25px',
          display: 'flex',
          minHeight: '100vh',
        }}
      >
        {/* Top bar */}
        <div className="login-top" style={{ justifyContent: 'space-between', alignItems: 'center', display: 'flex' }}>
          <span className="login-kicker" style={{
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
            color: darkMode ? '#94a198' : '#8c958d',
            fontSize: '10px',
          }}>
            Workspace Access
          </span>
          <button
            onClick={toggleTheme}
            className="theme-toggle"
            style={{
              color: darkMode ? '#b4beb5' : '#69756d',
              alignItems: 'center',
              gap: '7px',
              padding: '7px 0',
              fontSize: '11px',
              display: 'flex',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              transition: 'color 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = primary}
            onMouseLeave={e => e.currentTarget.style.color = darkMode ? '#b4beb5' : '#69756d'}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {darkMode ? (
                <>
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
                </>
              ) : (
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              )}
            </svg>
            Dark mode
          </button>
        </div>

        {/* Form area — centered */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          {/* Mobile-only brand */}
          <div className="login-mobile-brand" style={{ textAlign: 'center', marginBottom: '35px', display: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <img src="/images/brand-icon.png" alt="" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
              <span style={{
                fontFamily: "'DM Serif Display', serif",
                fontSize: '21px',
                letterSpacing: '-0.03em',
                color: darkMode ? '#f5f1e9' : '#16231f',
              }}>Sunrise</span>
            </div>
          </div>

          <div className="login-form-wrap" style={{ width: '100%', maxWidth: '390px' }}>
            {/* Heading */}
            <h2 style={{
              letterSpacing: '-0.05em',
              margin: '18px 0 13px',
              fontFamily: "'DM Serif Display', serif",
              fontSize: '52px',
              fontWeight: 400,
              lineHeight: 0.92,
              color: darkMode ? '#f5f1e9' : '#16231f',
            }}>
              Sign in to<br />
              <em style={{ color: primary, fontStyle: 'italic' }}>Sunrise.</em>
            </h2>

            <p className="login-intro" style={{
              color: darkMode ? '#94a198' : '#78827a',
              margin: '0 0 31px',
              fontSize: '13px',
            }}>
              Bring your next move into focus.
            </p>

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ flexDirection: 'column', gap: '17px', display: 'flex' }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '11px',
                  color: darkMode ? '#94a198' : '#5f6b63',
                }}>Work email</label>
                <input
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '13px',
                    fontSize: '12px',
                    fontFamily: "'IBM Plex Sans', sans-serif",
                    border: `1px solid ${darkMode ? '#304139' : '#e3ded3'}`,
                    borderRadius: '4px',
                    backgroundColor: darkMode ? '#1b2822' : '#f4f0e9',
                    color: darkMode ? '#f5f1e9' : '#16231f',
                    outline: 'none',
                    marginTop: '8px',
                    transition: 'border-color 0.18s, box-shadow 0.18s',
                  }}
                  onFocus={(e) => { e.target.style.borderColor = primary; e.target.style.boxShadow = `0 0 0 3px ${primary}18` }}
                  onBlur={(e) => { e.target.style.borderColor = darkMode ? '#304139' : '#e3ded3'; e.target.style.boxShadow = 'none' }}
                />
              </div>

              <div className="password-wrap" style={{ position: 'relative' }}>
                <label style={{
                  display: 'block',
                  fontSize: '11px',
                  color: darkMode ? '#94a198' : '#5f6b63',
                }}>Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '13px 38px 13px 13px',
                    fontSize: '12px',
                    fontFamily: "'IBM Plex Sans', sans-serif",
                    border: `1px solid ${darkMode ? '#304139' : '#e3ded3'}`,
                    borderRadius: '4px',
                    backgroundColor: darkMode ? '#1b2822' : '#f4f0e9',
                    color: darkMode ? '#f5f1e9' : '#16231f',
                    outline: 'none',
                    marginTop: '8px',
                    transition: 'border-color 0.18s, box-shadow 0.18s',
                  }}
                  onFocus={(e) => { e.target.style.borderColor = primary; e.target.style.boxShadow = `0 0 0 3px ${primary}18` }}
                  onBlur={(e) => { e.target.style.borderColor = darkMode ? '#304139' : '#e3ded3'; e.target.style.boxShadow = 'none' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '13px',
                    bottom: '12px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: darkMode ? '#6f7e74' : '#a0a9a1',
                    padding: 0,
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    {showPassword ? (
                      <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>
                    ) : (
                      <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></>
                    )}
                  </svg>
                </button>
              </div>

              <div className="form-row" style={{ justifyContent: 'space-between', alignItems: 'center', marginTop: '-2px', display: 'flex' }}>
                <label className="check-row" style={{
                  fontSize: '10px',
                  color: darkMode ? '#94a198' : '#7c877f',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                }}>
                  <input type="checkbox" style={{ accentColor: primary, cursor: 'pointer', width: '14px', height: '14px' }} />
                  Remember me
                </label>
                <Link to="/auth/forgot-password" className="forgot" style={{ color: primary, padding: 0, fontSize: '10px' }}>
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="login-button"
                style={{
                  width: '100%',
                  color: primaryFg,
                  background: primary,
                  border: 'none',
                  borderRadius: '4px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '9px',
                  marginTop: '3px',
                  padding: '14px',
                  fontSize: '12px',
                  fontWeight: 600,
                  fontFamily: "'IBM Plex Sans', sans-serif",
                  letterSpacing: '0.01em',
                  transition: 'transform 0.16s cubic-bezier(.23,1,.32,1), box-shadow 0.2s',
                }}
                onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(232,111,61,0.4)' } }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}
              >
                {loading ? (
                  <><span className="spinner-border spinner-border-sm" /> Signing in...</>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                      <polyline points="10 17 15 12 10 7" />
                      <line x1="15" y1="12" x2="3" y2="12" />
                    </svg>
                    Sign in to workspace
                  </>
                )}
              </button>
            </form>

            <div className="login-divider" style={{
              color: darkMode ? '#94a198' : '#a2aaa3',
              alignItems: 'center',
              gap: '10px',
              margin: '24px 0 17px',
              fontSize: '10px',
              display: 'flex',
            }}>
              <span style={{ flex: 1, height: '1px', background: darkMode ? '#304139' : '#e3ded3' }} />
              or
              <span style={{ flex: 1, height: '1px', background: darkMode ? '#304139' : '#e3ded3' }} />
            </div>

            {googleEnabled && (
              <button
                className="sso-button"
                onClick={() => { window.location.href = `${api.defaults.baseURL}/oauth2/authorization/google` }}
                style={{
                  color: darkMode ? '#d8e0d8' : '#425048',
                  border: `1px solid ${darkMode ? '#304139' : '#dcd7ce'}`,
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '10px',
                  width: '100%',
                  padding: '12px',
                  fontSize: '11px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  display: 'flex',
                  background: 'transparent',
                  transition: 'background 0.2s, border-color 0.2s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = darkMode ? '#1b2822' : '#f4f0e9'; e.currentTarget.style.borderColor = darkMode ? '#304139' : '#c9c2b7' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = darkMode ? '#304139' : '#dcd7ce' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google SSO
              </button>
            )}

            <p className="login-caption" style={{
              color: darkMode ? '#94a198' : '#a0a8a0',
              textAlign: 'center',
              margin: '22px 20px 0',
              fontSize: '9px',
              lineHeight: 1.6,
            }}>
              By continuing, you agree to your company's<br />
              travel policy and workspace terms.
            </p>

            <div style={{
              textAlign: 'center',
              marginTop: '18px',
              fontSize: '11px',
              color: darkMode ? '#94a198' : '#78827a',
            }}>
              Don't have an account?{' '}
              <Link to="/register" style={{ color: primary, fontWeight: 500, textDecoration: 'none' }}>
                Create one
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom help */}
        <div className="login-help" style={{
          color: darkMode ? '#94a198' : '#909990',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '5px',
          fontSize: '10px',
          display: 'flex',
        }}>
          Need help signing in?{' '}
          <a href="mailto:support@sunrise.com" style={{ color: primary, textDecoration: 'none', fontWeight: 500 }}>
            Contact support
          </a>
        </div>
      </div>

      {/* Responsive */}
      <style>{`
        @media (max-width: 700px) {
          .login-shell {
            display: block !important;
          }
          .login-visual {
            min-height: 310px !important;
            padding: 25px 22px !important;
          }
          .login-brand { display: none !important; }
          .login-visual-copy {
            margin: auto 0 0 !important;
            padding: 20px 0 0 !important;
          }
          .login-visual-copy h1 {
            margin: 15px 0 12px !important;
            font-size: 48px !important;
          }
          .login-visual-copy p { display: none !important; }
          .login-route { margin-top: 26px !important; }
          .login-foot { font-size: 9px !important; }
          .login-form-side {
            min-height: calc(100vh - 310px) !important;
            padding: 24px 22px 20px !important;
          }
          .login-top { margin-bottom: 30px !important; }
          .login-mobile-brand {
            color: #16231f !important;
            margin-bottom: 35px !important;
            display: block !important;
          }
          .login-form-wrap h2 { font-size: 44px !important; }
          .theme-dark .login-mobile-brand { color: #f5f1e9 !important; }
        }
      `}</style>
    </div>
  )
}
