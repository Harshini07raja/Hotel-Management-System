import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

type Role = 'GUEST' | 'RECEPTIONIST' | 'HOUSEKEEPING' | 'ADMIN';

/** Returns the home portal path for a given role */
export function portalFor(role: Role): string {
  switch (role) {
    case 'ADMIN':        return '/admin';
    case 'RECEPTIONIST': return '/staff/reception';
    case 'HOUSEKEEPING': return '/staff/housekeeping';
    default:             return '/my-account';
  }
}

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
  requireAuth?: boolean;
}

/**
 * ProtectedRoute — blocks unauthorized access without flashing page content.
 *
 * Behavior:
 * 1. Unauthenticated → redirect to /login, preserving `from` for post-login redirect.
 * 2. Wrong role → redirect silently to the user's own portal (no 403 flash).
 * 3. Correct role → render children immediately.
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  requireAuth = true,
}) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  // Not logged in → go to login
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Wrong role → silently redirect to user's own portal
  if (allowedRoles && user && !allowedRoles.includes(user.role as Role)) {
    return <Navigate to={portalFor(user.role as Role)} replace />;
  }

  return <>{children}</>;
};
