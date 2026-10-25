import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (name: string, email: string, pass: string, phone?: string, role?: string) => Promise<void>;
  logout: () => void;
  quickSwitchRole: (role: 'GUEST' | 'RECEPTIONIST' | 'HOUSEKEEPING' | 'ADMIN') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('hotel_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('hotel_jwt_token'));

  useEffect(() => {
    if (token && !user) {
      api.get('/api/v1/auth/me')
        .then((res) => {
          setUser(res.data);
          localStorage.setItem('hotel_user', JSON.stringify(res.data));
        })
        .catch(() => logout());
    }
  }, [token]);

  const login = async (email: string, pass: string) => {
    const res = await api.post('/api/v1/auth/login', { email, password: pass });
    const { token: jwt, guestId, name, role } = res.data;
    const userData: User = { id: guestId, name, email, role };
    setToken(jwt);
    setUser(userData);
    localStorage.setItem('hotel_jwt_token', jwt);
    localStorage.setItem('hotel_user', JSON.stringify(userData));
  };

  const register = async (name: string, email: string, pass: string, phone?: string, role: string = 'GUEST') => {
    const res = await api.post('/api/v1/auth/register', { name, email, password: pass, phone, role });
    const { token: jwt, guestId, role: registeredRole } = res.data;
    const userData: User = { id: guestId, name, email, role: registeredRole };
    setToken(jwt);
    setUser(userData);
    localStorage.setItem('hotel_jwt_token', jwt);
    localStorage.setItem('hotel_user', JSON.stringify(userData));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('hotel_jwt_token');
    localStorage.removeItem('hotel_user');
  };

  const quickSwitchRole = async (role: 'GUEST' | 'RECEPTIONIST' | 'HOUSEKEEPING' | 'ADMIN') => {
    const emailMap = {
      GUEST: 'guest@hotel.com',
      RECEPTIONIST: 'receptionist@hotel.com',
      HOUSEKEEPING: 'housekeeping@hotel.com',
      ADMIN: 'admin@hotel.com',
    };
    await login(emailMap[role], 'Password123!');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        login,
        register,
        logout,
        quickSwitchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
