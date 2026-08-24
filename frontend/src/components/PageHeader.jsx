import useColors from '../hooks/useColors'

export default function PageHeader({ section, title, icon, iconColor, children }) {
  const c = useColors()
  return (
    <div style={{ marginBottom: '24px' }}>
      {section && (
        <div className="eyebrow" style={{ marginBottom: '4px' }}>
          <span className="eyebrow-line" /> {section}
        </div>
      )}
      <div className="d-flex justify-content-between align-items-end">
        <h4 style={{
          fontFamily: "'DM Serif Display', Georgia, serif",
          fontSize: '28px',
          fontWeight: 400,
          letterSpacing: '-0.03em',
          color: c.text,
          margin: 0,
        }}>
          {icon && <i className={`fas ${icon} me-2`} style={{ color: iconColor || c.primary }} />}
          {title}
        </h4>
        {children}
      </div>
    </div>
  )
}
