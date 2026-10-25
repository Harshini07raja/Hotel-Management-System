import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Award, Lightbulb, Leaf, Users, ArrowRight } from 'lucide-react';

const VALUES = [
  { icon: Heart, title: 'Warm Hospitality', desc: 'Every guest deserves to feel genuinely welcomed. We craft experiences rooted in care and personal attention.' },
  { icon: Award, title: 'Uncompromising Excellence', desc: 'From our linens to our culinary offerings, we hold ourselves to the highest standards of quality.' },
  { icon: Lightbulb, title: 'Thoughtful Innovation', desc: 'We blend timeless hospitality traditions with modern comforts to create a seamlessly elevated stay.' },
  { icon: Leaf, title: 'Sustainable Luxury', desc: 'We are committed to operating sustainably, reducing our environmental footprint across all properties.' },
];

const MILESTONES = [
  { year: '2010', event: 'Aurevia Hotels founded with our flagship Chennai property.' },
  { year: '2013', event: 'Expanded to 5 cities across South India.' },
  { year: '2016', event: 'Launched the Aurevia Rewards loyalty programme.' },
  { year: '2019', event: 'Crossed 50,000 guest stays. Expanded internationally.' },
  { year: '2022', event: 'Launched our Spa & Wellness division across all premium properties.' },
  { year: '2026', event: 'Celebrating 50+ properties across 30 countries.' },
];

const TEAM = [
  { name: 'Arjun Nair', title: 'Chief Executive Officer', initials: 'AN' },
  { name: 'Priya Krishnamurthy', title: 'Chief Hospitality Officer', initials: 'PK' },
  { name: 'Rohan Mehta', title: 'Chief Technology Officer', initials: 'RM' },
  { name: 'Sunita Balasubramanian', title: 'VP Guest Experience', initials: 'SB' },
];

export const AboutPage: React.FC = () => (
  <div className="page-container">
    {/* Hero */}
    <section className="bg-aurevia-forest py-24 text-center px-4">
      <p className="text-aurevia-gold text-xs font-semibold tracking-widest uppercase mb-3">Est. 2010</p>
      <h1 className="font-display text-display-lg text-white mb-4">Our Story</h1>
      <p className="text-white/60 max-w-xl mx-auto text-base">
        Born from a passion for exceptional hospitality, Aurevia Hotels & Resorts has been crafting unforgettable journeys for over a decade.
      </p>
    </section>

    {/* Mission */}
    <section className="py-20 page-section">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div>
          <p className="text-xs text-aurevia-gold font-semibold tracking-widest uppercase mb-3">Our Mission</p>
          <h2 className="font-display text-display-md text-aurevia-charcoal mb-5">Crafting Unforgettable Moments</h2>
          <p className="text-aurevia-muted leading-relaxed mb-4">
            At Aurevia, we believe that a great stay is more than just a comfortable bed — it is a collection of moments: the warmth of a greeting, the fragrance of fresh flowers, the perfect view over morning coffee.
          </p>
          <p className="text-aurevia-muted leading-relaxed mb-6">
            Founded in Chennai in 2010, we have grown from a single boutique property into a globally recognized brand with over 50 luxury hotels across 30 countries, while staying true to our founding promise of personal, heartfelt hospitality.
          </p>
          <Link to="/hotels" className="btn-primary flex items-center gap-2 w-fit">
            Explore Our Properties <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="bg-aurevia-forest/10 border border-aurevia-border rounded-2xl h-80 flex items-center justify-center">
          <div className="text-center">
            <div className="w-20 h-20 bg-aurevia-gold rounded-2xl flex items-center justify-center font-display text-4xl font-bold text-aurevia-forest mx-auto mb-3">A</div>
            <p className="font-display text-2xl text-aurevia-charcoal">Aurevia Hotels</p>
            <p className="text-aurevia-muted text-sm">&amp; Resorts</p>
          </div>
        </div>
      </div>
    </section>

    {/* Values */}
    <section className="bg-aurevia-ivory py-20">
      <div className="page-section">
        <div className="text-center mb-12">
          <p className="text-xs text-aurevia-gold font-semibold tracking-widest uppercase mb-3">What Drives Us</p>
          <h2 className="font-display text-display-md text-aurevia-charcoal">Our Core Values</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {VALUES.map(v => {
            const Icon = v.icon;
            return (
              <div key={v.title} className="card card-padding text-center">
                <div className="w-12 h-12 bg-aurevia-gold/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-6 h-6 text-aurevia-forest" />
                </div>
                <h3 className="font-display text-lg text-aurevia-charcoal mb-2">{v.title}</h3>
                <p className="text-sm text-aurevia-muted leading-relaxed">{v.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>

    {/* Timeline */}
    <section className="py-20 page-section">
      <div className="text-center mb-12">
        <p className="text-xs text-aurevia-gold font-semibold tracking-widest uppercase mb-3">Our Journey</p>
        <h2 className="font-display text-display-md text-aurevia-charcoal">Key Milestones</h2>
      </div>
      <div className="max-w-2xl mx-auto relative">
        <div className="absolute left-16 top-0 bottom-0 w-px bg-aurevia-border" />
        <div className="space-y-6">
          {MILESTONES.map(m => (
            <div key={m.year} className="flex gap-6 items-start">
              <div className="w-16 shrink-0 text-right">
                <span className="font-mono text-sm font-bold text-aurevia-forest">{m.year}</span>
              </div>
              <div className="relative pl-6 flex-1">
                <div className="absolute left-0 top-1.5 w-3 h-3 rounded-full bg-aurevia-gold border-2 border-aurevia-forest -translate-x-1.5" />
                <p className="text-sm text-aurevia-charcoal leading-relaxed">{m.event}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Team */}
    <section className="bg-aurevia-ivory-dark py-20">
      <div className="page-section">
        <div className="text-center mb-12">
          <p className="text-xs text-aurevia-gold font-semibold tracking-widest uppercase mb-3">Leadership</p>
          <h2 className="font-display text-display-md text-aurevia-charcoal">Our Team</h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {TEAM.map(member => (
            <div key={member.name} className="card card-padding text-center">
              <div className="w-16 h-16 rounded-2xl bg-aurevia-gold text-aurevia-forest font-display text-xl font-bold flex items-center justify-center mx-auto mb-3">
                {member.initials}
              </div>
              <p className="font-semibold text-aurevia-charcoal">{member.name}</p>
              <p className="text-xs text-aurevia-muted mt-0.5">{member.title}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* CTA */}
    <section className="bg-aurevia-forest py-16 text-center px-4">
      <h2 className="font-display text-display-md text-white mb-3">Start Your Journey</h2>
      <p className="text-white/60 max-w-md mx-auto mb-8">
        Experience the Aurevia difference at one of our 50+ properties worldwide.
      </p>
      <Link to="/hotels" className="btn-gold px-8 py-3 text-base">
        Explore Hotels
      </Link>
    </section>
  </div>
);
