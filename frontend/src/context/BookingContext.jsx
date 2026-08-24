import { createContext, useContext, useState, useCallback } from 'react'

const BookingContext = createContext(null)

export function BookingProvider({ children }) {
  const [pendingHotel, setPendingHotel] = useState(null)

  const setPendingHotelSelection = useCallback((hotel, room) => {
    setPendingHotel({ hotel, room })
  }, [])

  const clearPendingHotel = useCallback(() => {
    setPendingHotel(null)
  }, [])

  return (
    <BookingContext.Provider value={{ pendingHotel, setPendingHotelSelection, clearPendingHotel }}>
      {children}
    </BookingContext.Provider>
  )
}

export const useBookingContext = () => useContext(BookingContext)
