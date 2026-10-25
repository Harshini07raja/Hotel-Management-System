import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/client';
import { Hotel, Room } from '../types';
import { RoomCard } from '../components/hotel/RoomCard';
import { GuestSelector } from '../components/hotel/GuestSelector';
import { ConfirmationDialog } from '../components/ui/ConfirmationDialog';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';
import { ErrorState } from '../components/ui/ErrorState';
import { BookingStatusBadge } from '../components/ui/BookingStatusBadge';
import {
  Star,
  MapPin,
  Calendar,
  Users,
  CheckCircle2,
  Sparkles,
  AlertCircle,
  Building2,
  ShieldCheck,
  Clock,
  Info,
  CreditCard,
  Receipt,
  BedDouble,
} from 'lucide-react';

export const HotelDetailPage: React.FC = () => {
  const { hotelId } = useParams<{ hotelId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Date defaults: today & today + 2 days
  const today = new Date().toISOString().split('T')[0];
  const defaultCheckOut = new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0];

  // Search/Booking State
  const [checkIn, setCheckIn] = useState(searchParams.get('checkIn') || today);
  const [checkOut, setCheckOut] = useState(searchParams.get('checkOut') || defaultCheckOut);
  const [guestCount, setGuestCount] = useState(parseInt(searchParams.get('guests') || '2', 10));

  // Data State
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [availableRoomIds, setAvailableRoomIds] = useState<string[] | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  // Status States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Hero image fallback
  const [heroImageError, setHeroImageError] = useState(false);

  // 1. Initial Load: Hotel details & Rooms
  useEffect(() => {
    if (!hotelId) return;

    setLoading(true);
    setError(false);

    Promise.all([
      api.get(`/api/v1/hotels/${hotelId}`),
      api.get(`/api/v1/hotels/${hotelId}/rooms`).catch(() => ({ data: [] })),
    ])
      .then(([hotelRes, roomsRes]) => {
        const hotelData: Hotel = hotelRes.data;
        setHotel(hotelData);

        const initialRooms: Room[] =
          roomsRes.data && roomsRes.data.length > 0
            ? roomsRes.data
            : hotelData.rooms || [];
        setRooms(initialRooms);

        // Check availability with initial dates
        checkAvailability(hotelId, checkIn, checkOut, guestCount);
      })
      .catch((err) => {
        console.error('Failed to load hotel:', err);
        setError(true);
      })
      .finally(() => setLoading(false));
  }, [hotelId]);

  // 2. Check Availability API
  const checkAvailability = (
    hId: string,
    inDate: string,
    outDate: string,
    guests: number
  ) => {
    setCheckingAvailability(true);
    setBookingError(null);

    api
      .get('/api/v1/availability', {
        params: {
          hotelId: hId,
          checkInDate: inDate,
          checkOutDate: outDate,
          guests,
        },
      })
      .then((res) => {
        // Can return array of room IDs or array of Room objects
        if (Array.isArray(res.data)) {
          if (res.data.length > 0 && typeof res.data[0] === 'string') {
            setAvailableRoomIds(res.data);
          } else if (res.data.length > 0 && typeof res.data[0] === 'object') {
            setAvailableRoomIds(res.data.map((r: any) => r.id));
          } else {
            setAvailableRoomIds([]);
          }
        } else {
          setAvailableRoomIds(null);
        }
      })
      .catch((err) => {
        console.warn('Availability check failed, falling back to room defaults:', err);
        setAvailableRoomIds(null);
      })
      .finally(() => setCheckingAvailability(false));
  };

  const handleUpdateAvailability = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (hotelId) {
      checkAvailability(hotelId, checkIn, checkOut, guestCount);
    }
  };

  // 3. Nights and Price Calculations
  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 1;
    const start = new Date(checkIn).getTime();
    const end = new Date(checkOut).getTime();
    const diff = Math.round((end - start) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 1;
  }, [checkIn, checkOut]);

  const priceBreakdown = useMemo(() => {
    if (!selectedRoom) return null;
    const roomRate = selectedRoom.nightlyPrice;
    const roomTotal = roomRate * nights;
    const taxes = Math.round(roomTotal * 0.12 * 100) / 100;
    const serviceFee = Math.round(roomTotal * 0.05 * 100) / 100;
    const total = Math.round((roomTotal + taxes + serviceFee) * 100) / 100;

    return {
      roomRate,
      roomTotal,
      taxes,
      serviceFee,
      total,
    };
  }, [selectedRoom, nights]);

  // 4. Room selection
  const handleSelectRoom = (room: Room) => {
    setSelectedRoom(room);
    setBookingError(null);
  };

  // 5. Booking execution with Idempotency Key
  const handleConfirmBooking = async () => {
    if (!hotel || !selectedRoom) return;

    setBookingLoading(true);
    setBookingError(null);

    const idempotencyKey = `IDEM-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    try {
      const res = await api.post(
        '/api/v1/bookings',
        {
          hotelId: hotel.id,
          roomId: selectedRoom.id,
          checkInDate: checkIn,
          checkOutDate: checkOut,
          guestCount,
        },
        {
          headers: {
            'Idempotency-Key': idempotencyKey,
          },
        }
      );

      setShowConfirmModal(false);
      const bookingId = res.data?.id || res.data?.bookingId;
      navigate(`/my-account/bookings/${bookingId}`);
    } catch (err: any) {
      console.error('Booking failed:', err);
      const msg =
        err.response?.data?.message ||
        'Double-booking conflict or inventory allocation error. Please choose another room or date.';
      setBookingError(msg);
      setShowConfirmModal(false);

      // Refresh availability
      if (hotelId) {
        checkAvailability(hotelId, checkIn, checkOut, guestCount);
      }
    } finally {
      setBookingLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="page-container py-12">
        <div className="page-section space-y-8">
          <div className="skeleton h-96 w-full rounded-3xl" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <div className="skeleton h-8 w-1/2 rounded-xl" />
              <div className="skeleton h-24 w-full rounded-2xl" />
              <div className="skeleton h-48 w-full rounded-2xl" />
            </div>
            <div className="skeleton h-96 w-full rounded-3xl" />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !hotel) {
    return (
      <div className="page-container py-16">
        <div className="page-section max-w-xl mx-auto">
          <ErrorState
            title="Hotel details unavailable"
            message="We were unable to load property information for this hotel. Please check your connection or retry."
            onRetry={() => window.location.reload()}
          />
        </div>
      </div>
    );
  }

  const heroImage =
    hotel.images && hotel.images.length > 0
      ? hotel.images[0]
      : 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1600';

  return (
    <div className="page-container pb-16">
      {/* 1. Hero Section */}
      <section className="relative h-80 sm:h-96 w-full overflow-hidden bg-aurevia-forest">
        {!heroImageError ? (
          <img
            src={heroImage}
            alt={hotel.name}
            onError={() => setHeroImageError(true)}
            className="w-full h-full object-cover opacity-80"
          />
        ) : (
          <div className="w-full h-full bg-forest-gradient opacity-90 flex items-center justify-center">
            <Building2 className="w-24 h-24 text-aurevia-gold/30" />
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-aurevia-forest via-aurevia-forest/40 to-transparent" />

        {/* Hero Content */}
        <div className="absolute bottom-0 inset-x-0 p-6 sm:p-10">
          <div className="page-section flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="text-white space-y-2 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="badge-gold">
                  <Star className="w-3.5 h-3.5 fill-aurevia-forest text-aurevia-forest" />
                  {hotel.starRating} Star Luxury
                </span>
                <span className="badge-slate bg-white/20 text-white border-white/30 backdrop-blur-sm">
                  <ShieldCheck className="w-3.5 h-3.5 text-aurevia-gold" />
                  Verified Property
                </span>
              </div>

              <h1 className="font-display text-display-lg font-bold tracking-tight text-white drop-shadow-md">
                {hotel.name}
              </h1>

              <p className="text-sm sm:text-base text-aurevia-ivory flex items-center gap-1.5 opacity-90">
                <MapPin className="w-4 h-4 text-aurevia-gold shrink-0" />
                {hotel.address}, {hotel.city}, {hotel.country}
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-white text-right shrink-0">
              <span className="text-xs text-aurevia-gold block font-medium">Starting from</span>
              <div className="flex items-baseline justify-end gap-1">
                <span className="font-display text-3xl font-bold">${hotel.basePrice}</span>
                <span className="text-xs text-white/70">/ night</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Container with Sticky Booking Sidebar */}
      <div className="page-section py-10 relative">
        <div className="flex flex-col lg:flex-row gap-10 items-start">
          {/* Main Content Area */}
          <div className="flex-1 min-w-0 space-y-10 w-full">
            {/* Booking Error Alert */}
            {bookingError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-2xl flex items-start gap-3 animate-fade-in shadow-sm">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="text-sm leading-relaxed">
                  <strong className="font-semibold block text-rose-900">Reservation Notice:</strong>
                  {bookingError}
                </div>
              </div>
            )}

            {/* Photo Gallery (Horizontal Scroll) */}
            {hotel.images && hotel.images.length > 1 && (
              <section className="space-y-3">
                <h2 className="font-display text-xl font-semibold text-aurevia-charcoal">
                  Property Gallery
                </h2>
                <div className="flex gap-4 overflow-x-auto pb-3 pt-1 scrollbar-thin scrollbar-thumb-aurevia-border">
                  {hotel.images.slice(0, 5).map((imgUrl, idx) => (
                    <div
                      key={idx}
                      className="h-48 w-72 shrink-0 rounded-2xl overflow-hidden shadow-aurevia-sm border border-aurevia-border group"
                    >
                      <img
                        src={imgUrl}
                        alt={`${hotel.name} visual ${idx + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          e.currentTarget.src =
                            'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600';
                        }}
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Hotel Info & Description */}
            <section className="card card-padding space-y-6">
              <div>
                <h2 className="font-display text-2xl font-semibold text-aurevia-charcoal mb-3">
                  About the Property
                </h2>
                <p className="text-sm text-aurevia-charcoal/80 leading-relaxed">
                  {hotel.description ||
                    'Immerse yourself in exceptional luxury and unmatched hospitality. Designed for discerning travellers seeking refined relaxation, signature wellness retreats, and authentic culinary experiences.'}
                </p>
              </div>

              {/* Amenity Pills */}
              <div>
                <h3 className="input-label mb-3">Signature Amenities & Inclusions</h3>
                <div className="flex flex-wrap gap-2">
                  {hotel.amenities && hotel.amenities.length > 0 ? (
                    hotel.amenities.map((amenity) => (
                      <span
                        key={amenity}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-aurevia-ivory border border-aurevia-border text-xs font-medium text-aurevia-charcoal"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-aurevia-forest" />
                        {amenity}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-aurevia-muted">
                      Full luxury amenities available upon check-in.
                    </span>
                  )}
                </div>
              </div>
            </section>

            {/* Rooms Section */}
            <section id="available-rooms-section" className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-aurevia-border gap-2">
                <div>
                  <h2 className="font-display text-2xl font-semibold text-aurevia-charcoal flex items-center gap-2">
                    <BedDouble className="w-6 h-6 text-aurevia-forest" />
                    Available Rooms & Suites
                  </h2>
                  <p className="text-xs text-aurevia-muted mt-0.5">
                    Showing inventory for {nights} night{nights > 1 ? 's' : ''} ({checkIn} to {checkOut})
                  </p>
                </div>

                {checkingAvailability && (
                  <span className="text-xs text-aurevia-forest font-semibold flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 animate-spin" />
                    Refreshing availability…
                  </span>
                )}
              </div>

              {rooms.length === 0 ? (
                <div className="card card-padding text-center py-12">
                  <p className="text-sm text-aurevia-muted">
                    No room suites currently configured for this hotel property.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {rooms.map((room) => {
                    const isAvailable =
                      availableRoomIds !== null
                        ? availableRoomIds.includes(room.id)
                        : room.isAvailable ?? true;

                    const isSelected = selectedRoom?.id === room.id;

                    return (
                      <div
                        key={room.id}
                        className={`transition-all rounded-2xl ${
                          isSelected ? 'ring-2 ring-aurevia-forest shadow-aurevia-md' : ''
                        }`}
                      >
                        <RoomCard
                          room={{
                            ...room,
                            isAvailable,
                          }}
                          onBook={() => handleSelectRoom(room)}
                        />
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Price Breakdown Component */}
              {selectedRoom && priceBreakdown && (
                <div className="card card-padding bg-aurevia-ivory border-aurevia-gold/40 shadow-aurevia space-y-4 animate-slide-up mt-8">
                  <div className="flex items-center justify-between pb-3 border-b border-aurevia-border">
                    <div className="flex items-center gap-2">
                      <Receipt className="w-5 h-5 text-aurevia-forest" />
                      <h3 className="font-display text-lg font-semibold text-aurevia-charcoal">
                        Selected Suite: {selectedRoom.roomType} (Room #{selectedRoom.roomNumber})
                      </h3>
                    </div>
                    <span className="badge-green">Room Reserved</span>
                  </div>

                  <div className="space-y-2 text-sm text-aurevia-charcoal/90">
                    <div className="flex justify-between items-center">
                      <span className="text-aurevia-muted">
                        ${priceBreakdown.roomRate} × {nights} night{nights > 1 ? 's' : ''}
                      </span>
                      <span className="font-mono font-medium">${priceBreakdown.roomTotal.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-aurevia-muted flex items-center gap-1">
                        Occupancy Taxes (12%)
                        <Info className="w-3.5 h-3.5 text-aurevia-muted" />
                      </span>
                      <span className="font-mono font-medium">${priceBreakdown.taxes.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-aurevia-muted flex items-center gap-1">
                        Resort & Service Fee (5%)
                        <Info className="w-3.5 h-3.5 text-aurevia-muted" />
                      </span>
                      <span className="font-mono font-medium">${priceBreakdown.serviceFee.toFixed(2)}</span>
                    </div>

                    <div className="pt-3 border-t border-aurevia-border flex justify-between items-center text-base font-bold text-aurevia-charcoal">
                      <span>Total Estimated Cost</span>
                      <span className="font-display text-2xl text-aurevia-forest font-bold">
                        ${priceBreakdown.total.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => setShowConfirmModal(true)}
                      className="btn-gold px-8 py-3 w-full sm:w-auto"
                    >
                      Confirm Booking for ${priceBreakdown.total.toFixed(2)}
                    </button>
                  </div>
                </div>
              )}
            </section>
          </div>

          {/* 2. Sticky Booking Sidebar (Desktop right side, lg:w-80) */}
          <aside className="w-full lg:w-80 shrink-0 lg:sticky lg:top-24 space-y-6">
            <div className="card card-padding space-y-6 shadow-aurevia-md border-aurevia-border bg-white">
              <div>
                <h3 className="font-display text-xl font-semibold text-aurevia-charcoal">
                  Reserve Your Stay
                </h3>
                <p className="text-xs text-aurevia-muted mt-1">
                  Guaranteed best rates directly through Aurevia.
                </p>
              </div>

              <form onSubmit={handleUpdateAvailability} className="space-y-4">
                {/* Check-in Date */}
                <div>
                  <label htmlFor="detail-check-in" className="input-label">Check-In</label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-aurevia-muted absolute left-3 top-3.5 pointer-events-none" />
                    <input
                      id="detail-check-in"
                      type="date"
                      required
                      min={today}
                      value={checkIn}
                      onChange={(e) => {
                        setCheckIn(e.target.value);
                        if (e.target.value >= checkOut) {
                          const nextDay = new Date(new Date(e.target.value).getTime() + 86400000)
                            .toISOString()
                            .split('T')[0];
                          setCheckOut(nextDay);
                        }
                      }}
                      className="input-field pl-9 text-xs"
                    />
                  </div>
                </div>

                {/* Check-out Date */}
                <div>
                  <label htmlFor="detail-check-out" className="input-label">Check-Out</label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-aurevia-muted absolute left-3 top-3.5 pointer-events-none" />
                    <input
                      id="detail-check-out"
                      type="date"
                      required
                      min={checkIn || today}
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      className="input-field pl-9 text-xs"
                    />
                  </div>
                </div>

                {/* Guest Selector */}
                <div>
                  <label className="input-label">Guests</label>
                  <GuestSelector
                    value={guestCount}
                    onChange={(val) => setGuestCount(val)}
                    min={1}
                    max={8}
                  />
                </div>

                {/* Check Availability Button */}
                <button
                  type="submit"
                  disabled={checkingAvailability}
                  className="btn-primary w-full py-2.5 text-xs shadow-aurevia"
                >
                  {checkingAvailability ? 'Checking Live Rooms…' : 'Check Availability'}
                </button>
              </form>

              {/* Price Summary when room selected */}
              {selectedRoom && priceBreakdown ? (
                <div className="pt-4 border-t border-aurevia-border space-y-3">
                  <div className="text-xs space-y-1.5">
                    <div className="flex justify-between text-aurevia-muted">
                      <span>Room:</span>
                      <span className="font-semibold text-aurevia-charcoal">
                        {selectedRoom.roomType}
                      </span>
                    </div>
                    <div className="flex justify-between text-aurevia-muted">
                      <span>Duration:</span>
                      <span className="font-semibold text-aurevia-charcoal">
                        {nights} Night{nights > 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="flex justify-between text-aurevia-muted">
                      <span>Taxes & Fees:</span>
                      <span className="font-semibold text-aurevia-charcoal">
                        ${(priceBreakdown.taxes + priceBreakdown.serviceFee).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-baseline pt-2 border-t border-aurevia-border font-bold">
                      <span className="text-aurevia-charcoal">Total Amount:</span>
                      <span className="font-display text-xl text-aurevia-forest">
                        ${priceBreakdown.total.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowConfirmModal(true)}
                    disabled={bookingLoading}
                    className="btn-gold w-full py-3 text-sm shadow-gold"
                  >
                    Confirm Booking
                  </button>
                </div>
              ) : (
                <div className="pt-4 border-t border-aurevia-border text-center">
                  <p className="text-xs text-aurevia-muted">
                    Select a room suite from the left to review your total breakdown and confirm booking.
                  </p>
                </div>
              )}

              {/* Trust Badges */}
              <div className="pt-3 border-t border-aurevia-border/60 space-y-2 text-[11px] text-aurevia-muted">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Instant reservation confirmation</span>
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard className="w-3.5 h-3.5 text-aurevia-forest shrink-0" />
                  <span>No upfront payment required for flexible rates</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-aurevia-gold-dark shrink-0" />
                  <span>Encrypted end-to-end checkout</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* 5. Booking Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showConfirmModal}
        variant="info"
        title="Confirm Your Reservation"
        message={
          selectedRoom && priceBreakdown
            ? `Would you like to complete your reservation at ${hotel.name} for ${selectedRoom.roomType} Room #${selectedRoom.roomNumber}? Total stay duration is ${nights} night${nights > 1 ? 's' : ''} for $${priceBreakdown.total.toFixed(2)}.`
            : 'Proceed with hotel reservation?'
        }
        confirmLabel="Confirm & Reserve Stay"
        cancelLabel="Review Details"
        loading={bookingLoading}
        onConfirm={handleConfirmBooking}
        onCancel={() => setShowConfirmModal(false)}
      />
    </div>
  );
};

export default HotelDetailPage;
