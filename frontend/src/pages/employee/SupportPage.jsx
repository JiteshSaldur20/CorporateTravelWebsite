import { useState, useEffect } from 'react'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import useColors from '../../hooks/useColors'
import PageHeader from '../../components/PageHeader'

const CATEGORIES = ['FLIGHT', 'HOTEL', 'BOOKING', 'PAYMENT', 'CANCELLATION_REFUND', 'TECHNICAL_ISSUE', 'ACCOUNT_LOGIN', 'OTHER']
const PRIORITY_STYLES = {
  LOW: { bg: '#ece8df', text: '#768078' },
  MEDIUM: { bg: '#d5e3e6', text: '#3a6b7a' },
  HIGH: { bg: '#fef4e0', text: '#8a6d3b' },
  URGENT: { bg: '#fde8e8', text: '#922b21' },
}
const STATUS_STYLES = {
  OPEN: { bg: '#fef4e0', text: '#8a6d3b', dot: '#f29a69' },
  IN_PROGRESS: { bg: '#d5e3e6', text: '#3a6b7a', dot: '#9bbbd0' },
  WAITING_FOR_USER: { bg: '#ece8df', text: '#768078', dot: '#768078' },
  RESOLVED: { bg: '#e8eee5', text: '#3d5a42', dot: '#627b68' },
  CLOSED: { bg: '#ece8df', text: '#768078', dot: '#768078' },
}

const FAQ_ITEMS = [
  { q: 'How do I book a flight?', a: 'Navigate to Flights, search for your route, select a flight that fits your policy, and submit the booking request.' },
  { q: 'Why was my booking rejected?', a: 'Your manager may have rejected it due to policy violation, budget constraints, or other reasons. Check the rejection reason in your booking details.' },
  { q: 'How does company payment work?', a: 'After your booking is approved, the admin initiates company payment via Razorpay. You cannot pay directly.' },
  { q: 'How do I cancel a booking?', a: 'Go to My Bookings, click on the booking, and use the Cancel button if the status allows cancellation.' },
  { q: 'What if my selection exceeds policy?', a: 'The system will show a policy warning card explaining the violation and your allowed entitlement.' },
]

const ThemedBadge = ({ styles, children }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', gap: '4px',
    background: styles.bg, color: styles.text,
    fontSize: '9px', fontWeight: 500,
    padding: '3px 8px', borderRadius: '3px',
  }}>
    {styles.dot && <span className="status-dot" style={{ background: styles.dot }} />}
    {children}
  </span>
)

const inputStyle = {
  width: '100%', padding: '10px 12px', fontSize: '13px',
  border: '1px solid var(--ps-border)', borderRadius: '4px',
  backgroundColor: 'var(--ps-card)', color: 'var(--ps-text)',
  outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s',
}

export default function SupportPage() {
  const { user } = useAuth()
  const { addToast } = useToast()
  const c = useColors()
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [form, setForm] = useState({ category: '', subject: '', description: '', priority: 'MEDIUM', bookingId: '' })
  const [replyText, setReplyText] = useState('')
  const [faqSearch, setFaqSearch] = useState('')

  useEffect(() => { loadTickets() }, [])

  const loadTickets = async () => {
    try {
      const { data } = await api.get('/api/support/tickets/my')
      setTickets(data)
    } catch (e) {
      if (e.response?.status !== 401) {
        addToast(e.response?.data?.message || 'Failed to load tickets', 'danger')
      }
    }
    setLoading(false)
  }

  const createTicket = async () => {
    try {
      await api.post('/api/support/tickets', { ...form, bookingId: form.bookingId || null })
      addToast('Ticket created!', 'success')
      setShowCreate(false)
      setForm({ category: '', subject: '', description: '', priority: 'MEDIUM', bookingId: '' })
      loadTickets()
    } catch (err) { addToast(err.response?.data?.message || 'Failed', 'danger') }
  }

  const sendReply = async () => {
    if (!replyText.trim()) return
    try {
      await api.post(`/api/support/tickets/${selectedTicket.id}/messages`, { body: replyText })
      setReplyText('')
      const { data } = await api.get(`/api/support/tickets/${selectedTicket.id}`)
      setSelectedTicket(data)
      addToast('Reply sent!', 'success')
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to send reply', 'danger')
    }
  }

  const filteredFAQ = FAQ_ITEMS.filter(item =>
    item.q.toLowerCase().includes(faqSearch.toLowerCase()) ||
    item.a.toLowerCase().includes(faqSearch.toLowerCase())
  )

  return (
    <div className="animate-in">
      <PageHeader section="Support" title="Help Center" icon="fa-life-ring" />

      {/* FAQ Section */}
      <div style={{
        background: c.dark, borderRadius: '4px',
        padding: '24px', marginBottom: '24px', color: c.primaryFg,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '4px',            background: c.darkMid, display: 'grid', placeItems: 'center' }}>
            <i className="fas fa-question-circle" style={{ color: '#e86f3d', fontSize: '12px' }} />
          </div>
          <h6 style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: '16px', fontWeight: 400, color: c.primaryFg, margin: 0,
          }}>Frequently Asked Questions</h6>
        </div>
        <input
          placeholder="Search FAQ..."
          value={faqSearch}
          onChange={e => setFaqSearch(e.target.value)}
          style={{
            width: '100%', padding: '10px 14px', fontSize: '13px',
            border: `1px solid ${c.darkBorder}`, borderRadius: '4px',
            backgroundColor: c.darkMid, color: c.primaryFg,
            outline: 'none', marginBottom: '16px',
          }}
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filteredFAQ.map((item, i) => (
            <div key={i} style={{
              background: c.darkMid, borderRadius: '4px', padding: '14px 16px',
              border: `1px solid ${c.darkBorder}`,
              transition: 'border-color 0.2s ease',
            }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = c.primary}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = c.darkBorder}
            >
              <strong style={{ fontSize: '12px', color: c.primaryFg }}>{item.q}</strong>
              <p style={{ fontSize: '11px', color: c.textLight, margin: '4px 0 0', lineHeight: 1.5 }}>{item.a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tickets */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: '16px' }}>
        <div>
          <div className="eyebrow" style={{ marginBottom: '4px' }}><span className="eyebrow-line" /> Tickets</div>
          <h4 style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: '24px', fontWeight: 400, letterSpacing: '-0.03em',
            color: c.text, margin: 0,
          }}>My Tickets</h4>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          style={{
            padding: '10px 16px', fontSize: '12px', fontWeight: 500,
            background: c.primary, color: c.primaryFg, border: 'none',
            borderRadius: '4px', cursor: 'pointer',
            transition: 'transform 0.16s ease, box-shadow 0.2s ease',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(232,111,61,0.3)' }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}
        >
          <i className="fas fa-plus me-1" /> Create Ticket
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}><div className="spinner-border" /></div>
      ) : tickets.length === 0 ? (
        <div className="empty-state">
          <i className="fas fa-ticket-alt" style={{ fontSize: '36px' }} />
          <p>No tickets yet</p>
        </div>
      ) : (
        <div style={{
          background: c.card, border: `1px solid ${c.cardBorder}`,
          borderRadius: '4px', overflow: 'hidden',
        }}>
          <table className="table align-middle mb-0">
            <thead>
              <tr>
                {['ID', 'Subject', 'Category', 'Priority', 'Status', 'Created'].map(h => (
                  <th key={h} style={{
                    background: c.bg, borderBottom: `1px solid ${c.border}`,
                    fontSize: '9px', fontWeight: 600, textTransform: 'uppercase',
                    letterSpacing: '0.1em', color: c.textMuted, padding: '10px 14px',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tickets.map(t => (
                <tr key={t.id} style={{ cursor: 'pointer', borderBottom: '1px solid #eee9df' }}
                  onClick={() => setSelectedTicket(t)}>
                  <td style={{ padding: '12px 14px', fontSize: '11px', fontWeight: 500, color: c.primary }}>#{t.id}</td>
                  <td style={{ padding: '12px 14px', fontSize: '11px', fontWeight: 500, color: c.text }}>{t.subject}</td>
                  <td style={{ padding: '12px 14px' }}><ThemedBadge styles={{ bg: '#ece8df', text: '#768078' }}>{t.category}</ThemedBadge></td>
                  <td style={{ padding: '12px 14px' }}><ThemedBadge styles={PRIORITY_STYLES[t.priority]}>{t.priority}</ThemedBadge></td>
                  <td style={{ padding: '12px 14px' }}><ThemedBadge styles={STATUS_STYLES[t.status]}>{t.status}</ThemedBadge></td>
                  <td style={{ padding: '12px 14px', fontSize: '10px', color: c.textMuted }}>{new Date(t.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Ticket Modal */}
      {showCreate && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'grid', placeItems: 'center', zIndex: 1050 }}
          onClick={() => setShowCreate(false)}>
          <div style={{
            background: c.card, borderRadius: '8px', width: '540px', maxWidth: '90vw', maxHeight: '85vh', overflowY: 'auto',
            boxShadow: '0 20px 60px rgba(22,35,31,0.2)', animation: 'modalSlide 0.25s cubic-bezier(.23,1,.32,1)',
          }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '20px 24px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h6 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '18px', fontWeight: 400, color: c.text, margin: 0 }}>Create Support Ticket</h6>
              <button onClick={() => setShowCreate(false)} style={{ background: 'none', border: 'none', color: c.textMuted, fontSize: '16px', cursor: 'pointer' }}><i className="fas fa-times" /></button>
            </div>
            <div style={{ padding: '16px 24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: c.text, marginBottom: '6px' }}>Category *</label>
                  <select value={form.category} onChange={e => setForm(p => ({...p, category: e.target.value}))} required style={inputStyle}>
                    <option value="">Select Category</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: c.text, marginBottom: '6px' }}>Priority</label>
                  <select value={form.priority} onChange={e => setForm(p => ({...p, priority: e.target.value}))} style={inputStyle}>
                    {['LOW','MEDIUM','HIGH','URGENT'].map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: c.text, marginBottom: '6px' }}>Subject *</label>
                <input value={form.subject} onChange={e => setForm(p => ({...p, subject: e.target.value}))} required style={inputStyle} />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: c.text, marginBottom: '6px' }}>Description *</label>
                <textarea rows={4} value={form.description} onChange={e => setForm(p => ({...p, description: e.target.value}))} required
                  style={{ ...inputStyle, resize: 'vertical' }} />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: c.text, marginBottom: '6px' }}>Booking ID (optional)</label>
                <input type="number" value={form.bookingId} onChange={e => setForm(p => ({...p, bookingId: e.target.value}))} style={inputStyle} />
              </div>
            </div>
            <div style={{ padding: '12px 24px 20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => setShowCreate(false)} style={{ padding: '8px 16px', fontSize: '12px', fontWeight: 500, background: 'transparent', color: c.textSecondary, border: `1px solid ${c.border}`, borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
              <button onClick={createTicket} disabled={!form.category || !form.subject || !form.description}
                style={{ padding: '8px 16px', fontSize: '12px', fontWeight: 500, background: c.primary, color: c.primaryFg, border: 'none', borderRadius: '4px', cursor: 'pointer', opacity: (!form.category || !form.subject || !form.description) ? 0.5 : 1 }}>Create</button>
            </div>
          </div>
        </div>
      )}

      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'grid', placeItems: 'center', zIndex: 1050 }}
          onClick={() => setSelectedTicket(null)}>
          <div style={{
            background: c.card, borderRadius: '8px', width: '600px', maxWidth: '90vw', maxHeight: '85vh', overflowY: 'auto',
            boxShadow: '0 20px 60px rgba(22,35,31,0.2)', animation: 'modalSlide 0.25s cubic-bezier(.23,1,.32,1)',
          }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '20px 24px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h6 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '16px', fontWeight: 400, color: c.text, margin: 0 }}>#{selectedTicket.id} — {selectedTicket.subject}</h6>
              <button onClick={() => setSelectedTicket(null)} style={{ background: 'none', border: 'none', color: c.textMuted, fontSize: '16px', cursor: 'pointer' }}><i className="fas fa-times" /></button>
            </div>
            <div style={{ padding: '16px 24px 24px' }}>
              <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
                <ThemedBadge styles={STATUS_STYLES[selectedTicket.status]}>{selectedTicket.status}</ThemedBadge>
                <ThemedBadge styles={PRIORITY_STYLES[selectedTicket.priority]}>{selectedTicket.priority}</ThemedBadge>
                <ThemedBadge styles={{ bg: '#ece8df', text: '#768078' }}>{selectedTicket.category}</ThemedBadge>
              </div>
              <p style={{ fontSize: '10px', color: c.textMuted, margin: '0 0 12px' }}>Created: {new Date(selectedTicket.createdAt).toLocaleString()}</p>
              <hr className="divider" />
              {selectedTicket.messages?.filter(m => !m.internalNote).map(msg => (
                <div key={msg.id} style={{
                  marginBottom: '12px', padding: '12px 16px', borderRadius: '4px',
                  background: msg.senderId === user?.id ? c.bg : '#d5e3e633',
                  marginLeft: msg.senderId === user?.id ? '40px' : 0,
                  marginRight: msg.senderId !== user?.id ? '40px' : 0,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <strong style={{ fontSize: '11px', color: c.text }}>{msg.senderName}</strong>
                    <span style={{ fontSize: '9px', color: c.textMuted }}>{new Date(msg.createdAt).toLocaleString()}</span>
                  </div>
                  <p style={{ fontSize: '12px', color: c.textSecondary, margin: '4px 0 0', lineHeight: 1.5 }}>{msg.body}</p>
                </div>
              ))}
              {['OPEN','IN_PROGRESS','WAITING_FOR_USER'].includes(selectedTicket.status) && (
                <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                  <input
                    placeholder="Type your reply..."
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    style={{ flex: 1, ...inputStyle }}
                  />
                  <button onClick={sendReply} disabled={!replyText.trim()} style={{
                    padding: '8px 16px', fontSize: '12px', fontWeight: 500,
                    background: c.primary, color: c.primaryFg, border: 'none',
                    borderRadius: '4px', cursor: 'pointer',
                    opacity: replyText.trim() ? 1 : 0.5,
                  }}>Send</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
