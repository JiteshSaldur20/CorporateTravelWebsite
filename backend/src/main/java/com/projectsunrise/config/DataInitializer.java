package com.projectsunrise.config;

import com.projectsunrise.entity.*;
import com.projectsunrise.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final EmployeeProfileRepository employeeProfileRepository;
    private final TravelPolicyRepository policyRepository;
    private final FlightRepository flightRepository;
    private final HotelRepository hotelRepository;
    private final HotelRoomRepository hotelRoomRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (flightRepository.count() > 0) {
            log.info("Data already initialized, skipping...");
            return;
        }

        log.info("Initializing seed data...");

        // Create roles (get existing or create new)
        Role userRole = roleRepository.findByName(Role.RoleName.USER)
            .orElseGet(() -> roleRepository.save(Role.builder().name(Role.RoleName.USER).description("Employee").build()));
        Role managerRole = roleRepository.findByName(Role.RoleName.MANAGER)
            .orElseGet(() -> roleRepository.save(Role.builder().name(Role.RoleName.MANAGER).description("Approver/Manager").build()));
        Role adminRole = roleRepository.findByName(Role.RoleName.ADMIN)
            .orElseGet(() -> roleRepository.save(Role.builder().name(Role.RoleName.ADMIN).description("Administrator").build()));

        // Create users
        User admin = createUser("Admin User", "admin@sunrise.com", "admin123", Set.of(adminRole));
        User manager = createUser("Manager User", "manager@sunrise.com", "manager123", Set.of(managerRole));
        User employee1 = createUser("John Employee", "employee@sunrise.com", "employee123", Set.of(userRole));
        User employee2 = createUser("Jane Smith", "jane@sunrise.com", "employee123", Set.of(userRole));

        // Create employee profiles
        EmployeeProfile adminProfile = EmployeeProfile.builder()
            .user(admin).designation("IT Director").department("Technology")
            .salary(new BigDecimal("200000")).salaryBand("BAND_C")
            .location("Mumbai").phone("9876543210").build();
        employeeProfileRepository.save(adminProfile);

        EmployeeProfile managerProfile = EmployeeProfile.builder()
            .user(manager).designation("Senior Manager").department("Operations")
            .salary(new BigDecimal("150000")).salaryBand("BAND_B")
            .location("Mumbai").phone("9876543211").reportingManager(admin).build();
        employeeProfileRepository.save(managerProfile);

        EmployeeProfile emp1Profile = EmployeeProfile.builder()
            .user(employee1).designation("Software Engineer").department("Technology")
            .salary(new BigDecimal("80000")).salaryBand("BAND_A")
            .location("Pune").phone("9876543212").reportingManager(manager).build();
        employeeProfileRepository.save(emp1Profile);

        EmployeeProfile emp2Profile = EmployeeProfile.builder()
            .user(employee2).designation("Business Analyst").department("Operations")
            .salary(new BigDecimal("90000")).salaryBand("BAND_A")
            .location("Delhi").phone("9876543213").reportingManager(manager).build();
        employeeProfileRepository.save(emp2Profile);

        // Create travel policies
        policyRepository.save(TravelPolicy.builder()
            .policyName("Band A Policy")
            .description("Policy for entry-level employees")
            .salaryBand("BAND_A")
            .maxFlightClass(TravelPolicy.FlightClass.ECONOMY)
            .maxFlightPrice(new BigDecimal("15000"))
            .maxFlightDurationHours(6)
            .maxHotelStarRating(3)
            .maxHotelPricePerNight(new BigDecimal("5000"))
            .active(true)
            .createdBy(admin)
            .build());

        policyRepository.save(TravelPolicy.builder()
            .policyName("Band B Policy")
            .description("Policy for mid-level employees")
            .salaryBand("BAND_B")
            .maxFlightClass(TravelPolicy.FlightClass.PREMIUM_ECONOMY)
            .maxFlightPrice(new BigDecimal("30000"))
            .maxFlightDurationHours(10)
            .maxHotelStarRating(4)
            .maxHotelPricePerNight(new BigDecimal("10000"))
            .active(true)
            .createdBy(admin)
            .build());

        policyRepository.save(TravelPolicy.builder()
            .policyName("Band C Policy")
            .description("Policy for senior employees")
            .salaryBand("BAND_C")
            .maxFlightClass(TravelPolicy.FlightClass.BUSINESS)
            .maxFlightPrice(new BigDecimal("80000"))
            .maxFlightDurationHours(16)
            .maxHotelStarRating(5)
            .maxHotelPricePerNight(new BigDecimal("25000"))
            .active(true)
            .createdBy(admin)
            .build());

        // Create mock flights with new fields
        createMockFlights();
        createMockHotels();

        log.info("Seed data initialized successfully!");
        log.info("Default accounts:");
        log.info("  Admin:     admin@sunrise.com / admin123");
        log.info("  Manager:   manager@sunrise.com / manager123");
        log.info("  Employee:  employee@sunrise.com / employee123");
    }

    private User createUser(String name, String email, String password, Set<Role> roles) {
        User user = User.builder()
            .fullName(name)
            .email(email)
            .password(passwordEncoder.encode(password))
            .enabled(true)
            .roles(new HashSet<>(roles))
            .build();
        return userRepository.save(user);
    }

    private static LocalDateTime flightDate(int daysFromNow, int hour, int minute) {
        return LocalDateTime.now().plusDays(daysFromNow).withHour(hour).withMinute(minute).withSecond(0).withNano(0);
    }

    private void createMockFlights() {
        flightRepository.save(Flight.builder()
            .flightNumber("AI-301").airline("Air India").airlineCode("AI")
            .origin("Mumbai").originCity("Mumbai").originAirport("BOM")
            .destination("Delhi").destinationCity("New Delhi").destinationAirport("DEL")
            .departureDateTime(flightDate(1, 6, 0))
            .arrivalDateTime(flightDate(1, 8, 15))
            .boardingTime(java.time.LocalTime.of(5, 30))
            .durationMinutes(135).stops(0)
            .travelClass(TravelPolicy.FlightClass.ECONOMY)
            .price(new BigDecimal("5500")).availableSeats(50).baggageAllowanceKg(15)
            .aircraftType("Airbus A320neo")
            .logoUrl("https://placehold.co/200x200/e2231a/ffffff?text=AI")
            .build());

        flightRepository.save(Flight.builder()
            .flightNumber("SG-201").airline("SpiceJet").airlineCode("SG")
            .origin("Mumbai").originCity("Mumbai").originAirport("BOM")
            .destination("Delhi").destinationCity("New Delhi").destinationAirport("DEL")
            .departureDateTime(flightDate(1, 7, 30))
            .arrivalDateTime(flightDate(1, 9, 45))
            .boardingTime(java.time.LocalTime.of(7, 0))
            .durationMinutes(135).stops(0)
            .travelClass(TravelPolicy.FlightClass.ECONOMY)
            .price(new BigDecimal("4200")).availableSeats(30).baggageAllowanceKg(15)
            .aircraftType("Boeing 737")
            .logoUrl("https://placehold.co/200x200/e6001f/ffffff?text=SG")
            .build());

        flightRepository.save(Flight.builder()
            .flightNumber("AI-302").airline("Air India").airlineCode("AI")
            .origin("Mumbai").originCity("Mumbai").originAirport("BOM")
            .destination("Delhi").destinationCity("New Delhi").destinationAirport("DEL")
            .departureDateTime(flightDate(1, 10, 0))
            .arrivalDateTime(flightDate(1, 12, 20))
            .boardingTime(java.time.LocalTime.of(9, 30))
            .durationMinutes(140).stops(0)
            .travelClass(TravelPolicy.FlightClass.PREMIUM_ECONOMY)
            .price(new BigDecimal("12000")).availableSeats(20).baggageAllowanceKg(25)
            .aircraftType("Airbus A321")
            .logoUrl("https://placehold.co/200x200/e2231a/ffffff?text=AI")
            .build());

        flightRepository.save(Flight.builder()
            .flightNumber("AI-305").airline("Air India").airlineCode("AI")
            .origin("Mumbai").originCity("Mumbai").originAirport("BOM")
            .destination("Delhi").destinationCity("New Delhi").destinationAirport("DEL")
            .departureDateTime(flightDate(1, 14, 0))
            .arrivalDateTime(flightDate(1, 16, 20))
            .boardingTime(java.time.LocalTime.of(13, 30))
            .durationMinutes(140).stops(0)
            .travelClass(TravelPolicy.FlightClass.BUSINESS)
            .price(new BigDecimal("28000")).availableSeats(10).baggageAllowanceKg(30)
            .aircraftType("Boeing 777-300ER")
            .logoUrl("https://placehold.co/200x200/e2231a/ffffff?text=AI")
            .build());

        flightRepository.save(Flight.builder()
            .flightNumber("6E-301").airline("IndiGo").airlineCode("6E")
            .origin("Mumbai").originCity("Mumbai").originAirport("BOM")
            .destination("Delhi").destinationCity("New Delhi").destinationAirport("DEL")
            .departureDateTime(flightDate(1, 8, 0))
            .arrivalDateTime(flightDate(1, 12, 0))
            .boardingTime(java.time.LocalTime.of(7, 30))
            .durationMinutes(240).stops(1)
            .travelClass(TravelPolicy.FlightClass.ECONOMY)
            .price(new BigDecimal("3800")).availableSeats(40).baggageAllowanceKg(15)
            .aircraftType("Airbus A320neo")
            .logoUrl("https://placehold.co/200x200/00285a/ffffff?text=6E")
            .build());

        flightRepository.save(Flight.builder()
            .flightNumber("6E-501").airline("IndiGo").airlineCode("6E")
            .origin("Pune").originCity("Pune").originAirport("PNQ")
            .destination("Bangalore").destinationCity("Bengaluru").destinationAirport("BLR")
            .departureDateTime(flightDate(2, 9, 0))
            .arrivalDateTime(flightDate(2, 10, 30))
            .boardingTime(java.time.LocalTime.of(8, 30))
            .durationMinutes(90).stops(0)
            .travelClass(TravelPolicy.FlightClass.ECONOMY)
            .price(new BigDecimal("6500")).availableSeats(60).baggageAllowanceKg(15)
            .aircraftType("Airbus A320neo")
            .logoUrl("https://placehold.co/200x200/00285a/ffffff?text=6E")
            .build());

        flightRepository.save(Flight.builder()
            .flightNumber("SG-502").airline("SpiceJet").airlineCode("SG")
            .origin("Pune").originCity("Pune").originAirport("PNQ")
            .destination("Bangalore").destinationCity("Bengaluru").destinationAirport("BLR")
            .departureDateTime(flightDate(2, 14, 0))
            .arrivalDateTime(flightDate(2, 15, 30))
            .boardingTime(java.time.LocalTime.of(13, 30))
            .durationMinutes(90).stops(0)
            .travelClass(TravelPolicy.FlightClass.PREMIUM_ECONOMY)
            .price(new BigDecimal("11000")).availableSeats(25).baggageAllowanceKg(25)
            .aircraftType("Boeing 737")
            .logoUrl("https://placehold.co/200x200/e6001f/ffffff?text=SG")
            .build());

        flightRepository.save(Flight.builder()
            .flightNumber("AI-401").airline("Air India").airlineCode("AI")
            .origin("Delhi").originCity("New Delhi").originAirport("DEL")
            .destination("Mumbai").destinationCity("Mumbai").destinationAirport("BOM")
            .departureDateTime(flightDate(3, 18, 0))
            .arrivalDateTime(flightDate(3, 20, 15))
            .boardingTime(java.time.LocalTime.of(17, 30))
            .durationMinutes(135).stops(0)
            .travelClass(TravelPolicy.FlightClass.ECONOMY)
            .price(new BigDecimal("5800")).availableSeats(45).baggageAllowanceKg(15)
            .aircraftType("Airbus A320neo")
            .logoUrl("https://placehold.co/200x200/e2231a/ffffff?text=AI")
            .build());

        flightRepository.save(Flight.builder()
            .flightNumber("AI-801").airline("Air India").airlineCode("AI")
            .origin("Mumbai").originCity("Mumbai").originAirport("BOM")
            .destination("Singapore").destinationCity("Singapore").destinationAirport("SIN")
            .departureDateTime(flightDate(5, 23, 0))
            .arrivalDateTime(flightDate(6, 7, 0))
            .boardingTime(java.time.LocalTime.of(22, 30))
            .durationMinutes(480).stops(0)
            .travelClass(TravelPolicy.FlightClass.BUSINESS)
            .price(new BigDecimal("65000")).availableSeats(12).baggageAllowanceKg(30)
            .aircraftType("Boeing 787-9")
            .logoUrl("https://placehold.co/200x200/e2231a/ffffff?text=AI")
            .build());
    }

    private void createMockHotels() {
        Hotel hotel1 = hotelRepository.save(Hotel.builder()
            .name("Taj Palace Delhi").city("Delhi").country("India")
            .address("2 Sardar Patel Marg, Diplomatic Enclave")
            .starRating(5).description("Luxury 5-star hotel in the heart of Delhi with world-class amenities and personalized service")
            .amenities("WiFi,Pool,Gym,Spa,Restaurant,Room Service,Business Center")
            .contactEmail("reservations.delhi@tajhotels.example")
            .contactPhone("+91-11-26110202")
            .latitude(new BigDecimal("28.5921000")).longitude(new BigDecimal("77.1806000"))
            .imageUrl("/images/hotels/hotel1.webp")
            .checkInTime(java.time.LocalTime.of(14, 0))
            .checkOutTime(java.time.LocalTime.of(12, 0))
            .build());
        hotelRoomRepository.save(HotelRoom.builder().hotel(hotel1).roomType("SINGLE")
            .pricePerNight(new BigDecimal("8000")).availableRooms(20).maxGuests(1).build());
        hotelRoomRepository.save(HotelRoom.builder().hotel(hotel1).roomType("DOUBLE")
            .pricePerNight(new BigDecimal("12000")).availableRooms(15).maxGuests(2).build());
        hotelRoomRepository.save(HotelRoom.builder().hotel(hotel1).roomType("SUITE")
            .pricePerNight(new BigDecimal("25000")).availableRooms(5).maxGuests(3).build());

        Hotel hotel2 = hotelRepository.save(Hotel.builder()
            .name("The Grand New Delhi").city("Delhi").country("India")
            .address("Nehru Place, Delhi")
            .starRating(4).description("Premium hotel with modern amenities, ideal for business travelers")
            .amenities("WiFi,Gym,Restaurant,Business Center,Laundry,AC")
            .contactEmail("reservations.grand@delhi.example")
            .contactPhone("+91-11-26220000")
            .latitude(new BigDecimal("28.5494000")).longitude(new BigDecimal("77.2537000"))
            .imageUrl("/images/hotels/hotel2.webp")
            .checkInTime(java.time.LocalTime.of(14, 0))
            .checkOutTime(java.time.LocalTime.of(11, 0))
            .build());
        hotelRoomRepository.save(HotelRoom.builder().hotel(hotel2).roomType("SINGLE")
            .pricePerNight(new BigDecimal("5000")).availableRooms(25).maxGuests(1).build());
        hotelRoomRepository.save(HotelRoom.builder().hotel(hotel2).roomType("DOUBLE")
            .pricePerNight(new BigDecimal("8000")).availableRooms(20).maxGuests(2).build());

        Hotel hotel3 = hotelRepository.save(Hotel.builder()
            .name("OYO Budget Stay Delhi").city("Delhi").country("India")
            .address("Karol Bagh, Delhi")
            .starRating(3).description("Affordable stay with basic amenities, close to markets and metro")
            .amenities("WiFi,AC,Parking")
            .contactEmail("support@oyo.example")
            .contactPhone("+91-11-46000000")
            .latitude(new BigDecimal("28.6519000")).longitude(new BigDecimal("77.1893000"))
            .imageUrl("/images/hotels/hotel3.webp")
            .checkInTime(java.time.LocalTime.of(12, 0))
            .checkOutTime(java.time.LocalTime.of(11, 0))
            .build());
        hotelRoomRepository.save(HotelRoom.builder().hotel(hotel3).roomType("SINGLE")
            .pricePerNight(new BigDecimal("2000")).availableRooms(30).maxGuests(1).build());
        hotelRoomRepository.save(HotelRoom.builder().hotel(hotel3).roomType("DOUBLE")
            .pricePerNight(new BigDecimal("3500")).availableRooms(25).maxGuests(2).build());

        Hotel hotel4 = hotelRepository.save(Hotel.builder()
            .name("Taj Lands End Mumbai").city("Mumbai").country("India")
            .address("Bandra West, Mumbai")
            .starRating(5).description("Iconic waterfront luxury hotel with stunning Arabian Sea views")
            .amenities("WiFi,Pool,Gym,Spa,Restaurant,Room Service,Business Center,Parking")
            .contactEmail("reservations.mumbai@tajhotels.example")
            .contactPhone("+91-22-66681234")
            .latitude(new BigDecimal("19.0434000")).longitude(new BigDecimal("72.8209000"))
            .imageUrl("/images/hotels/hotel4.webp")
            .checkInTime(java.time.LocalTime.of(14, 0))
            .checkOutTime(java.time.LocalTime.of(12, 0))
            .build());
        hotelRoomRepository.save(HotelRoom.builder().hotel(hotel4).roomType("SINGLE")
            .pricePerNight(new BigDecimal("10000")).availableRooms(15).maxGuests(1).build());
        hotelRoomRepository.save(HotelRoom.builder().hotel(hotel4).roomType("DOUBLE")
            .pricePerNight(new BigDecimal("15000")).availableRooms(10).maxGuests(2).build());
        hotelRoomRepository.save(HotelRoom.builder().hotel(hotel4).roomType("SUITE")
            .pricePerNight(new BigDecimal("30000")).availableRooms(3).maxGuests(3).build());

        Hotel hotel5 = hotelRepository.save(Hotel.builder()
            .name("Hotel Residency Mumbai").city("Mumbai").country("India")
            .address("Andheri East, Mumbai")
            .starRating(3).description("Comfortable mid-range hotel near airport with free parking")
            .amenities("WiFi,AC,Restaurant,Parking,Room Service")
            .contactEmail("reservations@residency.example")
            .contactPhone("+91-22-28340000")
            .latitude(new BigDecimal("19.1136000")).longitude(new BigDecimal("72.8697000"))
            .imageUrl("/images/hotels/hotel5.webp")
            .checkInTime(java.time.LocalTime.of(13, 0))
            .checkOutTime(java.time.LocalTime.of(11, 0))
            .build());
        hotelRoomRepository.save(HotelRoom.builder().hotel(hotel5).roomType("SINGLE")
            .pricePerNight(new BigDecimal("3000")).availableRooms(20).maxGuests(1).build());
        hotelRoomRepository.save(HotelRoom.builder().hotel(hotel5).roomType("DOUBLE")
            .pricePerNight(new BigDecimal("4500")).availableRooms(15).maxGuests(2).build());

        Hotel hotel6 = hotelRepository.save(Hotel.builder()
            .name("ITC Gardenia Bangalore").city("Bangalore").country("India")
            .address("Residency Road, Bangalore")
            .starRating(5).description("Premium business hotel with world-class facilities and lush gardens")
            .amenities("WiFi,Pool,Gym,Spa,Restaurant,Room Service,Business Center,Parking")
            .contactEmail("reservations.blr@itchotels.example")
            .contactPhone("+91-80-22119898")
            .latitude(new BigDecimal("12.9698000")).longitude(new BigDecimal("77.6019000"))
            .imageUrl("/images/hotels/hotel6.jpg")
            .checkInTime(java.time.LocalTime.of(14, 0))
            .checkOutTime(java.time.LocalTime.of(12, 0))
            .build());
        hotelRoomRepository.save(HotelRoom.builder().hotel(hotel6).roomType("SINGLE")
            .pricePerNight(new BigDecimal("9000")).availableRooms(18).maxGuests(1).build());
        hotelRoomRepository.save(HotelRoom.builder().hotel(hotel6).roomType("DOUBLE")
            .pricePerNight(new BigDecimal("13000")).availableRooms(12).maxGuests(2).build());
    }
}
