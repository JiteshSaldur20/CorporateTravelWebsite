# Sunrise - Corporate Travel Booking Platform

A full-stack corporate travel booking platform with role-based access control, policy enforcement, company-paid model, and support module.

## Tech Stack

### Backend
- **Java 17** + **Spring Boot 3.2.5**
- Spring Security with JWT + Google OAuth2
- Spring Data JPA + Hibernate
- MySQL Database
- Razorpay Java SDK (Test Mode)
- Mailtrap SMTP

### Frontend
- **React 18** + **Vite**
- Bootstrap 5 + React-Bootstrap
- Chart.js + react-chartjs-2
- Axios for API calls
- React Router v6

## Features

- **Three roles**: Employee (USER), Manager (APPROVER), Admin
- **Flight & Hotel search** with server-side filtering and sorting
- **Corporate policy engine** with blocking enforcement
- **Booking state machine**: PENDING → APPROVED → PAYMENT_SUCCESS → TICKETED
- **Company-paid model**: Admin initiates payment, not employees
- **Razorpay test mode** integration
- **Email notifications** via Mailtrap
- **In-app notifications** with unread count
- **Role-specific dashboards** with charts
- **Admin audit logging** with filters and pagination
- **Support/Help Center** with ticket workflow
- **Dark/light mode** persisted per user
- **Responsive Bootstrap UI**

## Setup Instructions

### Prerequisites
- Java 17+
- Node.js 18+
- MySQL 8+

### Database Setup
```sql
CREATE DATABASE project_sunrise;
```

The application uses `hibernate.ddl-auto=validate` by default. To use auto-DDL for development, change it to `update` in `application.yml`.

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_USERNAME` | MySQL username | root |
| `DB_PASSWORD` | MySQL password | root |
| `JWT_SECRET` | JWT signing secret (min 32 bytes) | (built-in) |
| `GOOGLE_CLIENT_ID` | Google OAuth2 client ID | - |
| `GOOGLE_CLIENT_SECRET` | Google OAuth2 client secret | - |
| `RAZORPAY_KEY_ID` | Razorpay test key | rzp_test_demo |
| `RAZORPAY_KEY_SECRET` | Razorpay test secret | demo_secret |
| `MAIL_HOST` | SMTP host | smtp.mailtrap.io |
| `MAIL_PORT` | SMTP port | 587 |
| `MAIL_USERNAME` | Mailtrap username | - |
| `MAIL_PASSWORD` | Mailtrap password | - |
| `FRONTEND_URL` | Frontend URL | http://localhost:5173 |

### Backend Setup
```bash
cd backend
mvn clean install
mvn spring-boot:run
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

The frontend runs at `http://localhost:5173` and the backend at `http://localhost:8080`.

## Default Development Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@sunrise.com | admin123 |
| Manager | manager@sunrise.com | manager123 |
| Employee | employee@sunrise.com | employee123 |

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Flights
- `GET /api/flights/search` - Search flights (with filters)
- `GET /api/flights/{id}` - Get flight details

### Hotels
- `GET /api/hotels/search` - Search hotels (with filters)
- `GET /api/hotels/{id}` - Get hotel details

### Policy
- `GET /api/policies/me` - Get my travel policy
- `POST /api/policies/validate` - Validate against policy

### Bookings
- `POST /api/bookings` - Create booking request
- `GET /api/bookings/my` - Get my bookings
- `GET /api/bookings/{id}` - Get booking details
- `POST /api/bookings/{id}/cancel` - Cancel booking

### Approvals (Manager)
- `GET /api/approvals/pending` - Get pending approvals
- `POST /api/approvals/{id}/approve` - Approve booking
- `POST /api/approvals/{id}/reject` - Reject booking (requires reason)

### Payments (Admin Only)
- `POST /api/payments/{bookingId}/order` - Create Razorpay order
- `POST /api/payments/verify` - Verify payment
- `GET /api/payments/{bookingId}` - Get payment status

### Notifications
- `GET /api/notifications` - Get notifications
- `GET /api/notifications/unread-count` - Get unread count
- `PATCH /api/notifications/{id}/read` - Mark as read
- `PATCH /api/notifications/read-all` - Mark all as read

### Dashboards
- `GET /api/dashboard/employee` - Employee dashboard
- `GET /api/dashboard/approver` - Manager dashboard
- `GET /api/dashboard/admin` - Admin dashboard

### Admin
- `GET /api/admin/audit-logs` - Search audit logs

### Support
- `POST /api/support/tickets` - Create ticket
- `GET /api/support/tickets/my` - My tickets
- `GET /api/support/tickets/{id}` - Ticket detail
- `POST /api/support/tickets/{id}/messages` - Reply to ticket
- `GET /api/support/admin/tickets` - Admin: search tickets
- `PATCH /api/support/admin/tickets/{id}/status` - Update status
- `PATCH /api/support/admin/tickets/{id}/assign` - Assign ticket
- `PATCH /api/support/admin/tickets/{id}/priority` - Update priority

## Booking State Machine
```
PENDING
 ├── APPROVE → APPROVED
 │               └── PAYMENT SUCCESS → TICKETED
 └── REJECT → REJECTED

APPROVED / TICKETED
 └── valid cancellation → CANCELLED
```

## Seed Data

The application automatically seeds:
- 3 roles (USER, MANAGER, ADMIN)
- 4 users with employee profiles
- 3 travel policies (Band A, B, C)
- 9 mock flights across multiple routes
- 6 hotels with multiple room types

## End-to-End Workflow

1. Employee logs in and searches flights/hotels
2. Employee applies filters and selects an eligible option
3. Backend validates against corporate policy
4. Employee enters mandatory travel purpose and submits
5. Booking becomes PENDING; manager is notified
6. Manager approves or rejects (rejection requires reason)
7. If approved, Admin sees payment-required action
8. Admin initiates company payment (Razorpay order)
9. Admin completes checkout; backend verifies signature
10. Payment becomes SUCCESS after server-side verification
11. Employee receives notification
12. Booking moves to TICKETED
13. Audit logs reflect all transitions

## License

Internal use only - Sunrise
