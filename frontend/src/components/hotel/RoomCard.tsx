import React from 'react';
import { Users, BedDouble } from 'lucide-react';
import { Room } from '../../types';
import { RoomStatusBadge } from '../ui/RoomStatusBadge';

export interface RoomCardProps {
  room: Room;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  onBook?: (roomId: string) => void;
}

const ROOM_TYPE_STYLES: Record<Room['roomType'], { label: string; badgeClass: string }> = {
  STANDARD: { label: 'Standard', badgeClass: 'badge-slate' },
  DELUXE: { label: 'Deluxe', badgeClass: 'badge-gold' },
  SUITE: { label: 'Suite', badgeClass: 'badge-green' },
  FAMILY: { label: 'Family', badgeClass: 'badge-blue' },
};

export const RoomCard: React.FC<RoomCardProps> = ({
  room,
  checkIn,
  checkOut,
  guests,
  onBook,
}) => {
  const isAvailable = room.status === 'AVAILABLE';
  const typeConfig = ROOM_TYPE_STYLES[room.roomType] || {
    label: room.roomType,
    badgeClass: 'badge-slate',
  };

  const handleBookClick = () => {
    if (isAvailable && onBook) {
      onBook(room.id);
    }
  };

  return (
    <div className="card card-padding flex flex-col justify-between h-full bg-white border border-aurevia-border transition-shadow hover:shadow-aurevia-md">
      <div>
        {/* Top: Room Type Badge & Room Number */}
        <div className="flex items-center justify-between mb-3">
          <span className={typeConfig.badgeClass}>
            <BedDouble className="w-3.5 h-3.5 mr-1 inline-block" />
            {typeConfig.label}
          </span>
          <span className="text-xs text-aurevia-muted font-mono font-medium">
            Room {room.roomNumber}
          </span>
        </div>

        {/* Middle: Capacity & Price */}
        <div className="flex items-center gap-2 text-xs text-aurevia-muted mb-2 font-medium">
          <Users className="w-4 h-4 text-aurevia-forest shrink-0" />
          <span>
            Up to {room.capacity} {room.capacity === 1 ? 'guest' : 'guests'}
          </span>
        </div>

        {/* Big Price */}
        <div className="mt-2 mb-4">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold font-mono text-aurevia-forest">
              ${room.nightlyPrice}
            </span>
            <span className="text-xs text-aurevia-muted font-normal">/night</span>
          </div>
        </div>

        {/* Amenity Pills (up to 4) */}
        {room.amenities && room.amenities.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-5">
            {room.amenities.slice(0, 4).map((amenity, idx) => (
              <span
                key={idx}
                className="text-[11px] px-2.5 py-1 rounded-md bg-aurevia-ivory text-aurevia-charcoal border border-aurevia-border/60 font-medium"
              >
                {amenity}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Bottom: Status Badge & Book Now Button */}
      <div className="pt-4 border-t border-aurevia-border flex items-center justify-between gap-3 mt-auto">
        <RoomStatusBadge status={room.status} />

        <button
          type="button"
          onClick={handleBookClick}
          disabled={!isAvailable}
          className="btn-primary text-xs px-4 py-2 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Book Now
        </button>
      </div>
    </div>
  );
};

export default RoomCard;
