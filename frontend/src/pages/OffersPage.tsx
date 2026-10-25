import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Star, Gift, Clock, ArrowRight } from 'lucide-react';

const offers = [
  {
    id: 'early-bird',
    title: 'Early Bird Discount',
    subtitle: 'Save 20% on advance bookings',
    color: 'bg-aurevia-forest',
    description: 'Plan ahead and enjoy significant savings. Book any room at least 30 days in advance and receive 20% off the standard rate.',
    highlights: [
      '20% discount on room rate',
      'Applies to all room categories',
      'Cancellable up to 14 days before check-in',
      'Valid for bookings till December 2026',
    ],
    validity: 'Valid through December 2026',
    badge: 'Most Popular',
  },
  {
    id: 'weekend-getaway',
    title: 'Weekend Getaway',
    subtitle: 'Perfect weekend escapes',
    color: 'bg-teal-800',
    description: 'Escape the weekday routine with our Weekend Getaway package. Stay Friday–Sunday and receive complimentary breakfast for two.',
    highlights: [
      'Complimentary breakfast for 2 guests',
      'Minimum 2-night stay required',
      'Late check-out until 2 PM',
      'Valid any weekend year-round',
    ],
    validity: 'Year-round availability',
    badge: 'New',
  },
  {
    id: 'honeymoon-package',
    title: 'Honeymoon Bliss',
    subtitle: 'Celebrate love in luxury',
    color: 'bg-rose-900',
    description: 'Celebrate your love with our signature Honeymoon Package, available in any of our suites. An experience crafted for the most special moments.',
    highlights: [
      'Rose petal turndown service',
      'Welcome champagne & chocolates',
      'Complimentary spa credit ($150)',
      'Suite room upgrade (subject to availability)',
    ],
    validity: 'Book anytime, no expiry',
    badge: 'Exclusive',
  },
  {
    id: 'long-stay',
    title: 'Extended Stay',
    subtitle: 'Stay longer, save more',
    color: 'bg-amber-900',
    description: 'For extended visits, our Long Stay offer delivers exceptional value. Enjoy 25% off for stays of 7 nights or more with exclusive inclusions.',
    highlights: [
      '25% discount on room rate',
      'Complimentary airport transfer',
      'Daily laundry service included',
      'Access to business lounge',
    ],
    validity: 'Minimum 7-night stay',
    badge: 'Best Value',
  },
];

const loyaltyTiers = [
  { name: 'Silver', color: 'from-slate-400 to-slate-500', icon: '✦', nights: 5, perks: ['5% discount', 'Early check-in', 'Welcome amenity'] },
  { name: 'Gold', color: 'from-aurevia-gold-dark to-aurevia-gold', icon: '✦✦', nights: 20, perks: ['10% discount', 'Room upgrade', 'Breakfast included', 'Late check-out'] },
  { name: 'Platinum', color: 'from-aurevia-forest-light to-aurevia-forest', icon: '✦✦✦', nights: 50, perks: ['15% discount', 'Suite upgrade', 'Personal concierge', 'Airport lounge', 'Spa credit'] },
];

export const OffersPage: React.FC = () => (
  <div className="page-container">
    {/* Hero */}
    <section className="bg-aurevia-forest py-20 text-center px-4">
      <p className="text-aurevia-gold text-xs font-semibold tracking-widest uppercase mb-3">Exclusive Deals</p>
      <h1 className="font-display text-display-lg text-white mb-4">Special Offers & Packages</h1>
      <p className="text-white/60 max-w-xl mx-auto text-base">
        Discover our curated selection of exclusive offers designed to make your Aurevia experience even more memorable.
      </p>
    </section>

    {/* Offers Grid */}
    <section className="page-section py-16">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {offers.map(offer => (
          <div key={offer.id} className="card-hover overflow-hidden rounded-2xl">
            {/* Colored header */}
            <div className={`${offer.color} p-6 relative`}>
              <span className="absolute top-4 right-4 text-xs font-semibold px-2.5 py-1 rounded-full bg-aurevia-gold text-aurevia-forest">
                {offer.badge}
              </span>
              <h2 className="font-display text-2xl text-white mb-1">{offer.title}</h2>
              <p className="text-white/70 text-sm">{offer.subtitle}</p>
            </div>
            {/* Content */}
            <div className="p-6">
              <p className="text-aurevia-muted text-sm leading-relaxed mb-5">{offer.description}</p>
              <ul className="space-y-2 mb-6">
                {offer.highlights.map((h, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-aurevia-charcoal">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    {h}
                  </li>
                ))}
              </ul>
              <div className="flex items-center justify-between pt-4 border-t border-aurevia-border">
                <div className="flex items-center gap-1.5 text-xs text-aurevia-muted">
                  <Clock className="w-3.5 h-3.5" /> {offer.validity}
                </div>
                <Link to="/hotels" className="btn-primary text-sm px-5 py-2.5">
                  Book This Offer
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>

    {/* Loyalty Programme */}
    <section className="bg-aurevia-ivory-dark py-20">
      <div className="page-section">
        <div className="text-center mb-12">
          <p className="text-aurevia-gold text-xs font-semibold tracking-widest uppercase mb-3">Rewards Programme</p>
          <h2 className="font-display text-display-md text-aurevia-charcoal mb-4">Aurevia Rewards</h2>
          <p className="text-aurevia-muted max-w-lg mx-auto text-sm">
            Earn points on every stay and unlock exclusive benefits as you advance through our three loyalty tiers.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {loyaltyTiers.map(tier => (
            <div key={tier.name} className="card card-padding text-center relative overflow-hidden">
              <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${tier.color}`} />
              <div className="text-2xl text-aurevia-gold mb-3 mt-2">{tier.icon}</div>
              <h3 className="font-display text-2xl text-aurevia-charcoal mb-1">{tier.name}</h3>
              <p className="text-xs text-aurevia-muted mb-5">{tier.nights}+ nights per year</p>
              <ul className="space-y-2 text-left">
                {tier.perks.map((p, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-aurevia-charcoal">
                    <Star className="w-3.5 h-3.5 text-aurevia-gold fill-aurevia-gold shrink-0" /> {p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="text-center mt-10">
          <Link to="/register" className="btn-primary px-8 py-3">
            Join Aurevia Rewards
          </Link>
        </div>
      </div>
    </section>
  </div>
);
