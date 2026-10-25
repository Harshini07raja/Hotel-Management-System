import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

/**
 * PublicLayout — wraps all guest-facing public pages.
 * Shows the Aurevia brand Navbar and Footer.
 * Never shown to staff/admin portals.
 */
export const PublicLayout: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-aurevia-ivory">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
