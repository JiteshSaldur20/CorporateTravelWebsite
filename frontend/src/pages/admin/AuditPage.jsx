import { useState, useEffect } from 'react'
import api from '../../services/api'
import { useToast } from '../../context/ToastContext'
import useColors from '../../hooks/useColors'
import PageHeader from '../../components/PageHeader'

export default function AuditPage() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [filters, setFilters] = useState({ action: '', entityType: '', status: '', fromDate: '', toDate: '' })
  const { addToast } = useToast()
  const c = useColors()
  const inputStyle = {
    width: '100%', padding: '10px 12px', fontSize: '13px',
    border: `1px solid ${c.border}`, borderRadius: '4px',
    backgroundColor: c.card, color: c.text, outline: 'none',
  }

  useEffect(() => { loadLogs() }, [page])

  const loadLogs = async () => {
    setLoading(true)
    try {
      const params = { page, size: 20 }
      if (filters.action) params.action = filters.action
      if (filters.entityType) params.entityType = filters.entityType
      if (filters.status) params.status = filters.status
      if (filters.fromDate) params.fromDate = filters.fromDate + ':00'  // append seconds for ISO format
      if (filters.toDate) params.toDate = filters.toDate + ':00'      // append seconds for ISO format
      const { data } = await api.get('/api/admin/audit-logs', { params })
      setLogs(data.content || [])
      setTotalPages(data.totalPages || 0)
    } catch (err) { addToast('Failed to load audit logs', 'danger') }
    setLoading(false)
  }

  const search = () => {
    setPage(0)
    if (page === 0) loadLogs() // page won't change so useEffect won't fire
  }

  return (
    <div className="animate-in">
      <PageHeader section="Admin" title="Audit Logs" icon="fa-clipboard-list" />

      {/* Filters */}
      <div style={{ background: c.card, border: `1px solid ${c.cardBorder}`, borderRadius: '4px', padding: '16px 20px', marginBottom: '16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr) auto', gap: '12px', alignItems: 'end' }}>
          <div>
            <label style={{ display: 'block', fontSize: '9px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: c.textMuted, marginBottom: '6px' }}>Action</label>
            <input value={filters.action} onChange={e => setFilters(p => ({...p, action: e.target.value}))} placeholder="e.g. BOOKING" style={inputStyle} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '9px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: c.textMuted, marginBottom: '6px' }}>Entity Type</label>
            <input value={filters.entityType} onChange={e => setFilters(p => ({...p, entityType: e.target.value}))} placeholder="e.g. BOOKING" style={inputStyle} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '9px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: c.textMuted, marginBottom: '6px' }}>Status</label>
            <select value={filters.status} onChange={e => setFilters(p => ({...p, status: e.target.value}))} style={inputStyle}>
              <option value="">All</option>
              <option value="SUCCESS">SUCCESS</option>
              <option value="FAILED">FAILED</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '9px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: c.textMuted, marginBottom: '6px' }}>From</label>
            <input type="datetime-local" value={filters.fromDate} onChange={e => setFilters(p => ({...p, fromDate: e.target.value}))} style={inputStyle} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '9px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: c.textMuted, marginBottom: '6px' }}>To</label>
            <input type="datetime-local" value={filters.toDate} onChange={e => setFilters(p => ({...p, toDate: e.target.value}))} style={inputStyle} />
          </div>
          <button onClick={search} style={{
            padding: '10px 20px', fontSize: '12px', fontWeight: 500,
            background: c.primary, color: c.primaryFg, border: 'none',
            borderRadius: '4px', cursor: 'pointer', width: '100%',
          }}>Search</button>
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
                  {['Time', 'Actor', 'Role', 'Action', 'Entity', 'ID', 'Status', 'Details'].map(h => (
                    <th key={h} style={{ background: c.bg, borderBottom: `1px solid ${c.border}`, fontSize: '9px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: c.textMuted, padding: '10px 14px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logs.map(log => {
                  const sc = log.status === 'SUCCESS'
                    ? { bg: '#e8eee5', text: '#3d5a42', dot: '#627b68' }
                    : log.status === 'FAILED'
                    ? { bg: '#fde8e8', text: '#922b21', dot: '#c0392b' }
                    : { bg: '#ece8df', text: '#768078', dot: '#768078' }
                  return (
                    <tr key={log.id} style={{ borderBottom: '1px solid #eee9df' }}>
                      <td style={{ padding: '12px 14px', fontSize: '10px', color: c.textMuted }}>{new Date(log.timestamp).toLocaleString()}</td>
                      <td style={{ padding: '12px 14px', fontSize: '11px', color: c.textSecondary }}>{log.actorName || 'SYSTEM'}</td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{ background: '#ece8df', color: '#768078', fontSize: '9px', fontWeight: 500, padding: '3px 8px', borderRadius: '3px' }}>{log.actorRole}</span>
                      </td>
                      <td style={{ padding: '12px 14px', fontSize: '10px', color: c.textSecondary }}>{log.action}</td>
                      <td style={{ padding: '12px 14px', fontSize: '11px', color: c.textSecondary }}>{log.entityType}</td>
                      <td style={{ padding: '12px 14px', fontSize: '11px', color: c.textSecondary }}>{log.entityId}</td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: sc.bg, color: sc.text, fontSize: '9px', fontWeight: 500, padding: '3px 8px', borderRadius: '3px' }}>
                          <span className="status-dot" style={{ background: sc.dot }} />{log.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px', fontSize: '10px', color: c.textMuted, maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{log.metadata}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div style={{ padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #eee9df' }}>
            <button onClick={() => setPage(p => p-1)} disabled={page === 0} style={{ padding: '6px 12px', fontSize: '11px', background: 'transparent', color: page === 0 ? c.border : c.textSecondary, border: `1px solid ${c.border}`, borderRadius: '4px', cursor: page === 0 ? 'not-allowed' : 'pointer' }}>Previous</button>
            <span style={{ fontSize: '11px', color: c.textMuted }}>Page {page+1} of {totalPages}</span>
            <button onClick={() => setPage(p => p+1)} disabled={page >= totalPages-1} style={{ padding: '6px 12px', fontSize: '11px', background: 'transparent', color: page >= totalPages-1 ? c.border : c.textSecondary, border: `1px solid ${c.border}`, borderRadius: '4px', cursor: page >= totalPages-1 ? 'not-allowed' : 'pointer' }}>Next</button>
          </div>
        </div>
      )}
    </div>
  )
}
