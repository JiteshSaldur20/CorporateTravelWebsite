import { useState, useEffect } from 'react'
import { Card, Form, Button, Row, Col, Badge } from 'react-bootstrap'
import { useNavigate, useSearchParams } from 'react-router-dom'
import api from '../../services/api'
import { useToast } from '../../context/ToastContext'
import { useBookingContext } from '../../context/BookingContext'
import useColors from '../../hooks/useColors'

const CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Pune', 'Chennai', 'Kolkata', 'Hyderabad', 'Singapore']
const CLASSES = ['', 'ECONOMY', 'PREMIUM_ECONOMY', 'BUSINESS', 'FIRST']

export default function FlightSearchPage() {
  const [search, setSearch] = useState({ origin: '', destination: '', travelClass: '' })
  const [filters, setFilters] = useState({ minPrice: '', maxPrice: '', maxDuration: '', maxStops: '', sortBy: 'price', sortDir: 'asc' })
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const { addToast } = useToast()
  const { pendingHotel, clearPendingHotel } = useBookingContext()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const isCombinedMode = searchParams.get('combined') === 'true' && pendingHotel
  const c = useColors()

  // Auto-load all flights on mount
  useEffect(() => {
    const loadAll = async () => {
      try {
        const { data } = await api.get('/api/flights/search', { params: {} })
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
      if (filters.maxDuration) params.maxDuration = filters.maxDuration
      if (filters.maxStops) params.maxStops = filters.maxStops
      if (filters.sortBy) params.sortBy = filters.sortBy
      if (filters.sortDir) params.sortDir = filters.sortDir
      const { data } = await api.get('/api/flights/search', { params })
      setResults(data)
      setSearched(true)
    } catch (err) {
      addToast('Search failed', 'danger')
    }
    setLoading(false)
  }

  const handleFilterChange = (e) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const applyFilters = () => {
    handleSearch(new Event('submit'))
  }

  const resetFilters = () => {
    setFilters({ minPrice: '', maxPrice: '', maxDuration: '', maxStops: '', sortBy: 'price', sortDir: 'asc' })
  }

  const selectFlight = (flight) => {
    if (isCombinedMode && pendingHotel) {
      const { hotel, room } = pendingHotel
      navigate(`/bookings/create?type=both&flightId=${flight.id}&hotelId=${hotel.id}&roomId=${room.id}`)
    } else {
      navigate(`/bookings/create?type=flight&flightId=${flight.id}`)
    }
  }

  return (
    <div>
      {/* Hero Card (reference style) */}
      <div className="hero-card" style={{ marginBottom: '24px' }}>
        <img src="/images/HeroImage.png" alt="Flights" />
        <div className="hero-copy">
          <div className="eyebrow light">
            <span className="eyebrow-line" />
            Flights
          </div>
          <h2 style={{ fontSize: '36px' }}>
            Find Your <em>Flight</em>
          </h2>
          <p>Search from hundreds of flights across multiple airlines</p>
        </div>
      </div>

      {/* Combined booking banner */}
      {isCombinedMode && (
        <div style={{
          background: '#d5e3e6',
          border: '1px solid #9bbbd0',
          borderRadius: '4px',
          padding: '14px 20px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '4px', background: '#e8eee5', display: 'grid', placeItems: 'center' }}>
              <i className="fas fa-hotel" style={{ color: '#627b68', fontSize: '12px' }} />
            </div>
            <div>
              <span style={{ fontSize: '11px', fontWeight: 500, color: '#3a6b7a' }}>
                Booking combined with: <strong>{pendingHotel.hotel.name}</strong> — {pendingHotel.room.roomType}
              </span>
              <br />
              <span style={{ fontSize: '10px', color: '#5a8a96' }}>
                Select a flight below to complete your combined booking. Total will include flight + hotel.
              </span>
            </div>
          </div>
          <button
            onClick={() => { clearPendingHotel(); navigate('/hotels') }}
            style={{
              padding: '5px 12px', fontSize: '10px', fontWeight: 500,
              background: 'transparent', color: '#5a8a96',
              border: '1px solid #9bbbd0', borderRadius: '3px',
              cursor: 'pointer', transition: 'all 0.2s ease',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#9bbbd0'; e.currentTarget.style.color = '#17231f' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#5a8a96' }}
          >Cancel</button>
        </div>
      )}

      {/* Search Form */}
      <div style={{
        background: c.card,
        border: `1px solid ${c.cardBorder}`,
        borderRadius: '4px',
        padding: '20px 24px',
        marginBottom: '24px',
      }}>
        <form onSubmit={handleSearch}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr 1fr auto', gap: '12px', alignItems: 'end' }}>
            <div>
              <label style={{ display: 'block', fontSize: '9px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: c.textMuted, marginBottom: '6px' }}>From</label>
              <select
                value={search.origin}
                onChange={e => setSearch(p => ({...p, origin: e.target.value}))}
                required
                style={{
                  width: '100%', padding: '10px 12px', fontSize: '13px',
                  border: `1px solid ${c.border}`, borderRadius: '4px',
                  backgroundColor: c.card, color: c.text,
                  outline: 'none',
                }}
              >
                <option value="">Select Origin</option>
                {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div style={{ paddingBottom: '4px' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '50%',
                background: '#f7e1d6', display: 'grid', placeItems: 'center',
              }}>
                <i className="fas fa-exchange-alt" style={{ color: '#e86f3d', fontSize: '12px' }} />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '9px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: c.textMuted, marginBottom: '6px' }}>To</label>
              <select
                value={search.destination}
                onChange={e => setSearch(p => ({...p, destination: e.target.value}))}
                required
                style={{
                  width: '100%', padding: '10px 12px', fontSize: '13px',
                  border: `1px solid ${c.border}`, borderRadius: '4px',
                  backgroundColor: c.card, color: c.text,
                  outline: 'none',
                }}
              >
                <option value="">Select Destination</option>
                {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '9px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: c.textMuted, marginBottom: '6px' }}>Class</label>
              <select
                value={search.travelClass}
                onChange={e => setSearch(p => ({...p, travelClass: e.target.value}))}
                style={{
                  width: '100%', padding: '10px 12px', fontSize: '13px',
                  border: `1px solid ${c.border}`, borderRadius: '4px',
                  backgroundColor: c.card, color: c.text,
                  outline: 'none',
                }}
              >
                {CLASSES.map(c => <option key={c} value={c}>{c ? c.replace('_', ' ') : 'Any Class'}</option>)}
              </select>
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
            >
              {loading ? <span className="spinner-border spinner-border-sm" /> : <><i className="fas fa-search" /> Search Flights</>}
            </button>
          </div>
        </form>
      </div>

      <Row>
        {/* Filters Sidebar */}
        {searched && (
          <Col lg={3} className="mb-4">
            <Card className="shadow-sm border-0 rounded-4 sticky-top" style={{ top: '80px' }}>
              <Card.Header className="bg-white border-0 pt-4 px-4 rounded-top-4">
                <h6 className="fw-bold mb-0"><i className="fas fa-sliders-h me-2 text-primary" />Filters</h6>
              </Card.Header>
              <Card.Body className="px-4 pb-4">
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-semibold">Price Range (₹)</Form.Label>
                  <Row className="g-2">
                    <Col><Form.Control type="number" placeholder="Min" name="minPrice" value={filters.minPrice} onChange={handleFilterChange} className="rounded-3" size="sm" /></Col>
                    <Col><Form.Control type="number" placeholder="Max" name="maxPrice" value={filters.maxPrice} onChange={handleFilterChange} className="rounded-3" size="sm" /></Col>
                  </Row>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="small fw-semibold">Max Duration (min)</Form.Label>
                  <Form.Control type="number" name="maxDuration" value={filters.maxDuration} onChange={handleFilterChange} className="rounded-3" size="sm" placeholder="e.g. 300" />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="small fw-semibold">Max Stops</Form.Label>
                  <Form.Select name="maxStops" value={filters.maxStops} onChange={handleFilterChange} className="rounded-3" size="sm">
                    <option value="">Any</option>
                    <option value="0">Direct Only</option>
                    <option value="1">Up to 1 stop</option>
                    <option value="2">Up to 2 stops</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="small fw-semibold">Sort By</Form.Label>
                  <Form.Select name="sortBy" value={filters.sortBy} onChange={handleFilterChange} className="rounded-3" size="sm">
                    <option value="price">Price</option>
                    <option value="duration">Duration</option>
                    <option value="departureTime">Departure</option>
                  </Form.Select>
                </Form.Group>

                <div className="d-grid gap-2">
                  <Button variant="primary" size="sm" onClick={applyFilters} className="rounded-3">Apply Filters</Button>
                  <Button variant="outline-secondary" size="sm" onClick={resetFilters} className="rounded-3">Reset</Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        )}

        {/* Results */}
        <Col lg={searched ? 9 : 12}>
          {searched && <p className="text-muted mb-3 fw-semibold">{results.length} flight(s) found</p>}

          {results.map(flight => (
            <Card key={flight.id} className="mb-3 shadow-sm border-0 rounded-4 hover-shadow" style={{ transition: 'transform 0.15s, box-shadow 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 0.125rem 0.25rem rgba(0,0,0,0.075)' }}>
              <Card.Body className="p-4">
                <Row className="align-items-center">
                  {/* Airline Logo + Info */}
                  <Col md={2}>
                    <div className="d-flex align-items-center gap-3">
                      {flight.logoUrl ? (
                        <img src={flight.logoUrl} alt={flight.airline} className="rounded" style={{ width: 48, height: 48, objectFit: 'contain' }} />
                      ) : (
                        <div className="rounded-circle bg-primary bg-opacity-10 d-flex align-items-center justify-content-center" style={{ width: 48, height: 48 }}>
                          <i className="fas fa-plane text-primary" />
                        </div>
                      )}
                      <div>
                        <div className="fw-bold small">{flight.flightNumber}</div>
                        <small className="text-muted">{flight.airline}</small>
                      </div>
                    </div>
                  </Col>

                  {/* Departure */}
                  <Col md={2} className="text-center">
                    <h5 className="mb-0 fw-bold">{new Date(flight.departureDateTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</h5>
                    <small className="text-muted">{flight.originAirport || flight.origin}</small>
                  </Col>

                  {/* Duration + Arrow */}
                  <Col md={2} className="text-center">
                    <div className="d-flex align-items-center justify-content-center gap-2">
                      <div className="flex-grow-1 border-top border-2 border-dashed" />
                      <div>
                        <i className="fas fa-plane text-primary" />
                        <div className="small text-muted mt-1">{Math.floor(flight.durationMinutes/60)}h {flight.durationMinutes%60}m</div>
                      </div>
                      <div className="flex-grow-1 border-top border-2 border-dashed" />
                    </div>
                    <Badge bg={flight.stops === 0 ? 'success' : 'warning'} pill className="mt-1" style={{fontSize: '0.65rem'}}>
                      {flight.stops === 0 ? 'Direct' : `${flight.stops} stop(s)`}
                    </Badge>
                  </Col>

                  {/* Arrival */}
                  <Col md={2} className="text-center">
                    <h5 className="mb-0 fw-bold">{new Date(flight.arrivalDateTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</h5>
                    <small className="text-muted">{flight.destinationAirport || flight.destination}</small>
                  </Col>

                  {/* Class + Baggage */}
                  <Col md={1} className="text-center">
                    <Badge bg="light" text="dark" className="mb-1">{flight.travelClass.replace('_', ' ')}</Badge>
                    <div><small className="text-muted"><i className="fas fa-suitcase me-1" />{flight.baggageAllowanceKg}kg</small></div>
                  </Col>

                  {/* Price + Button */}
                  <Col md={3} className="text-end">
                    <h4 className="text-primary mb-1 fw-bold">₹{flight.price.toLocaleString()}</h4>
                    <small className="text-muted d-block mb-2">{flight.availableSeats} seats left</small>
                    <Button variant="primary" size="sm" className="px-3" onClick={() => selectFlight(flight)}
                      style={{ background: '#e86f3d', border: 'none' }}>
                      {isCombinedMode ? 'Add to Booking' : 'Select'} <i className="fas fa-arrow-right ms-1" />
                    </Button>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          ))}

          {searched && results.length === 0 && (
            <Card className="shadow-sm border-0 rounded-4">
              <Card.Body className="text-center py-5">
                <i className="fas fa-plane-slash fa-3x text-muted mb-3 d-block" />
                <h5 className="text-muted">No flights found</h5>
                <p className="text-muted">Try adjusting your search criteria or filters</p>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
    </div>
  )
}
