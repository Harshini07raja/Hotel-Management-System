import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';
import { Suggestion } from '../../types';
import GuestSelector from './GuestSelector';
import { MapPin, CalendarDays, Search, Building, Sparkles, Users } from 'lucide-react';

export interface SearchParams {
  city: string;
  checkIn: string;
  checkOut: string;
  guests: number;
}

export interface SearchFormProps {
  initialCity?: string;
  initialCheckIn?: string;
  initialCheckOut?: string;
  initialGuests?: number;
  compact?: boolean;
  className?: string;
}

export const SearchForm: React.FC<SearchFormProps> = ({
  initialCity = '',
  initialCheckIn,
  initialCheckOut,
  initialGuests = 2,
  compact = false,
  className = '',
}) => {
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const todayStr     = new Date().toISOString().split('T')[0];
  const tomorrowStr  = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const [city, setCity]       = useState(initialCity);
  const [checkIn, setCheckIn] = useState(initialCheckIn  || todayStr);
  const [checkOut, setCheckOut] = useState(initialCheckOut || tomorrowStr);
  const [guests, setGuests]   = useState(initialGuests);

  const [suggestions, setSuggestions]         = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  // Sync when parent props change
  useEffect(() => {
    if (initialCity)     setCity(initialCity);
    if (initialCheckIn)  setCheckIn(initialCheckIn);
    if (initialCheckOut) setCheckOut(initialCheckOut);
    if (initialGuests)   setGuests(initialGuests);
  }, [initialCity, initialCheckIn, initialCheckOut, initialGuests]);

  // Autocomplete debounce 150 ms
  useEffect(() => {
    const trimmed = city.trim();
    if (!trimmed) { setSuggestions([]); setShowSuggestions(false); return; }

    const timer = setTimeout(() => {
      setLoadingSuggestions(true);
      api.get(`/api/v1/search/autocomplete?q=${encodeURIComponent(trimmed)}&limit=6`)
        .then((res) => {
          const data: Suggestion[] = Array.isArray(res.data)
            ? res.data
            : res.data?.suggestions || [];
          setSuggestions(data);
          setShowSuggestions(data.length > 0);
        })
        .catch(() => setSuggestions([]))
        .finally(() => setLoadingSuggestions(false));
    }, 150);

    return () => clearTimeout(timer);
  }, [city]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSuggestionClick = (item: Suggestion) => {
    setCity(item.term);
    setShowSuggestions(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuggestions(false);
    const params = new URLSearchParams();
    if (city.trim())  params.set('city', city.trim());
    if (checkIn)      params.set('checkIn', checkIn);
    if (checkOut)     params.set('checkOut', checkOut);
    params.set('guests', guests.toString());
    navigate(`/hotels?${params.toString()}`);
  };

  const renderCategoryIcon = (category: Suggestion['category']) => {
    switch (category) {
      case 'HOTEL':   return <Building className="w-4 h-4 text-aurevia-forest shrink-0" />;
      case 'CITY':    return <MapPin   className="w-4 h-4 text-emerald-600 shrink-0" />;
      case 'AMENITY': return <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />;
      default:        return <MapPin   className="w-4 h-4 text-aurevia-muted shrink-0" />;
    }
  };

  const getCategoryBadgeClass = (category: Suggestion['category']) => {
    switch (category) {
      case 'HOTEL':   return 'badge-gold';
      case 'CITY':    return 'badge-green';
      case 'AMENITY': return 'badge-amber';
      default:        return 'badge-slate';
    }
  };

  const minCheckOut = checkIn
    ? new Date(new Date(checkIn).getTime() + 86400000).toISOString().split('T')[0]
    : tomorrowStr;

  // ── COMPACT VARIANT (search results bar) ─────────────────
  if (compact) {
    return (
      <form
        onSubmit={handleSubmit}
        className={`bg-white rounded-xl shadow-aurevia-md p-2.5 sm:p-3 border border-aurevia-border flex flex-col lg:flex-row items-stretch lg:items-center gap-3 ${className}`}
      >
        {/* Destination */}
        <div ref={dropdownRef} className="relative flex-1 min-w-0">
          <MapPin className="w-4 h-4 text-aurevia-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onFocus={() => city.trim().length > 0 && setShowSuggestions(suggestions.length > 0)}
            placeholder="Destination or hotel..."
            className="input-field pl-9 py-2 text-xs"
          />
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-aurevia-border rounded-xl shadow-aurevia-md py-1.5 max-h-60 overflow-y-auto z-50">
              {suggestions.map((item, idx) => (
                <button
                  key={`${item.term}-${idx}`}
                  type="button"
                  onClick={() => handleSuggestionClick(item)}
                  className="w-full text-left px-3 py-2 hover:bg-aurevia-ivory flex items-center justify-between text-xs transition-colors"
                >
                  <div className="flex items-center gap-2">
                    {renderCategoryIcon(item.category)}
                    <span className="font-medium text-aurevia-charcoal">{item.term}</span>
                  </div>
                  <span className={`badge ${getCategoryBadgeClass(item.category)} text-[10px]`}>
                    {item.category}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Check-in */}
        <div className="relative min-w-[130px]">
          <input
            type="date"
            value={checkIn}
            min={todayStr}
            onChange={(e) => {
              setCheckIn(e.target.value);
              if (e.target.value >= checkOut) {
                setCheckOut(new Date(new Date(e.target.value).getTime() + 86400000).toISOString().split('T')[0]);
              }
            }}
            className="input-field py-2 text-xs"
          />
        </div>

        {/* Check-out */}
        <div className="relative min-w-[130px]">
          <input
            type="date"
            value={checkOut}
            min={minCheckOut}
            onChange={(e) => setCheckOut(e.target.value)}
            className="input-field py-2 text-xs"
          />
        </div>

        {/* Guests */}
        <div className="flex items-center justify-center px-2 shrink-0">
          <GuestSelector value={guests} onChange={setGuests} min={1} max={8} />
        </div>

        {/* Search button */}
        <button
          type="submit"
          className="btn-gold py-2 px-5 text-xs font-semibold shrink-0 flex items-center justify-center gap-1.5"
        >
          <Search className="w-3.5 h-3.5" />
          <span>Search</span>
        </button>
      </form>
    );
  }

  // ── STANDARD / HERO VARIANT ───────────────────────────────
  //
  // Layout strategy:
  //   mobile  (< 640px)  — 1 column, all fields stack vertically
  //   tablet  (640-1023) — 2 columns: Destination full-width (col-span-2),
  //                        Check-in | Check-out side-by-side, Guests full-width
  //   desktop (≥ 1024px) — 4 equal columns, all in one row
  //
  // Icon alignment: icons sit inside the label row to the left of the
  // field text, never absolutely-positioned over a date picker (which
  // has a browser-native calendar button that can collide).  Date fields
  // get a left-aligned icon label instead, keeping the native picker
  // on the right untouched and unobstructed.

  return (
    <form
      onSubmit={handleSubmit}
      className={`rounded-2xl bg-white border border-aurevia-border shadow-aurevia-lg p-5 sm:p-6 ${className}`}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-4">

        {/* ── Field 1: Destination ── */}
        <div ref={dropdownRef} className="relative sm:col-span-2 lg:col-span-1 flex flex-col gap-1.5">
          {/* Label row with icon */}
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-aurevia-forest shrink-0" />
            <label htmlFor="sf-destination" className="text-xs font-semibold text-aurevia-charcoal tracking-wide uppercase">
              Destination
            </label>
          </div>
          {/* Input — icon is in the label, not overlaid on the input */}
          <input
            id="sf-destination"
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onFocus={() => city.trim().length > 0 && setShowSuggestions(suggestions.length > 0)}
            placeholder="City, region, or hotel name"
            className="input-field"
            autoComplete="off"
          />
          {/* Autocomplete dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-aurevia-border rounded-xl shadow-aurevia-md py-2 max-h-60 overflow-y-auto z-50">
              <div className="px-3 py-1 text-[10px] uppercase font-bold tracking-wider text-aurevia-muted border-b border-aurevia-border/60">
                Suggested Destinations
              </div>
              {suggestions.map((item, idx) => (
                <button
                  key={`${item.term}-${idx}`}
                  type="button"
                  onClick={() => handleSuggestionClick(item)}
                  className="w-full text-left px-3.5 py-2.5 hover:bg-aurevia-ivory flex items-center justify-between transition-colors border-b border-aurevia-border/30 last:border-b-0"
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    {renderCategoryIcon(item.category)}
                    <span className="text-sm font-medium text-aurevia-charcoal truncate">{item.term}</span>
                  </div>
                  <span className={`badge ${getCategoryBadgeClass(item.category)} text-[10px]`}>
                    {item.category}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Field 2: Check-in ── */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5">
            <CalendarDays className="w-3.5 h-3.5 text-aurevia-forest shrink-0" />
            <label htmlFor="sf-checkin" className="text-xs font-semibold text-aurevia-charcoal tracking-wide uppercase">
              Check-in
            </label>
          </div>
          <input
            id="sf-checkin"
            type="date"
            value={checkIn}
            min={todayStr}
            onChange={(e) => {
              setCheckIn(e.target.value);
              if (e.target.value >= checkOut) {
                setCheckOut(new Date(new Date(e.target.value).getTime() + 86400000).toISOString().split('T')[0]);
              }
            }}
            className="input-field"
          />
        </div>

        {/* ── Field 3: Check-out ── */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5">
            <CalendarDays className="w-3.5 h-3.5 text-aurevia-forest shrink-0" />
            <label htmlFor="sf-checkout" className="text-xs font-semibold text-aurevia-charcoal tracking-wide uppercase">
              Check-out
            </label>
          </div>
          <input
            id="sf-checkout"
            type="date"
            value={checkOut}
            min={minCheckOut}
            onChange={(e) => setCheckOut(e.target.value)}
            className="input-field"
          />
        </div>

        {/* ── Field 4: Guests ── */}
        {/*
          The GuestSelector renders two round buttons + a count display.
          Its natural height (~36px) is shorter than an input-field (~46px).
          We wrap it in a div that matches input-field's visual treatment
          (same border, radius, bg, padding) but uses flexbox centering
          instead of py-3, so the content always sits centered regardless
          of height differences.
        */}
        <div className="flex flex-col gap-1.5 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-aurevia-forest shrink-0" />
            <span className="text-xs font-semibold text-aurevia-charcoal tracking-wide uppercase select-none">
              Guests
            </span>
          </div>
          {/*
            Explicitly match input-field visual appearance without
            inheriting py-3 (which would push the selector taller than
            the date inputs and break row alignment).
          */}
          <div className="w-full rounded-xl border border-aurevia-border bg-white
                          text-aurevia-charcoal text-sm
                          focus-within:ring-2 focus-within:ring-aurevia-forest/30 focus-within:border-aurevia-forest
                          transition-all duration-200
                          flex items-center justify-center px-4 py-2.5 min-h-[46px]">
            <GuestSelector value={guests} onChange={setGuests} min={1} max={8} />
          </div>
        </div>

      </div>

      {/* ── Search button — always full-width below fields ── */}
      <div className="mt-5">
        <button
          type="submit"
          className="btn-gold w-full py-3.5 text-base font-semibold shadow-gold flex items-center justify-center gap-2"
        >
          <Search className="w-5 h-5" />
          <span>Search Hotels</span>
        </button>
      </div>
    </form>
  );
};

export default SearchForm;
