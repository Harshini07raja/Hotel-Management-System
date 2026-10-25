import React, { useState } from 'react';
import { BRAND } from '../brand';
import { MapPin, Phone, Mail, Clock, ChevronDown, ChevronUp, Send, CheckCircle2 } from 'lucide-react';

const OFFICES = [
  { city: 'Chennai', role: 'Global Headquarters', address: '12 Marina Boulevard, Chennai 600001', phone: '+91 44 9988 7766' },
  { city: 'Mumbai', role: 'Regional Office — West', address: '44 Bandra Kurla Complex, Mumbai 400051', phone: '+91 22 6677 5544' },
  { city: 'Bangalore', role: 'Sales & Partnerships', address: '8 UB City, Vittal Mallya Road, Bengaluru 560001', phone: '+91 80 7766 4433' },
];

const FAQS = [
  {
    q: 'How do I modify or cancel my booking?',
    a: 'Log in to your account, navigate to "My Bookings", and click on the booking you wish to modify. Changes can be made up to 48 hours before check-in. Cancellations made at least 14 days in advance are fully refunded.',
  },
  {
    q: 'What is the standard check-in and check-out time?',
    a: 'Standard check-in is from 3:00 PM and check-out is by 11:00 AM. Gold and Platinum Rewards members enjoy early check-in from 12:00 PM and late check-out until 2:00 PM, subject to availability.',
  },
  {
    q: 'Is breakfast included in the room rate?',
    a: 'Breakfast inclusion depends on the room package selected. Look for "Breakfast Included" or "Full Board" tags when booking. Aurevia Rewards members from Gold tier and above receive complimentary breakfast.',
  },
  {
    q: 'How does the Aurevia Rewards loyalty programme work?',
    a: 'Every verified stay earns you points. After 5 stays you reach Silver, 20 stays earns Gold, and 50 stays unlocks Platinum. Benefits increase at each tier, including discounts, room upgrades, and a personal concierge.',
  },
  {
    q: 'Can I book a room for a group or event?',
    a: 'Yes. For groups of 10+ rooms or event spaces, please contact our dedicated Groups & Events team at groups@aureviahotels.com or call our main line. We offer tailored packages and a dedicated event coordinator.',
  },
];

export const ContactPage: React.FC = () => {
  const [formState, setFormState] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    // UI-only — no backend endpoint
    setTimeout(() => {
      setSubmitted(true);
      setSubmitting(false);
    }, 1200);
  };

  return (
    <div className="page-container">
      {/* Hero */}
      <section className="bg-aurevia-forest py-16 text-center px-4">
        <p className="text-aurevia-gold text-xs font-semibold tracking-widest uppercase mb-3">We're Here For You</p>
        <h1 className="font-display text-display-lg text-white mb-3">Get in Touch</h1>
        <p className="text-white/60 max-w-lg mx-auto text-sm">
          Whether you have a question about your booking, our services, or anything else — our team is available 24/7 to help.
        </p>
      </section>

      {/* Contact info + form */}
      <section className="py-16 page-section">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* Contact info */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <p className="text-xs text-aurevia-gold font-semibold tracking-widest uppercase mb-4">Contact Details</p>
              <div className="space-y-4">
                {[
                  { icon: MapPin, label: 'Address', value: BRAND.contact?.address || '12 Marina Boulevard, Chennai 600001, India' },
                  { icon: Phone, label: 'Phone', value: BRAND.contact?.phone || '+91 44 9988 7766' },
                  { icon: Mail, label: 'Email', value: BRAND.contact?.email || 'hello@aureviahotels.com' },
                  { icon: Clock, label: 'Hours', value: BRAND.contact?.hours || '24/7 — Always available for our guests' },
                ].map(item => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="flex gap-4">
                      <div className="w-10 h-10 rounded-xl bg-aurevia-gold/20 flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5 text-aurevia-forest" />
                      </div>
                      <div>
                        <p className="text-xs text-aurevia-muted font-semibold uppercase tracking-wide">{item.label}</p>
                        <p className="text-sm text-aurevia-charcoal mt-0.5">{item.value}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Contact form */}
          <div className="lg:col-span-3">
            <div className="card card-padding">
              {submitted ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                  </div>
                  <h3 className="font-display text-2xl text-aurevia-charcoal mb-2">Message Sent!</h3>
                  <p className="text-aurevia-muted text-sm">
                    Thank you for reaching out. Our team will respond within 2 business hours.
                  </p>
                  <button
                    onClick={() => { setSubmitted(false); setFormState({ name: '', email: '', subject: '', message: '' }); }}
                    className="btn-ghost mt-6 text-sm"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="font-display text-xl text-aurevia-charcoal mb-5">Send Us a Message</h2>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="input-label" htmlFor="contact-name">Full Name</label>
                        <input id="contact-name" className="input-field" placeholder="Your name" required
                          value={formState.name} onChange={e => setFormState(s => ({ ...s, name: e.target.value }))} />
                      </div>
                      <div>
                        <label className="input-label" htmlFor="contact-email">Email Address</label>
                        <input id="contact-email" className="input-field" type="email" placeholder="you@example.com" required
                          value={formState.email} onChange={e => setFormState(s => ({ ...s, email: e.target.value }))} />
                      </div>
                    </div>
                    <div>
                      <label className="input-label" htmlFor="contact-subject">Subject</label>
                      <input id="contact-subject" className="input-field" placeholder="How can we help you?" required
                        value={formState.subject} onChange={e => setFormState(s => ({ ...s, subject: e.target.value }))} />
                    </div>
                    <div>
                      <label className="input-label" htmlFor="contact-message">Message</label>
                      <textarea
                        id="contact-message"
                        className="input-field resize-none"
                        rows={5}
                        placeholder="Tell us more about your inquiry…"
                        required
                        value={formState.message}
                        onChange={e => setFormState(s => ({ ...s, message: e.target.value }))}
                      />
                    </div>
                    <button type="submit" disabled={submitting} className="btn-primary w-full flex items-center justify-center gap-2">
                      {submitting ? (
                        <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending…</>
                      ) : (
                        <><Send className="w-4 h-4" /> Send Message</>
                      )}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Office locations */}
      <section className="bg-aurevia-ivory py-16">
        <div className="page-section">
          <p className="text-xs text-aurevia-gold font-semibold tracking-widest uppercase mb-3 text-center">Our Offices</p>
          <h2 className="font-display text-display-md text-aurevia-charcoal mb-10 text-center">Find Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {OFFICES.map(office => (
              <div key={office.city} className="card card-padding">
                <div className="w-10 h-10 bg-aurevia-forest rounded-xl flex items-center justify-center mb-3">
                  <MapPin className="w-5 h-5 text-aurevia-gold" />
                </div>
                <h3 className="font-display text-xl text-aurevia-charcoal">{office.city}</h3>
                <p className="text-xs text-aurevia-gold font-semibold mb-2">{office.role}</p>
                <p className="text-sm text-aurevia-muted">{office.address}</p>
                <p className="text-sm text-aurevia-muted mt-1 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5" /> {office.phone}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 page-section">
        <p className="text-xs text-aurevia-gold font-semibold tracking-widest uppercase mb-3 text-center">Help Centre</p>
        <h2 className="font-display text-display-md text-aurevia-charcoal mb-10 text-center">Frequently Asked Questions</h2>
        <div className="max-w-2xl mx-auto space-y-3">
          {FAQS.map((faq, i) => {
            const isOpen = openFaq === i;
            return (
              <div key={i} className="card overflow-hidden">
                <button
                  onClick={() => setOpenFaq(isOpen ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left"
                >
                  <span className="font-semibold text-aurevia-charcoal text-sm pr-4">{faq.q}</span>
                  {isOpen
                    ? <ChevronUp className="w-4 h-4 text-aurevia-forest shrink-0" />
                    : <ChevronDown className="w-4 h-4 text-aurevia-muted shrink-0" />}
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-sm text-aurevia-muted leading-relaxed border-t border-aurevia-border pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
