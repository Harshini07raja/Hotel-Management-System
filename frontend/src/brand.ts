/**
 * Aurevia Hotels & Resorts — Centralized Brand Configuration
 * Change brand identity here; it propagates throughout the entire application.
 */

export const BRAND = {
  name: 'Aurevia Hotels',
  fullName: 'Aurevia Hotels & Resorts',
  tagline: 'Your next escape starts here.',
  descriptor: 'Hotels & Resorts',
  monogram: 'A',

  /** Booking engine / support */
  contact: {
    email: 'hello@aurevia.com',
    supportEmail: 'support@aurevia.com',
    phone: '+1 (800) 287-3842',
    address: '12 Aurevia Boulevard, Chennai, Tamil Nadu 600001, India',
    hours: '24/7 — Always available for our guests',
  },

  social: {
    instagram: 'https://instagram.com/aurevia',
    twitter: 'https://twitter.com/aurevia',
    facebook: 'https://facebook.com/aurevia',
    linkedin: 'https://linkedin.com/company/aurevia',
  },

  /** Demo properties shown on the website */
  properties: [
    {
      id: 'demo-1',
      name: 'Aurevia Grand Chennai',
      city: 'Chennai',
      country: 'India',
      description: 'Our flagship property in the heart of Chennai, combining contemporary luxury with timeless elegance.',
    },
    {
      id: 'demo-2',
      name: 'Aurevia Marina Retreat',
      city: 'Mumbai',
      country: 'India',
      description: 'Perched along the Arabian Sea, the Marina Retreat offers unparalleled ocean views and signature spa experiences.',
    },
    {
      id: 'demo-3',
      name: 'Aurevia Garden Suites',
      city: 'Bangalore',
      country: 'India',
      description: 'A serene garden sanctuary in the Garden City, perfect for business and leisure travellers alike.',
    },
  ],

  /** Footer navigation links */
  footerLinks: {
    explore: [
      { label: 'Hotels & Resorts', href: '/hotels' },
      { label: 'Special Offers', href: '/offers' },
      { label: 'Meetings & Events', href: '/contact' },
      { label: 'Loyalty Programme', href: '/offers' },
    ],
    company: [
      { label: 'About Aurevia', href: '/about' },
      { label: 'Careers', href: '/about' },
      { label: 'Press & Media', href: '/about' },
      { label: 'Sustainability', href: '/about' },
    ],
    support: [
      { label: 'Help Centre', href: '/contact' },
      { label: 'Cancellation Policy', href: '/contact' },
      { label: 'Accessibility', href: '/contact' },
      { label: 'Privacy Policy', href: '/contact' },
    ],
  },

  /** CSS class tokens (Tailwind class names from tailwind.config.js) */
  colors: {
    primary: 'aurevia-forest',      // #142820
    accent: 'aurevia-gold',         // #E6D2A2
    background: 'aurevia-ivory',    // #F7F1E7
    surface: 'white',
    text: 'aurevia-charcoal',       // #1C1C1C
  },
} as const;

export type BrandType = typeof BRAND;
