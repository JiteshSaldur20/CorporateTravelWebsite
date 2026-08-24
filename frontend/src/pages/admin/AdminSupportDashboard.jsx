import { useState, useEffect } from 'react'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import useColors from '../../hooks/useColors'
import PageHeader from '../../components/PageHeader'

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

const ThemedBadge = ({ styles, children }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', gap: '4px',
    background: styles.bg, color: styles.text,
    fontSize: '9px', fontWeight: 500, padding: '3px 8px', borderRadius: '3px',
  }}>
    {styles.dot && <span className="status-dot" style={{ background: styles.dot }} />}
    {children}
  </span>
)

const getInputStyle = (c) => ({
  width: '100%', padding: '10px 12px', fontSize: '13px',
  border: `1px solid ${c.border}`, borderRadius: '4px',
  backgroundColor: c.card, color: c.text, outline: 'none',
})

export default function AdminSupportDashboard() {
  const { user } = useAuth()
  const { addToast } = useToast()
  const c = useColors()
  const inputStyle = getInputStyle(c)
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [filters, setFilters] = useState({ status: '', priority: '', category: '' })
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [replyText, setReplyText] = useState('')
  const [isInternalNote, setIsInternalNote] = useState(false)
  const [filterKey, setFilterKey] = useState(0)

  useEffect(() => { loadTickets() }, [page, filterKey])

  const loadTickets = async () => {
    setLoading(true)
    try {
      const params = { ...filters, page, size: 20 }
      Object.keys(params).forEach(k => { if (!params[k]) delete params[k] })
      const { data } = await api.get('/api/support/admin/tickets', { params })
      setTickets(data.content || [])
      setTotalPages(data.totalPages || 0)
    } catch (e) {
      if (e.response?.status !== 401) {
        addToast(e.response?.data?.message || 'Failed to load tickets', 'danger')
      }
    }
    setLoading(false)
  }

  const updateStatus = async (ticketId, status) => {
    try {
      await api.patch(`/api/support/admin/tickets/${ticketId}/status`, { status })
      addToast('Status updated', 'success')
      loadTickets()
    } catch (err) { addToast(err.response?.data?.message || 'Failed', 'danger') }
  }

  const sendReply = async () => {
    if (!replyText.trim()) return
    try {
      await api.post(`/api/support/tickets/${selectedTicket.id}/messages`, { body: replyText, internalNote: isInternalNote })
      setReplyText(''); setIsInternalNote(false)
      const { data } = await api.get(`/api/support/admin/tickets/${selectedTicket.id}`)
      setSelectedTicket(data)
      addToast(isInternalNote ? 'Internal note added' : 'Reply sent', 'success')
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to send reply', 'danger')
    }
  }

  return (
    <div className="animate-in">
      <PageHeader section="Admin" title="Support Management" icon="fa-headset" />

      {/* Filters */}
      <div style={{ background: c.card, border: `1px solid ${c.cardBorder}`, borderRadius: '4px', padding: '16px 20px', marginBottom: '16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '12px', alignItems: 'end' }}>
          <div>
            <label style={{ display: 'block', fontSize: '9px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: c.textMuted, marginBottom: '6px' }}>Status</label>
            <select value={filters.status} onChange={e => setFilters(p => ({...p, status: e.target.value}))} style={inputStyle}>
              <option value="">All</option>
              {['OPEN','IN_PROGRESS','WAITING_FOR_USER','RESOLVED','CLOSED'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '9px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: c.textMuted, marginBottom: '6px' }}>Priority</label>
            <select value={filters.priority} onChange={e => setFilters(p => ({...p, priority: e.target.value}))} style={inputStyle}>
              <option value="">All</option>
              {['LOW','MEDIUM','HIGH','URGENT'].map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '9px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: c.textMuted, marginBottom: '6px' }}>Category</label>
            <select value={filters.category} onChange={e => setFilters(p => ({...p, category: e.target.value}))} style={inputStyle}>
              <option value="">All</option>
              {['FLIGHT','HOTEL','BOOKING','PAYMENT','CANCELLATION_REFUND','TECHNICAL_ISSUE','ACCOUNT_LOGIN','OTHER'].map(c => <option key={c} value={c}>{c.replace(/_/g,' ')}</option>)}
            </select>
          </div>
          <button onClick={() => { setPage(0); setFilterKey(k => k + 1) }} style={{
            padding: '10px 16px', fontSize: '12px', fontWeight: 500,
            background: c.primary, color: c.primaryFg, border: 'none',
            borderRadius: '4px', cursor: 'pointer',
          }}>Filter</button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}><div className="spinner-border" /></div>
      ) : (
        <div style={{ background: c.card, border: `1px solid ${c.cardBorder}`, borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="table align-middle mb-0">
              <thead>
                <tr>
                  {['#', 'Subject', 'Requester', 'Category', 'Priority', 'Status', 'Created', 'Actions'].map(h => (
                    <th key={h} style={{ background: c.bg, borderBottom: `1px solid ${c.border}`, fontSize: '9px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: c.textMuted, padding: '10px 14px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tickets.map(t => (
                  <tr key={t.id} style={{ borderBottom: '1px solid #eee9df' }}>
                    <td style={{ padding: '12px 14px', fontSize: '11px', color: c.primary, fontWeight: 500 }}>{t.id}</td>
                    <td style={{ padding: '12px 14px', fontSize: '11px', fontWeight: 500, color: c.text }}>{t.subject}</td>
                    <td style={{ padding: '12px 14px', fontSize: '11px' }}>
                      {t.requesterName}<br /><span style={{ fontSize: '10px', color: c.textMuted }}>{t.requesterEmail}</span>
                    </td>
                    <td style={{ padding: '12px 14px' }}><ThemedBadge styles={{ bg: '#ece8df', text: '#768078' }}>{t.category?.replace(/_/g,' ')}</ThemedBadge></td>
                    <td style={{ padding: '12px 14px' }}><ThemedBadge styles={PRIORITY_STYLES[t.priority]}>{t.priority}</ThemedBadge></td>
                    <td style={{ padding: '12px 14px' }}><ThemedBadge styles={STATUS_STYLES[t.status]}>{t.status}</ThemedBadge></td>
                    <td style={{ padding: '12px 14px', fontSize: '10px', color: c.textMuted }}>{new Date(t.createdAt).toLocaleDateString()}</td>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button onClick={() => setSelectedTicket(t)} style={{ padding: '4px 10px', fontSize: '9px', fontWeight: 500, background: 'transparent', color: c.primary, border: `1px solid ${c.primary}`, borderRadius: '3px', cursor: 'pointer', transition: 'all 0.2s' }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = c.primary; e.currentTarget.style.color = c.primaryFg }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = c.primary }}
                        >View</button>
                        {t.status !== 'CLOSED' && (
                          <button onClick={() => updateStatus(t.id, 'IN_PROGRESS')} style={{ padding: '4px 10px', fontSize: '9px', fontWeight: 500, background: 'transparent', color: c.success, border: `1px solid ${c.success}`, borderRadius: '3px', cursor: 'pointer', transition: 'all 0.2s' }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = c.success; e.currentTarget.style.color = c.primaryFg }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = c.success }}
                          >Start</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #eee9df' }}>
            <button onClick={() => setPage(p => p-1)} disabled={page === 0} style={{ padding: '6px 12px', fontSize: '11px', background: 'transparent', color: page === 0 ? c.border : c.textSecondary, border: `1px solid ${c.border}`, borderRadius: '4px', cursor: page === 0 ? 'not-allowed' : 'pointer' }}>Prev</button>
            <span style={{ fontSize: '11px', color: c.textMuted }}>Page {page+1} of {totalPages}</span>
            <button onClick={() => setPage(p => p+1)} disabled={page >= totalPages-1} style={{ padding: '6px 12px', fontSize: '11px', background: 'transparent', color: page >= totalPages-1 ? c.border : c.textSecondary, border: `1px solid ${c.border}`, borderRadius: '4px', cursor: page >= totalPages-1 ? 'not-allowed' : 'pointer' }}>Next</button>
          </div>
        </div>
      )}

      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'grid', placeItems: 'center', zIndex: 1050 }} onClick={() => setSelectedTicket(null)}>
          <div style={{ background: c.card, borderRadius: '8px', width: '600px', maxWidth: '90vw', maxHeight: '85vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(22,35,31,0.2)', animation: 'modalSlide 0.25s cubic-bezier(.23,1,.32,1)' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '20px 24px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h6 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '16px', fontWeight: 400, color: c.text, margin: 0 }}>#{selectedTicket.id} — {selectedTicket.subject}</h6>
              <button onClick={() => setSelectedTicket(null)} style={{ background: 'none', border: 'none', color: c.textMuted, fontSize: '16px', cursor: 'pointer' }}><i className="fas fa-times" /></button>
            </div>
            <div style={{ padding: '16px 24px 24px' }}>
              <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
                <ThemedBadge styles={STATUS_STYLES[selectedTicket.status]}>{selectedTicket.status}</ThemedBadge>
                <ThemedBadge styles={PRIORITY_STYLES[selectedTicket.priority]}>{selectedTicket.priority}</ThemedBadge>
                {selectedTicket.linkedBookingId && <ThemedBadge styles={{ bg: '#ece8df', text: '#768078' }}>Booking #{selectedTicket.linkedBookingId}</ThemedBadge>}
              </div>
              <p style={{ fontSize: '10px', color: c.textMuted, margin: '0 0 12px' }}>Requester: {selectedTicket.requesterName} ({selectedTicket.requesterEmail})</p>
              <hr className="divider" />
              {selectedTicket.messages?.map(msg => (
                <div key={msg.id} style={{
                  marginBottom: '12px', padding: '12px 16px', borderRadius: '4px',
                  background: msg.internalNote ? '#fef4e0' : msg.senderId === user?.id ? c.bg : '#d5e3e633',
                  marginLeft: msg.senderId === user?.id ? '40px' : 0,
                  marginRight: msg.senderId !== user?.id ? '40px' : 0,
                  border: msg.internalNote ? '1px solid #f29a69' : 'none',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <strong style={{ fontSize: '11px', color: c.text }}>
                      {msg.senderName}
                      {msg.internalNote && <span style={{ marginLeft: '6px', background: '#f29a69', color: c.primaryFg, fontSize: '8px', padding: '2px 6px', borderRadius: '3px' }}>Internal Note</span>}
                    </strong>
                    <span style={{ fontSize: '9px', color: c.textMuted }}>{new Date(msg.createdAt).toLocaleString()}</span>
                  </div>
                  <p style={{ fontSize: '12px', color: c.textSecondary, margin: '4px 0 0', lineHeight: 1.5 }}>{msg.body}</p>
                </div>
              ))}
              <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                <input placeholder="Reply..." value={replyText} onChange={e => setReplyText(e.target.value)} style={{ flex: 1, ...inputStyle }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '10px', color: c.textMuted, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <input type="checkbox" checked={isInternalNote} onChange={e => setIsInternalNote(e.target.checked)} style={{ accentColor: c.primary }} />
                    Note
                  </label>
                  <button onClick={sendReply} disabled={!replyText.trim()} style={{ padding: '6px 12px', fontSize: '11px', fontWeight: 500, background: c.primary, color: c.primaryFg, border: 'none', borderRadius: '4px', cursor: 'pointer', opacity: replyText.trim() ? 1 : 0.5 }}>Send</button>
                </div>
              </div>
              {selectedTicket.status !== 'CLOSED' && (
                <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                  <button onClick={() => updateStatus(selectedTicket.id, 'RESOLVED')} style={{ padding: '6px 12px', fontSize: '10px', fontWeight: 500, background: 'transparent', color: c.success, border: `1px solid ${c.success}`, borderRadius: '3px', cursor: 'pointer' }}>Mark Resolved</button>
                  <button onClick={() => updateStatus(selectedTicket.id, 'CLOSED')} style={{ padding: '6px 12px', fontSize: '10px', fontWeight: 500, background: 'transparent', color: c.textSecondary, border: `1px solid ${c.textSecondary}`, borderRadius: '3px', cursor: 'pointer' }}>Close</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
