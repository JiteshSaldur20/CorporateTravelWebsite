import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import { useToast } from '../../context/ToastContext'
import { useBookingContext } from '../../context/BookingContext'
import useColors from '../../hooks/useColors'
import PageHeader from '../../components/PageHeader'

const CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Pune', 'Chennai', 'Kolkata', 'Hyderabad']

const HOTEL_PLACEHOLDERS = [
  'https://aw-d.tripcdn.com/images/02X4d120008v6z1fyB6E3_R_500_400_R5.webp',
  'https://aw-d.tripcdn.com/images/0224e12000r9onssj7BF2_R_500_400_R5.webp',
  'https://aw-d.tripcdn.com/images/0585z12000srpvyeb598D_R_500_400_R5.webp',
  'https://aw-d.tripcdn.com/images/0221112000l4n551rC5A8_R_500_400_R5.webp',
  'https://media.easemytrip.com/media/Hotel/SHL-2112234969672/Common/CommonH8qwdC.jpg',
  'https://static.vecteezy.com/system/resources/thumbnails/070/720/079/small/hotel-sign-in-paris-france-between-buildings-and-blue-sky-inviting-travelers-for-comfort-and-services-photo.jpeg',
]

const STATUS_COLORS = {
  OPEN: { bg: '#fef4e0', text: '#8a6d3b', dot: '#f29a69' },
  IN_PROGRESS: { bg: '#d5e3e6', text: '#3a6b7a', dot: '#9bbbd0' },
  RESOLVED: { bg: '#e8eee5', text: '#3d5a42', dot: '#627b68' },
  CLOSED: { bg: '#ece8df', text: '#768078', dot: '#768078' },
}

export default function HotelSearchPage() {
  const [search, setSearch] = useState({ city: '', starRating: '', amenity: '' })
  const [filters, setFilters] = useState({ minPrice: '', maxPrice: '', sortBy: 'price', sortDir: 'asc' })
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const { addToast } = useToast()
  const { setPendingHotelSelection } = useBookingContext()
  const navigate = useNavigate()
  const c = useColors()

  // Auto-load all hotels on mount
  useEffect(() => {
    const loadAll = async () => {
      try {
        const { data } = await api.get('/api/hotels/search', { params: {} })
        setResults(data)
        setSearched(true)
      } catch (err) { /* silent */ }
    }
    loadAll()
  }, [])

  const handleSearch = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const params = { ...search }
      if (filters.minPrice) params.minPrice = filters.minPrice
      if (filters.maxPrice) params.maxPrice = filters.maxPrice
      if (filters.sortBy) params.sortBy = filters.sortBy
      if (filters.sortDir) params.sortDir = filters.sortDir
      const { data } = await api.get('/api/hotels/search', { params })
      setResults(data)
      setSearched(true)
    } catch (err) {
      addToast('Search failed', 'danger')
    }
    setLoading(false)
  }

  const resetFilters = () => {
    setFilters({ minPrice: '', maxPrice: '', sortBy: 'price', sortDir: 'asc' })
  }

  const selectHotel = (hotel, room) => {
    navigate(`/bookings/create?type=hotel&hotelId=${hotel.id}&roomId=${room.id}`)
  }

  const selectHotelWithFlight = (hotel, room) => {
    setPendingHotelSelection(hotel, room)
    navigate('/flights?combined=true')
  }

  const cheapestPrice = (hotel) => {
    if (!hotel.rooms?.length) return null
    return Math.min(...hotel.rooms.map(r => r.pricePerNight))
  }

  return (
    <div className="animate-in">
      <PageHeader section="Hotels" title="Find Your Hotel" icon="fa-hotel">
        <span style={{ fontSize: '11px', color: c.textMuted }}>Discover comfortable stays</span>
      </PageHeader>

      {/* Search Hero */}
      <div style={{
        background: c.dark,
        borderRadius: '4px',
        padding: '28px 32px',
        marginBottom: '24px',
      }}>
        <form onSubmit={handleSearch}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1.2fr auto', gap: '12px', alignItems: 'end' }}>
            <div>
              <label style={{ display: 'block', fontSize: '9px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: c.textMuted, marginBottom: '6px' }}>City</label>
              <select
                value={search.city}
                onChange={e => setSearch(p => ({...p, city: e.target.value}))}
                required
                style={{
                  width: '100%', padding: '10px 12px', fontSize: '13px',
                  border: `1px solid ${c.darkBorder}`, borderRadius: '4px',
                  backgroundColor: c.darkMid, color: c.primaryFg,
                  outline: 'none',
                }}
              >
                <option value="">Select City</option>
                {CITIES.map(city => <option key={city} value={city}>{city}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '9px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: c.textMuted, marginBottom: '6px' }}>Star Rating</label>
              <select
                value={search.starRating}
                onChange={e => setSearch(p => ({...p, starRating: e.target.value}))}
                style={{
                  width: '100%', padding: '10px 12px', fontSize: '13px',
                  border: `1px solid ${c.darkBorder}`, borderRadius: '4px',
                  backgroundColor: c.darkMid, color: c.primaryFg,
                  outline: 'none',
                }}
              >
                <option value="">Any</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '9px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: c.textMuted, marginBottom: '6px' }}>Amenity</label>
              <select
                value={search.amenity}
                onChange={e => setSearch(p => ({...p, amenity: e.target.value}))}
                style={{
                  width: '100%', padding: '10px 12px', fontSize: '13px',
                  border: `1px solid ${c.darkBorder}`, borderRadius: '4px',
                  backgroundColor: c.darkMid, color: c.primaryFg,
                  outline: 'none',
                }}
              >
                <option value="">Any Amenity</option>
                <option value="Pool">Pool</option>
                <option value="Gym">Gym</option>
                <option value="Spa">Spa</option>
                <option value="Restaurant">Restaurant</option>
                <option value="Business Center">Business Center</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '9px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: c.textMuted, marginBottom: '6px' }}>Min Price</label>
              <input
                type="number"
                placeholder="Min"
                value={filters.minPrice}
                onChange={e => setFilters(p => ({...p, minPrice: e.target.value}))}
                style={{
                  width: '100%', padding: '10px 12px', fontSize: '13px',
                  border: `1px solid ${c.darkBorder}`, borderRadius: '4px',
                  backgroundColor: c.darkMid, color: c.primaryFg,
                  outline: 'none',
                }}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '10px 20px', fontSize: '12px', fontWeight: 500,
                background: c.primary, color: c.primaryFg, border: 'none',
                borderRadius: '4px', cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                display: 'flex', alignItems: 'center', gap: '8px',
                transition: 'transform 0.16s ease, box-shadow 0.2s ease',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = 'translateY(-1px)'
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(232, 111, 61, 0.3)'
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              {loading ? <span className="spinner-border spinner-border-sm" /> : <><i className="fas fa-search" /> Search</>}
            </button>
          </div>
        </form>
      </div>

      {searched && (
        <p style={{ fontSize: '11px', color: c.textMuted, marginBottom: '16px', fontWeight: 500 }}>
          {results.length} hotel(s) found
        </p>
      )}

      {results.map((hotel, idx) => (
        <div
          key={hotel.id}
          className="hover-lift"
          style={{
            background: c.card,
            border: `1px solid ${c.cardBorder}`,
            borderRadius: '4px',
            marginBottom: '16px',
            overflow: 'hidden',
            display: 'flex',
            animation: `rise 0.5s cubic-bezier(.23,1,.32,1) both ${idx * 60}ms`,
          }}
        >
          {/* Hotel Image */}
          <div style={{ flex: '1 1 0', minWidth: 0, background: c.borderTable, position: 'relative', overflow: 'hidden' }}>
            {(() => {
              const imgUrl = hotel.imageUrl || HOTEL_PLACEHOLDERS[hotel.id % HOTEL_PLACEHOLDERS.length]
              return (
                <img src={imgUrl} alt={hotel.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                />
              )
            })()}
            {/* Star rating badge */}
            <div style={{
              position: 'absolute', top: '12px', left: '12px',
              background: '#17231fcc', color: '#fff9f1',
              padding: '4px 8px', fontSize: '9px', fontWeight: 500,
              display: 'flex', alignItems: 'center', gap: '4px',
            }}>
              {[...Array(5)].map((_, i) => (
                <i key={i} className={`fas fa-star`} style={{ color: i < hotel.starRating ? '#f29a69' : '#59685f', fontSize: '8px' }} />
              ))}
            </div>
          </div>

          {/* Hotel Info */}
          <div style={{ flex: '2 1 0', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '6px', minWidth: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <h5 style={{
                fontFamily: "'DM Serif Display', serif",
                fontSize: '17px',
                fontWeight: 400,
                letterSpacing: '-0.02em',
                color: c.text,
                margin: 0,
              }}>{hotel.name}</h5>
            </div>

            {/* Address + Google Maps link */}
            <p style={{ fontSize: '12px', color: c.textMuted, margin: 0, display: 'flex', alignItems: 'start', gap: '6px' }}>
              <i className="fas fa-map-marker-alt" style={{ color: '#c0392b', marginTop: '2px', flexShrink: 0 }} />
              <span>{hotel.address}{hotel.city ? `, ${hotel.city}` : ''}{hotel.country ? `, ${hotel.country}` : ''}</span>
              {hotel.latitude && hotel.longitude && (
                <a
                  href={`https://www.google.com/maps?q=${hotel.latitude},${hotel.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#3b82f6', fontSize: '11px', textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0 }}
                  title="Open in Google Maps"
                >
                  <i className="fas fa-external-link-alt" style={{ fontSize: '9px', marginRight: '3px' }} />
                  Map
                </a>
              )}
            </p>

            {/* Description */}
            {hotel.description && (
              <p style={{ fontSize: '12px', color: c.textMuted, margin: 0, lineHeight: '1.5' }}>
                {hotel.description}
              </p>
            )}

            {/* Check-in / Check-out times */}
            {(hotel.checkInTime || hotel.checkOutTime) && (
              <div style={{ display: 'flex', gap: '16px', margin: 0 }}>
                {hotel.checkInTime && (
                  <span style={{ fontSize: '11px', color: c.textMuted }}>
                    <i className="fas fa-door-open" style={{ marginRight: '5px', color: '#627b68' }} />
                    Check-in: {hotel.checkInTime.slice(0, 5)}
                  </span>
                )}
                {hotel.checkOutTime && (
                  <span style={{ fontSize: '11px', color: c.textMuted }}>
                    <i className="fas fa-door-closed" style={{ marginRight: '5px', color: '#c0392b' }} />
                    Check-out: {hotel.checkOutTime.slice(0, 5)}
                  </span>
                )}
              </div>
            )}

            {/* Amenities with icons */}
            {hotel.amenities && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {hotel.amenities.split(',').slice(0, 6).map(a => {
                  const name = a.trim()
                  const iconMap = {
                    'WiFi': 'fa-wifi', 'Pool': 'fa-swimming-pool', 'Gym': 'fa-dumbbell',
                    'Spa': 'fa-spa', 'Restaurant': 'fa-utensils', 'Business Center': 'fa-briefcase',
                    'Parking': 'fa-square-parking', 'Room Service': 'fa-concierge-bell',
                    'Bar': 'fa-martini-glass-empty', 'AC': 'fa-snowflake',
                    'Laundry': 'fa-shirt', 'Airport Shuttle': 'fa-shuttle-van',
                  }
                  return (
                    <span key={name} style={{
                      display: 'inline-flex', alignItems: 'center', gap: '5px',
                      background: c.successBg, color: c.success,
                      fontSize: '11px', fontWeight: 500,
                      padding: '4px 11px', borderRadius: '16px',
                      lineHeight: 1,
                      border: `1px solid ${c.borderTable}`,
                      transition: 'all 0.2s ease',
                      cursor: 'default',
                    }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = c.success
                        e.currentTarget.style.color = c.primaryFg
                        e.currentTarget.style.borderColor = c.success
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = c.successBg
                        e.currentTarget.style.color = c.success
                        e.currentTarget.style.borderColor = c.borderTable
                      }}
                    >
                      <i className={`fas ${iconMap[name] || 'fa-check'}`} style={{ fontSize: '10px', flexShrink: 0 }} />
                      {name}
                    </span>
                  )
                })}
              </div>
            )}
          </div>

          {/* Rooms + Pricing */}
          <div style={{ flex: '1.2 1 0', padding: '14px 16px', borderLeft: `1px solid ${c.borderTable}`, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <span style={{
              fontSize: '9px', fontWeight: 600, textTransform: 'uppercase',
              letterSpacing: '0.14em', color: c.textMuted, marginBottom: '10px', display: 'block',
            }}>Available Rooms</span>
            {hotel.rooms?.map(room => (
              <div key={room.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px', marginBottom: '8px',
                background: c.bg, borderRadius: '4px',
              }}>
                <div>
                  <span style={{
                    background: '#e8eee5', color: '#627b68',
                    fontSize: '9px', fontWeight: 500,
                    padding: '2px 6px', borderRadius: '3px', display: 'inline-block', marginBottom: '4px',
                  }}>{room.roomType}</span>
                  <div style={{ fontSize: '10px', color: c.textMuted }}>{room.maxGuests} guests • {room.availableRooms} left</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: c.primary }}>₹{room.pricePerNight.toLocaleString()}</div>
                  <div style={{ fontSize: '9px', color: c.textMuted }}>/night</div>
                  <div style={{ marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <button
                      onClick={() => selectHotel(hotel, room)}
                      style={{
                        padding: '4px 10px', fontSize: '9px', fontWeight: 500,
                        background: 'transparent', color: c.primary,
                        border: `1px solid ${c.primary}`, borderRadius: '3px',
                        cursor: 'pointer', transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = c.primary
                        e.currentTarget.style.color = c.primaryFg
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent'
                        e.currentTarget.style.color = c.primary
                      }}
                    >Book</button>
                    <button
                      onClick={() => selectHotelWithFlight(hotel, room)}
                      style={{
                        padding: '4px 10px', fontSize: '9px', fontWeight: 500,
                        background: 'transparent', color: '#9bbbd0',
                        border: '1px solid #9bbbd0', borderRadius: '3px',
                        cursor: 'pointer', transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#9bbbd0'
                        e.currentTarget.style.color = '#17231f'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent'
                        e.currentTarget.style.color = '#9bbbd0'
                      }}
                    >Book with Flight</button>
                  </div>
                </div>
              </div>
            ))}
            {!hotel.rooms?.length && (
              <p style={{ fontSize: '11px', color: c.textMuted, textAlign: 'center', padding: '20px 0' }}>No rooms available</p>
            )}
          </div>
        </div>
      ))}

      {searched && results.length === 0 && (
        <div className="empty-state">
          <i className="fas fa-hotel" style={{ fontSize: '36px' }} />
          <p>No hotels found</p>
          <p style={{ fontSize: '11px', color: c.textMuted }}>Try adjusting your search criteria</p>
        </div>
      )}
    </div>
  )
}
