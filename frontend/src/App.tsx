import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ui/ProtectedRoute';

// ── Layout shells ──────────────────────────────────────────
import { PublicLayout }       from './layouts/PublicLayout';
import { ReceptionLayout }    from './layouts/ReceptionLayout';
import { HousekeepingLayout } from './layouts/HousekeepingLayout';
import { AdminLayout }        from './layouts/AdminLayout';

// ── Public pages ────────────────────────────────────────────
import { LandingPage }             from './pages/LandingPage';
import { AuthPage }                from './pages/AuthPage';
import { SearchResultsPage }       from './pages/SearchResultsPage';
import { HotelDetailPage }         from './pages/HotelDetailPage';
import { BookingConfirmationPage }  from './pages/BookingConfirmationPage';
import { OffersPage }              from './pages/OffersPage';
import { AboutPage }               from './pages/AboutPage';
import { ContactPage }             from './pages/ContactPage';

// ── Guest account pages ─────────────────────────────────────
import { GuestDashboardPage } from './pages/GuestDashboardPage';
import { GuestProfilePage }   from './pages/GuestProfilePage';
import { InvoicePaymentPage } from './pages/InvoicePaymentPage';
import { NotificationsPage }  from './pages/NotificationsPage';

// ── Reception portal pages ──────────────────────────────────
import { ReceptionDashboardPage } from './pages/staff/reception/DashboardPage';
import { ArrivalsPage }           from './pages/staff/reception/ArrivalsPage';
import { DeparturesPage }         from './pages/staff/reception/DeparturesPage';
import { ReservationsPage }       from './pages/staff/reception/ReservationsPage';
import { GuestLookupPage }        from './pages/staff/reception/GuestLookupPage';
import { RoomAvailabilityPage }   from './pages/staff/reception/RoomAvailabilityPage';
import { ReceptionBillingPage }   from './pages/staff/reception/ReceptionBillingPage';

// ── Housekeeping portal pages ───────────────────────────────
import { MyTasksPage }      from './pages/staff/housekeeping/MyTasksPage';
import { RoomsToCleanPage } from './pages/staff/housekeeping/RoomsToCleanPage';
import { InProgressPage }   from './pages/staff/housekeeping/InProgressPage';
import { CleanReadyPage }   from './pages/staff/housekeeping/CleanReadyPage';
import { MaintenancePage }  from './pages/staff/housekeeping/MaintenancePage';
import { HistoryPage }      from './pages/staff/housekeeping/HistoryPage';

// ── Admin portal pages ──────────────────────────────────────
import { AdminDashboardPage }    from './pages/AdminDashboardPage';
import { SystemDesignPage }      from './pages/admin/SystemDesignPage';
import { AdminHotelsPage }       from './pages/admin/AdminHotelsPage';
import { AdminBookingsPage }     from './pages/admin/AdminBookingsPage';
import { AdminGuestsPage }       from './pages/admin/AdminGuestsPage';
import { AdminHousekeepingPage } from './pages/admin/AdminHousekeepingPage';
import { AdminBillingPage }      from './pages/admin/AdminBillingPage';
import { SystemHealthPage }      from './pages/admin/SystemHealthPage';
import { ReportsPage }           from './pages/admin/ReportsPage';
import { SettingsPage }          from './pages/admin/SettingsPage';
import { PricingPage }           from './pages/admin/PricingPage';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>

          {/* ══════════════════════════════════════════════
              PUBLIC LAYOUT — Navbar + Footer
              All guest-facing and unauthenticated pages
          ══════════════════════════════════════════════ */}
          <Route element={<PublicLayout />}>
            <Route path="/"         element={<LandingPage />} />
            <Route path="/hotels"   element={<SearchResultsPage />} />
            <Route path="/hotels/:hotelId" element={<HotelDetailPage />} />
            <Route path="/offers"   element={<OffersPage />} />
            <Route path="/about"    element={<AboutPage />} />
            <Route path="/contact"  element={<ContactPage />} />

            {/* Auth */}
            <Route path="/login"    element={<AuthPage />} />
            <Route path="/register" element={<AuthPage initialMode="register" />} />
            <Route path="/auth"     element={<Navigate to="/login" replace />} />

            {/* Booking confirmation — accessible to anyone with the link */}
            <Route path="/booking-confirmation/:bookingId" element={<BookingConfirmationPage />} />

            {/* ── Guest account (any authenticated role) ── */}
            <Route path="/my-account" element={
              <ProtectedRoute allowedRoles={['GUEST', 'RECEPTIONIST', 'HOUSEKEEPING', 'ADMIN']}>
                <GuestDashboardPage />
              </ProtectedRoute>
            } />
            <Route path="/my-account/bookings" element={
              <ProtectedRoute allowedRoles={['GUEST', 'RECEPTIONIST', 'HOUSEKEEPING', 'ADMIN']}>
                <GuestDashboardPage />
              </ProtectedRoute>
            } />
            <Route path="/my-account/bookings/:bookingId" element={
              <ProtectedRoute allowedRoles={['GUEST', 'RECEPTIONIST', 'HOUSEKEEPING', 'ADMIN']}>
                <InvoicePaymentPage />
              </ProtectedRoute>
            } />
            <Route path="/my-account/invoices" element={
              <ProtectedRoute allowedRoles={['GUEST', 'RECEPTIONIST', 'HOUSEKEEPING', 'ADMIN']}>
                <InvoicePaymentPage />
              </ProtectedRoute>
            } />
            <Route path="/my-account/notifications" element={
              <ProtectedRoute allowedRoles={['GUEST', 'RECEPTIONIST', 'HOUSEKEEPING', 'ADMIN']}>
                <NotificationsPage />
              </ProtectedRoute>
            } />
            <Route path="/my-account/profile" element={
              <ProtectedRoute allowedRoles={['GUEST', 'RECEPTIONIST', 'HOUSEKEEPING', 'ADMIN']}>
                <GuestProfilePage />
              </ProtectedRoute>
            } />

            {/* Legacy redirects */}
            <Route path="/dashboard"     element={<Navigate to="/my-account" replace />} />
            <Route path="/profile"       element={<Navigate to="/my-account/profile" replace />} />
            <Route path="/notifications" element={<Navigate to="/my-account/notifications" replace />} />
          </Route>

          {/* ══════════════════════════════════════════════
              RECEPTION LAYOUT — Dedicated staff sidebar
              No public Navbar or Footer
          ══════════════════════════════════════════════ */}
          <Route element={
            <ProtectedRoute allowedRoles={['RECEPTIONIST', 'ADMIN']}>
              <ReceptionLayout />
            </ProtectedRoute>
          }>
            <Route path="/staff/reception"              element={<ReceptionDashboardPage />} />
            <Route path="/staff/reception/arrivals"     element={<ArrivalsPage />} />
            <Route path="/staff/reception/departures"   element={<DeparturesPage />} />
            <Route path="/staff/reception/reservations" element={<ReservationsPage />} />
            <Route path="/staff/reception/guests"       element={<GuestLookupPage />} />
            <Route path="/staff/reception/rooms"        element={<RoomAvailabilityPage />} />
            <Route path="/staff/reception/billing"      element={<ReceptionBillingPage />} />
          </Route>

          {/* Legacy receptionist redirect */}
          <Route path="/receptionist" element={<Navigate to="/staff/reception" replace />} />

          {/* ══════════════════════════════════════════════
              HOUSEKEEPING LAYOUT — Dedicated task sidebar
              No public Navbar or Footer
          ══════════════════════════════════════════════ */}
          <Route element={
            <ProtectedRoute allowedRoles={['HOUSEKEEPING', 'ADMIN']}>
              <HousekeepingLayout />
            </ProtectedRoute>
          }>
            <Route path="/staff/housekeeping"              element={<MyTasksPage />} />
            <Route path="/staff/housekeeping/to-clean"     element={<RoomsToCleanPage />} />
            <Route path="/staff/housekeeping/in-progress"  element={<InProgressPage />} />
            <Route path="/staff/housekeeping/clean"        element={<CleanReadyPage />} />
            <Route path="/staff/housekeeping/maintenance"  element={<MaintenancePage />} />
            <Route path="/staff/housekeeping/history"      element={<HistoryPage />} />
          </Route>

          {/* Legacy housekeeping redirect */}
          <Route path="/housekeeping" element={<Navigate to="/staff/housekeeping" replace />} />

          {/* ══════════════════════════════════════════════
              ADMIN LAYOUT — Full management sidebar
              No public Navbar or Footer
          ══════════════════════════════════════════════ */}
          <Route element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route path="/admin"                  element={<AdminDashboardPage />} />
            <Route path="/admin/hotels"           element={<AdminHotelsPage />} />
            <Route path="/admin/pricing"          element={<PricingPage />} />
            <Route path="/admin/bookings"         element={<AdminBookingsPage />} />
            <Route path="/admin/guests"           element={<AdminGuestsPage />} />
            <Route path="/admin/housekeeping"     element={<AdminHousekeepingPage />} />
            <Route path="/admin/billing"          element={<AdminBillingPage />} />
            <Route path="/admin/reports"          element={<ReportsPage />} />
            <Route path="/admin/system-health"    element={<SystemHealthPage />} />
            <Route path="/admin/system-design"    element={<SystemDesignPage />} />
            <Route path="/admin/settings"         element={<SettingsPage />} />
          </Route>

          {/* Legacy system-design redirects (still redirect to admin) */}
          <Route path="/shards"           element={<Navigate to="/admin/system-design" replace />} />
          <Route path="/consistent-hashing" element={<Navigate to="/admin/system-design" replace />} />
          <Route path="/cache-ratelimit"  element={<Navigate to="/admin/system-design" replace />} />
          <Route path="/crawler"          element={<Navigate to="/admin/system-design" replace />} />
          <Route path="/autocomplete-demo" element={<Navigate to="/admin/system-design" replace />} />
          <Route path="/performance"      element={<Navigate to="/admin/system-design" replace />} />

          {/* ── Catch-all ──────────────────────────────── */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
