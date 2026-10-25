import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, MapPin } from 'lucide-react';
import { Hotel } from '../../types';

export interface HotelCardProps {
  hotel: Hotel;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
}

export const HotelCard: React.FC<HotelCardProps> = ({
  hotel,
  checkIn,
  checkOut,
  guests,
}) => {
  const [imgError, setImgError] = useState(false);

  // Construct target link with query parameters
  const params = new URLSearchParams();
  if (checkIn) params.set('checkIn', checkIn);
  if (checkOut) params.set('checkOut', checkOut);
  if (guests) params.set('guests', guests.toString());
  const queryString = params.toString();
  const hotelUrl = `/hotels/${hotel.id}${queryString ? `?${queryString}` : ''}`;

  const primaryImage = hotel.images && hotel.images.length > 0 ? hotel.images[0] : null;

  return (
    <div className="group card-hover overflow-hidden rounded-2xl flex flex-col h-full bg-white border border-aurevia-border transition-all duration-300">
      {/* Image Section */}
      <div className="relative h-52 w-full overflow-hidden bg-aurevia-forest">
        {!imgError && primaryImage ? (
          <img
            src={primaryImage}
            alt={hotel.name}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-aurevia-forest via-aurevia-forest-light to-aurevia-forest flex flex-col items-center justify-center text-center p-4">
            <span className="font-display text-2xl font-bold text-aurevia-gold tracking-wide">
              {hotel.name}
            </span>
            <span className="text-[11px] text-aurevia-gold/75 uppercase tracking-widest mt-1">
              Aurevia Hotels &amp; Resorts
            </span>
          </div>
        )}

        {/* Star Rating Badge (Top-Right) */}
        {hotel.starRating > 0 && (
          <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1 text-xs font-semibold text-aurevia-charcoal z-10">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{hotel.starRating}</span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="card-padding flex flex-col flex-1 justify-between gap-4">
        <div>
          {/* Location Line */}
          <div className="flex items-center gap-1 text-xs text-aurevia-muted mb-1.5 font-medium">
            <MapPin className="w-3.5 h-3.5 text-aurevia-forest shrink-0" />
            <span className="truncate">
              {hotel.city}, {hotel.country}
            </span>
          </div>

          {/* Hotel Name */}
          <h3 className="font-display text-xl font-semibold text-aurevia-charcoal group-hover:text-aurevia-forest transition-colors line-clamp-1">
            {hotel.name}
          </h3>

          {/* Description */}
          {hotel.description && (
            <p className="text-sm text-aurevia-muted line-clamp-2 mt-1.5 leading-relaxed">
              {hotel.description}
            </p>
          )}

          {/* Amenity Chips */}
          {hotel.amenities && hotel.amenities.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {hotel.amenities.slice(0, 3).map((amenity, idx) => (
                <span
                  key={idx}
                  className="badge badge-slate text-[11px] font-normal"
                >
                  {amenity}
                </span>
              ))}
              {hotel.amenities.length > 3 && (
                <span className="badge badge-slate text-[11px] font-normal text-aurevia-muted">
                  +{hotel.amenities.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>

        {/* Bottom Row */}
        <div className="pt-3 border-t border-aurevia-border flex items-center justify-between gap-2 mt-auto">
          <div>
            <span className="text-xs text-aurevia-muted block">From</span>
            <div className="flex items-baseline gap-0.5">
              <span className="text-xl font-bold text-aurevia-forest font-mono">
                ${hotel.basePrice}
              </span>
              <span className="text-xs text-aurevia-muted font-normal">/night</span>
            </div>
          </div>

          <Link
            to={hotelUrl}
            className="btn-gold text-sm px-4 py-2 shrink-0 inline-flex items-center justify-center font-semibold"
          >
            View Hotel
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HotelCard;
