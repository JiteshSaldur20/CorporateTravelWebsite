import { useState, useMemo } from 'react'

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December']
const DAY_NAMES = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

export default function Calendar({ highlightDates = [] }) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const today = new Date()

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const daysInPrevMonth = new Date(year, month, 0).getDate()

    const days = []

    // Previous month trailing days
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({ day: daysInPrevMonth - i, type: 'muted', date: new Date(year, month - 1, daysInPrevMonth - i) })
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d)
      const isToday = date.toDateString() === today.toDateString()
      const isHighlighted = highlightDates.some(hd => hd.toDateString() === date.toDateString())
      days.push({
        day: d,
        type: isToday ? 'today' : isHighlighted ? 'range' : 'normal',
        date,
      })
    }

    // Next month leading days
    const remaining = 42 - days.length
    for (let i = 1; i <= remaining; i++) {
      days.push({ day: i, type: 'muted', date: new Date(year, month + 1, i) })
    }

    return days
  }, [year, month, highlightDates])

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1))

  return (
    <div className="calendar-card">
      <div className="calendar-top">
        <i className="fas fa-calendar-alt" style={{ color: 'var(--ps-warning)', fontSize: '12px' }} />
        <span style={{ fontWeight: 500 }}>{MONTH_NAMES[month]} {year}</span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '4px' }}>
          <button onClick={prevMonth} style={{ padding: '2px 6px', background: 'none', border: 'none', color: 'var(--ps-warning)', cursor: 'pointer', fontSize: '11px' }}>
            <i className="fas fa-chevron-left" />
          </button>
          <button onClick={nextMonth} style={{ padding: '2px 6px', background: 'none', border: 'none', color: 'var(--ps-warning)', cursor: 'pointer', fontSize: '11px' }}>
            <i className="fas fa-chevron-right" />
          </button>
        </div>
      </div>

      <div className="calendar-days">
        {DAY_NAMES.map(d => <span key={d}>{d}</span>)}
      </div>

      <div className="calendar-dates">
        {calendarDays.map((item, i) => (
          <span key={i} className={item.type === 'muted' ? 'muted-day' : item.type === 'today' ? 'today' : item.type === 'range' ? 'range' : ''}>
            {item.day}
          </span>
        ))}
      </div>

      <div className="calendar-caption">
        <span className="orange-dot" />
        <span>Today</span>
      </div>
    </div>
  )
}
