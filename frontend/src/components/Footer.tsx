import React from 'react';
import { Link } from 'react-router-dom';
import { BRAND } from '../brand';
import { Instagram, Twitter, Facebook, Linkedin, Phone, Mail } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-aurevia-forest text-white">
      {/* Main section */}
      <div className="py-16 page-section">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Col 1 (brand) */}
          <div>
            <div className="w-10 h-10 rounded-lg bg-aurevia-gold text-aurevia-forest font-display text-2xl font-bold flex items-center justify-center shadow-sm select-none">
              A
            </div>
            <h3 className="font-display text-2xl text-white mt-3">
              Aurevia
            </h3>
            <span className="text-aurevia-gold/70 text-sm block">
              Hotels &amp; Resorts
            </span>
            <p className="text-white/50 text-sm mt-2 max-w-xs leading-relaxed">
              {BRAND.tagline}
            </p>

            {/* Social links */}
            <div className="flex gap-3 mt-6">
              <a
                href={BRAND.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-aurevia-gold hover:text-aurevia-forest flex items-center justify-center transition"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href={BRAND.social.twitter}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-aurevia-gold hover:text-aurevia-forest flex items-center justify-center transition"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href={BRAND.social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-aurevia-gold hover:text-aurevia-forest flex items-center justify-center transition"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href={BRAND.social.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-aurevia-gold hover:text-aurevia-forest flex items-center justify-center transition"
              >
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 2 (Explore) */}
          <div>
            <h4 className="text-aurevia-gold text-xs uppercase tracking-widest font-semibold mb-4">
              Explore
            </h4>
            <ul className="space-y-1">
              {BRAND.footerLinks.explore.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-white/60 hover:text-aurevia-gold text-sm transition py-1 block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3 (Company) */}
          <div>
            <h4 className="text-aurevia-gold text-xs uppercase tracking-widest font-semibold mb-4">
              Company
            </h4>
            <ul className="space-y-1">
              {BRAND.footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-white/60 hover:text-aurevia-gold text-sm transition py-1 block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4 (Support & Contact) */}
          <div>
            <h4 className="text-aurevia-gold text-xs uppercase tracking-widest font-semibold mb-4">
              Support
            </h4>
            <ul className="space-y-1">
              {BRAND.footerLinks.support.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-white/60 hover:text-aurevia-gold text-sm transition py-1 block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Contact section */}
            <div className="mt-6 pt-4 border-t border-white/10 space-y-2">
              <a
                href={`tel:${BRAND.contact.phone}`}
                className="flex items-center gap-2 text-xs text-white/50 hover:text-aurevia-gold transition py-1"
              >
                <Phone className="w-3.5 h-3.5 text-aurevia-gold/70" />
                <span>{BRAND.contact.phone}</span>
              </a>
              <a
                href={`mailto:${BRAND.contact.email}`}
                className="flex items-center gap-2 text-xs text-white/50 hover:text-aurevia-gold transition py-1"
              >
                <Mail className="w-3.5 h-3.5 text-aurevia-gold/70" />
                <span>{BRAND.contact.email}</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10 py-6 page-section flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-white/40 text-xs text-center sm:text-left">
          &copy; {new Date().getFullYear()} Aurevia Hotels &amp; Resorts. All rights reserved.
        </p>
        <div className="flex items-center gap-2 text-white/40 text-xs">
          <span className="hover:text-white/70 transition cursor-pointer">Terms of Use</span>
          <span>&middot;</span>
          <span className="hover:text-white/70 transition cursor-pointer">Privacy Policy</span>
          <span>&middot;</span>
          <span className="hover:text-white/70 transition cursor-pointer">Cookie Settings</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
