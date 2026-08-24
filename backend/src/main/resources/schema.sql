-- Sunrise Database Schema
CREATE DATABASE IF NOT EXISTS project_sunrise;
USE project_sunrise;

-- Roles
CREATE TABLE IF NOT EXISTS roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(30) NOT NULL UNIQUE,
    description VARCHAR(255)
);

-- Users
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    employee_id VARCHAR(50) UNIQUE,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    account_locked BOOLEAN NOT NULL DEFAULT FALSE,
    google_id VARCHAR(100),
    profile_picture_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- User Roles
CREATE TABLE IF NOT EXISTS user_roles (
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

-- Employees
CREATE TABLE IF NOT EXISTS employees (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    designation VARCHAR(100),
    department VARCHAR(100),
    salary DECIMAL(12,2),
    salary_band VARCHAR(50),
    reporting_manager_email VARCHAR(150),
    reporting_manager_id BIGINT,
    location VARCHAR(100),
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reporting_manager_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Travel Policies
CREATE TABLE IF NOT EXISTS travel_policies (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    policy_name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    salary_band VARCHAR(50) NOT NULL,
    max_flight_class VARCHAR(30) NOT NULL,
    max_flight_price DECIMAL(10,2) NOT NULL,
    max_flight_duration_hours INT NOT NULL,
    max_hotel_star_rating INT NOT NULL,
    max_hotel_price_per_night DECIMAL(10,2) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_by BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Flights
CREATE TABLE IF NOT EXISTS flights (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    flight_number VARCHAR(10) NOT NULL,
    airline VARCHAR(100) NOT NULL,
    airline_code VARCHAR(10),
    origin VARCHAR(100) NOT NULL,
    origin_city VARCHAR(100),
    origin_airport VARCHAR(10),
    destination VARCHAR(100) NOT NULL,
    destination_city VARCHAR(100),
    destination_airport VARCHAR(10),
    departure_date_time DATETIME NOT NULL,
    arrival_date_time DATETIME NOT NULL,
    boarding_time TIME,
    duration_minutes INT NOT NULL,
    stops INT NOT NULL DEFAULT 0,
    travel_class VARCHAR(30) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    available_seats INT NOT NULL,
    baggage_allowance_kg INT NOT NULL,
    aircraft_type VARCHAR(100),
    logo_url VARCHAR(500),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_flights_search (origin, destination, travel_class, active)
);

-- Hotels
CREATE TABLE IF NOT EXISTS hotels (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    city VARCHAR(100) NOT NULL,
    country VARCHAR(100),
    address VARCHAR(200) NOT NULL,
    contact_email VARCHAR(200),
    contact_phone VARCHAR(50),
    latitude DECIMAL(10,7),
    longitude DECIMAL(10,7),
    image_url VARCHAR(500),
    star_rating INT NOT NULL,
    description TEXT,
    amenities VARCHAR(500),
    check_in_time TIME,
    check_out_time TIME,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_hotels_search (city, star_rating, active)
);

-- Hotel Rooms
CREATE TABLE IF NOT EXISTS hotel_rooms (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    hotel_id BIGINT NOT NULL,
    room_type VARCHAR(50) NOT NULL,
    price_per_night DECIMAL(10,2) NOT NULL,
    available_rooms INT NOT NULL,
    max_guests INT NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE
);

-- Bookings
CREATE TABLE IF NOT EXISTS bookings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    booking_reference VARCHAR(30) NOT NULL UNIQUE,
    employee_id BIGINT NOT NULL,
    status VARCHAR(30) NOT NULL,
    type VARCHAR(10) NOT NULL,
    travel_purpose VARCHAR(50) NOT NULL,
    travel_purpose_description VARCHAR(500),
    travel_start_date DATE NOT NULL,
    travel_end_date DATE NOT NULL,
    origin VARCHAR(100),
    destination VARCHAR(100),
    number_of_passengers INT NOT NULL,
    flight_id BIGINT,
    selected_flight_class VARCHAR(30),
    flight_price DECIMAL(10,2),
    hotel_id BIGINT,
    hotel_room_id BIGINT,
    hotel_price_per_night DECIMAL(10,2),
    hotel_nights INT,
    total_amount DECIMAL(12,2) NOT NULL,
    policy_compliant BOOLEAN NOT NULL DEFAULT TRUE,
    policy_violation_details VARCHAR(500),
    cancellation_reason VARCHAR(500),
    cancelled_by BIGINT,
    cancelled_at DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES users(id),
    FOREIGN KEY (flight_id) REFERENCES flights(id),
    FOREIGN KEY (hotel_id) REFERENCES hotels(id),
    FOREIGN KEY (hotel_room_id) REFERENCES hotel_rooms(id),
    FOREIGN KEY (cancelled_by) REFERENCES users(id),
    INDEX idx_bookings_employee (employee_id),
    INDEX idx_bookings_status (status)
);

-- Approvals
CREATE TABLE IF NOT EXISTS approvals (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    booking_id BIGINT NOT NULL,
    approver_id BIGINT NOT NULL,
    action VARCHAR(10) NOT NULL,
    rejection_reason VARCHAR(500),
    is_approved BOOLEAN NOT NULL,
    decided_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id),
    FOREIGN KEY (approver_id) REFERENCES users(id)
);

-- Payments
CREATE TABLE IF NOT EXISTS payments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    booking_id BIGINT NOT NULL,
    initiated_by BIGINT NOT NULL,
    razorpay_order_id VARCHAR(100),
    razorpay_payment_id VARCHAR(100),
    razorpay_signature VARCHAR(100),
    amount DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'INR',
    status VARCHAR(30) NOT NULL,
    payment_method VARCHAR(20) NOT NULL,
    failure_reason VARCHAR(500),
    refund_amount DECIMAL(12,2),
    razorpay_refund_id VARCHAR(100),
    refund_reason VARCHAR(500),
    refunded_at DATETIME,
    refunded_by BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id),
    FOREIGN KEY (initiated_by) REFERENCES users(id),
    FOREIGN KEY (refunded_by) REFERENCES users(id)
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(100) NOT NULL,
    message VARCHAR(1000) NOT NULL,
    type VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50),
    entity_id BIGINT,
    `is_read` BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_notifications_user (user_id, read)
);

-- Email Notifications
CREATE TABLE IF NOT EXISTS email_notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    recipient_email VARCHAR(150) NOT NULL,
    subject VARCHAR(200) NOT NULL,
    body TEXT NOT NULL,
    status VARCHAR(20) NOT NULL,
    error_message VARCHAR(500),
    related_notification_id BIGINT,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    delivered_at DATETIME,
    FOREIGN KEY (related_notification_id) REFERENCES notifications(id)
);

-- Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    actor_id BIGINT,
    actor_role VARCHAR(50),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id BIGINT,
    status VARCHAR(50),
    metadata VARCHAR(2000),
    ip_address VARCHAR(200),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (actor_id) REFERENCES users(id),
    INDEX idx_audit_logs_entity (entity_type, entity_id),
    INDEX idx_audit_logs_actor (actor_id),
    INDEX idx_audit_logs_timestamp (timestamp)
);

-- Password Reset Tokens
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    token VARCHAR(255) NOT NULL UNIQUE,
    user_id BIGINT NOT NULL,
    expiry_date DATETIME NOT NULL,
    used BOOLEAN NOT NULL DEFAULT FALSE,
    valid BOOLEAN NOT NULL DEFAULT TRUE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Refresh Tokens
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    token VARCHAR(255) NOT NULL UNIQUE,
    user_id BIGINT NOT NULL,
    expiry_date DATETIME NOT NULL,
    revoked BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Support Tickets
CREATE TABLE IF NOT EXISTS support_tickets (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    requester_id BIGINT NOT NULL,
    booking_id BIGINT,
    category VARCHAR(30) NOT NULL,
    subject VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(30) NOT NULL,
    priority VARCHAR(20) NOT NULL,
    assigned_admin_id BIGINT,
    resolved_at DATETIME,
    closed_at DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (requester_id) REFERENCES users(id),
    FOREIGN KEY (booking_id) REFERENCES bookings(id),
    FOREIGN KEY (assigned_admin_id) REFERENCES users(id),
    INDEX idx_support_tickets_requester (requester_id),
    INDEX idx_support_tickets_status (status)
);

-- Support Messages
CREATE TABLE IF NOT EXISTS support_messages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    ticket_id BIGINT NOT NULL,
    sender_id BIGINT NOT NULL,
    sender_role VARCHAR(30) NOT NULL,
    body TEXT NOT NULL,
    internal_note BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ticket_id) REFERENCES support_tickets(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id)
);

-- Support Attachments
CREATE TABLE IF NOT EXISTS support_attachments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    ticket_id BIGINT,
    message_id BIGINT,
    file_reference VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    content_type VARCHAR(100) NOT NULL,
    size BIGINT NOT NULL,
    uploaded_by BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ticket_id) REFERENCES support_tickets(id) ON DELETE CASCADE,
    FOREIGN KEY (message_id) REFERENCES support_messages(id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES users(id)
);
