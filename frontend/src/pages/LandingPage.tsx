import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { Hotel } from '../types';
import SearchForm from '../components/hotel/SearchForm';
import HotelCard from '../components/hotel/HotelCard';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';
import { BRAND } from '../brand';
import {
  Hotel as HotelIcon,
  Globe,
  Star,
  Headphones,
  MapPin,
  BedSingle,
  BedDouble,
  Crown,
  Users,
  UtensilsCrossed,
  Sparkles,
  Waves,
  Car,
  Wifi,
  ChevronDown,
} from 'lucide-react';

const DESTINATIONS = [
  { city: 'Chennai', gradient: 'from-emerald-800 to-aurevia-forest' },
  { city: 'Mumbai', gradient: 'from-teal-800 to-slate-900' },
  { city: 'Bangalore', gradient: 'from-emerald-900 to-teal-950' },
  { city: 'Delhi', gradient: 'from-stone-800 to-aurevia-forest' },
  { city: 'Hyderabad', gradient: 'from-cyan-900 to-emerald-950' },
  { city: 'Kolkata', gradient: 'from-teal-900 to-stone-900' },
];

const ROOM_CATEGORIES = [
  {
    name: 'Standard Room',
    type: 'STANDARD',
    price: '$89',
    icon: BedSingle,
    description: 'Refined comfort tailored for solo travelers and brief business stays.',
  },
  {
    name: 'Deluxe Room',
    type: 'DELUXE',
    price: '$149',
    icon: BedDouble,
    description: 'Expansive living spaces with panoramic city views and premium amenities.',
  },
  {
    name: 'Executive Suite',
    type: 'SUITE',
    price: '$299',
    icon: Crown,
    description: 'Ultimate luxury with dedicated lounge, lavish bath, and VIP concierge service.',
  },
  {
    name: 'Family Suite',
    type: 'FAMILY ROOM',
    price: '$199',
    icon: Users,
    description: 'Spacious multi-bed suites designed for comfortable and memorable family vacations.',
  },
];

const AMENITIES = [
  {
    title: 'Fine Dining',
    description: 'Culinary masterpieces crafted by award-winning chefs with seasonal ingredients.',
    icon: UtensilsCrossed,
  },
  {
    title: 'Spa & Wellness',
    description: 'Holistic therapies, hydrotherapy, and revitalization in tranquil sanctuaries.',
    icon: Sparkles,
  },
  {
    title: 'Rooftop Pool',
    description: 'Heated infinity pools offering breathtaking skyline views and artisan cocktails.',
    icon: Waves,
  },
  {
    title: '24/7 Concierge',
    description: 'Personalized arrangements for excursions, private transfers, and reservations.',
    icon: Headphones,
  },
  {
    title: 'Airport Transfer',
    description: 'Seamless chauffeur-driven luxury vehicle pick-up and drop-off service.',
    icon: Car,
  },
  {
    title: 'Complimentary WiFi',
    description: 'Ultra high-speed, enterprise-grade connectivity throughout the entire resort.',
    icon: Wifi,
  },
];

const REVIEWS = [
  {
    name: 'Priya Sharma',
    property: 'Aurevia Grand Chennai',
    rating: 5,
    text: 'An exceptional stay from start to finish. The attention to detail and the warm hospitality exceeded all expectations.',
    date: 'October 2026',
  },
  {
    name: 'Rahul Mehta',
    property: 'Aurevia Marina Retreat',
    rating: 5,
    text: 'The views were breathtaking and the spa experience was world-class. Will definitely be returning.',
    date: 'September 2026',
  },
  {
    name: 'Ananya Krishnan',
    property: 'Aurevia Garden Suites',
    rating: 5,
    text: 'Perfect balance of luxury and comfort. The garden suites are an oasis of calm in the heart of the city.',
    date: 'August 2026',
  },
];

export const LandingPage: React.FC = () => {
  const [featuredHotels, setFeaturedHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/api/v1/hotels')
      .then((res) => {
        if (Array.isArray(res.data)) {
          setFeaturedHotels(res.data.slice(0, 3));
        }
      })
      .catch(() => {
        setFeaturedHotels([]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-aurevia-ivory flex flex-col">
      {/* 1. HERO SECTION */}
      <section className="min-h-screen relative flex items-center justify-center overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1920&q=80"
          className="absolute inset-0 w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
          alt="Aurevia Luxury Resort"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-aurevia-forest/80 via-aurevia-forest/60 to-aurevia-forest/90" />

        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen pt-16 pb-24 px-4 text-center max-w-5xl mx-auto w-full">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-aurevia-gold/20 border border-aurevia-gold/40 text-aurevia-gold text-xs font-semibold tracking-widest uppercase mb-6">
            ✦ LUXURY HOTELS & RESORTS
          </div>

          <h1 className="font-display text-display-xl text-white font-semibold leading-tight mb-4">
            Your Next Escape<br />Starts Here
          </h1>

          <p className="text-white/70 text-lg max-w-xl mx-auto mb-10 font-sans">
            {BRAND.tagline}
          </p>

          {/* Search Card */}
          <div className="bg-white rounded-2xl shadow-2xl p-5 max-w-3xl w-full mx-auto text-left">
            <SearchForm />
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/70 animate-bounce pointer-events-none flex flex-col items-center">
          <ChevronDown className="w-6 h-6" />
        </div>
      </section>

      {/* 2. STATS BAR */}
      <section className="bg-white border-b border-aurevia-border py-8">
        <div className="page-section">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-xl bg-aurevia-ivory-dark text-aurevia-forest flex items-center justify-center mb-3">
                <HotelIcon className="w-6 h-6 text-aurevia-gold-dark" />
              </div>
              <div className="font-display text-3xl text-aurevia-forest font-semibold">50+</div>
              <div className="text-sm text-aurevia-muted font-medium">Luxury Properties</div>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-xl bg-aurevia-ivory-dark text-aurevia-forest flex items-center justify-center mb-3">
                <Globe className="w-6 h-6 text-aurevia-gold-dark" />
              </div>
              <div className="font-display text-3xl text-aurevia-forest font-semibold">30</div>
              <div className="text-sm text-aurevia-muted font-medium">Countries</div>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-xl bg-aurevia-ivory-dark text-aurevia-forest flex items-center justify-center mb-3">
                <Star className="w-6 h-6 text-aurevia-gold-dark fill-aurevia-gold-dark" />
              </div>
              <div className="font-display text-3xl text-aurevia-forest font-semibold">4.9★</div>
              <div className="text-sm text-aurevia-muted font-medium">Guest Rating</div>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-xl bg-aurevia-ivory-dark text-aurevia-forest flex items-center justify-center mb-3">
                <Headphones className="w-6 h-6 text-aurevia-gold-dark" />
              </div>
              <div className="font-display text-3xl text-aurevia-forest font-semibold">24/7</div>
              <div className="text-sm text-aurevia-muted font-medium">Concierge Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FEATURED HOTELS */}
      <section className="py-20 page-section w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-12 gap-4">
          <div>
            <span className="text-xs text-aurevia-gold-dark tracking-widest uppercase font-semibold block mb-1">
              OUR COLLECTION
            </span>
            <h2 className="font-display text-display-md text-aurevia-charcoal">
              Signature Properties
            </h2>
          </div>
          <Link to="/hotels" className="btn-ghost text-sm">
            View All Hotels →
          </Link>
        </div>

        {loading ? (
          <LoadingSkeleton count={3} variant="hotel-card" />
        ) : featuredHotels.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredHotels.map((h) => (
              <HotelCard key={h.id} hotel={h} />
            ))}
          </div>
        ) : (
          <div className="card card-padding text-center py-12 text-aurevia-muted text-sm">
            No featured properties currently available. Explore our full collection using the search bar above.
          </div>
        )}
      </section>

      {/* 4. DESTINATIONS SECTION */}
      <section className="bg-aurevia-ivory-dark py-20">
        <div className="page-section">
          <div className="text-center mb-12">
            <span className="text-xs text-aurevia-gold-dark tracking-widest uppercase font-semibold block mb-1">
              INSPIRED TRAVEL
            </span>
            <h2 className="font-display text-display-md text-aurevia-charcoal">
              Discover Our World
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {DESTINATIONS.map(({ city, gradient }) => (
              <div
                key={city}
                onClick={() => navigate(`/hotels?city=${encodeURIComponent(city)}`)}
                className="relative h-48 rounded-2xl overflow-hidden cursor-pointer group shadow-aurevia-sm"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${gradient} group-hover:scale-105 transition-transform duration-500`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-aurevia-gold shrink-0" />
                  <span className="font-display text-xl text-white font-medium">{city}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. ROOM CATEGORIES SECTION */}
      <section className="py-20 bg-white">
        <div className="page-section">
          <div className="text-center mb-12">
            <span className="text-xs text-aurevia-gold-dark tracking-widest uppercase font-semibold block mb-1">
              ACCOMMODATIONS
            </span>
            <h2 className="font-display text-display-md text-aurevia-charcoal">
              Rooms & Suites
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {ROOM_CATEGORIES.map((room) => {
              const IconComponent = room.icon;
              return (
                <div
                  key={room.type}
                  className="card card-padding text-center hover:shadow-aurevia-md transition flex flex-col items-center justify-between"
                >
                  <div className="flex flex-col items-center w-full">
                    <div className="w-14 h-14 rounded-2xl bg-aurevia-ivory-dark text-aurevia-forest flex items-center justify-center mb-4">
                      <IconComponent className="w-7 h-7 text-aurevia-forest" />
                    </div>
                    <h3 className="font-display text-lg font-semibold text-aurevia-charcoal mb-2">
                      {room.name}
                    </h3>
                    <p className="text-xs text-aurevia-muted mb-4 leading-relaxed line-clamp-3">
                      {room.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-aurevia-border w-full flex flex-col items-center gap-2">
                    <span className="text-sm font-semibold text-aurevia-forest">
                      From {room.price}/night
                    </span>
                    <Link to="/hotels" className="btn-link text-xs">
                      Explore Rooms →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. AMENITIES SECTION */}
      <section className="py-20 bg-aurevia-ivory">
        <div className="page-section">
          <div className="text-center mb-12">
            <span className="text-xs text-aurevia-gold-dark tracking-widest uppercase font-semibold block mb-1">
              EXCEPTIONAL HOSPITALITY
            </span>
            <h2 className="font-display text-display-md text-aurevia-charcoal">
              The Aurevia Experience
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {AMENITIES.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="flex gap-4 p-5 rounded-2xl bg-white/70 border border-aurevia-border/60 hover:bg-white hover:shadow-aurevia-sm transition"
                >
                  <div className="w-12 h-12 rounded-xl bg-aurevia-gold/20 text-aurevia-forest flex items-center justify-center shrink-0">
                    <Icon className="w-6 h-6 text-aurevia-forest" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-semibold text-aurevia-charcoal mb-1">
                      {item.title}
                    </h3>
                    <p className="text-xs text-aurevia-muted leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 7. REVIEWS SECTION */}
      <section className="py-20 bg-white">
        <div className="page-section">
          <div className="text-center mb-12">
            <span className="text-xs text-aurevia-gold-dark tracking-widest uppercase font-semibold block mb-1">
              GUEST EXPERIENCES
            </span>
            <h2 className="font-display text-display-md text-aurevia-charcoal">
              What Our Guests Say
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {REVIEWS.map((rev) => (
              <div
                key={rev.name}
                className="card card-padding flex flex-col justify-between hover:shadow-aurevia-md transition"
              >
                <div>
                  <div className="flex gap-1 mb-4 text-aurevia-gold-dark">
                    {Array.from({ length: rev.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <p className="italic text-sm text-aurevia-charcoal/90 mb-6 leading-relaxed">
                    "{rev.text}"
                  </p>
                </div>
                <div className="pt-4 border-t border-aurevia-border">
                  <div className="font-semibold text-sm text-aurevia-forest">{rev.name}</div>
                  <div className="text-xs text-aurevia-muted mt-0.5">
                    {rev.property} • {rev.date}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. PROMO BANNER */}
      <section className="bg-aurevia-forest py-16 text-center text-white">
        <div className="page-section max-w-3xl mx-auto">
          <h2 className="font-display text-display-md text-white mb-3">
            Book Direct & Save 15%
          </h2>
          <p className="text-aurevia-gold/70 text-base max-w-xl mx-auto">
            Enjoy exclusive benefits when you book directly through our website.
          </p>
          <div className="mt-8">
            <Link to="/register" className="btn-gold px-8 py-3">
              Register & Book Now
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
