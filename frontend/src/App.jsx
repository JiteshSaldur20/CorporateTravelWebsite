import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import MainLayout from './layouts/MainLayout'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import ResetPasswordPage from './pages/auth/ResetPasswordPage'
import OAuthCallback from './pages/auth/OAuthCallback'
import FlightSearchPage from './pages/employee/FlightSearchPage'
import HotelSearchPage from './pages/employee/HotelSearchPage'
import BookingCreatePage from './pages/employee/BookingCreatePage'
import MyBookingsPage from './pages/employee/MyBookingsPage'
import BookingDetailPage from './pages/employee/BookingDetailPage'
import ApprovalsPage from './pages/approver/ApprovalsPage'
import SupportPage from './pages/employee/SupportPage'
import AdminDashboard from './pages/admin/AdminDashboard'
import PaymentPage from './pages/admin/PaymentPage'
import AuditPage from './pages/admin/AuditPage'
import AdminSupportDashboard from './pages/admin/AdminSupportDashboard'
import TravelPolicyPage from './pages/admin/TravelPolicyPage'
import EmployeeDashboard from './pages/employee/EmployeeDashboard'
import ApproverDashboard from './pages/approver/ApproverDashboard'
import ProfilePage from './pages/employee/ProfilePage'
import './styles/App.css'

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="d-flex justify-content-center p-5"><div className="spinner-border" /></div>
  if (!user) return <Navigate to="/login" />
  if (roles && !roles.some(r => user.roles.includes(`ROLE_${r}`) || user.roles.includes(r))) {
    return <Navigate to="/" />
  }
  return children
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
      <Route path="/auth/callback" element={<OAuthCallback />} />

      <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
        <Route index element={<EmployeeDashboard />} />
        <Route path="flights" element={<FlightSearchPage />} />
        <Route path="hotels" element={<HotelSearchPage />} />
        <Route path="bookings/create" element={<BookingCreatePage />} />
        <Route path="bookings" element={<MyBookingsPage />} />
        <Route path="bookings/:id" element={<BookingDetailPage />} />
        <Route path="support" element={<SupportPage />} />
        <Route path="profile" element={<ProfilePage />} />

        {/* Approver routes */}
        <Route path="approvals" element={
          <ProtectedRoute roles={['MANAGER', 'ADMIN']}>
            <ApprovalsPage />
          </ProtectedRoute>
        } />
        <Route path="approver-dashboard" element={
          <ProtectedRoute roles={['MANAGER', 'ADMIN']}>
            <ApproverDashboard />
          </ProtectedRoute>
        } />

        {/* Admin routes */}
        <Route path="admin/dashboard" element={
          <ProtectedRoute roles={['ADMIN']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="admin/payments" element={
          <ProtectedRoute roles={['ADMIN']}>
            <PaymentPage />
          </ProtectedRoute>
        } />
        <Route path="admin/audit" element={
          <ProtectedRoute roles={['ADMIN']}>
            <AuditPage />
          </ProtectedRoute>
        } />
        <Route path="admin/support" element={
          <ProtectedRoute roles={['ADMIN']}>
            <AdminSupportDashboard />
          </ProtectedRoute>
        } />
        <Route path="admin/policies" element={
          <ProtectedRoute roles={['ADMIN']}>
            <TravelPolicyPage />
          </ProtectedRoute>
        } />

        {/* Policy view for all roles */}
        <Route path="policies" element={<TravelPolicyPage />} />
      </Route>
    </Routes>
  )
}

export default App
