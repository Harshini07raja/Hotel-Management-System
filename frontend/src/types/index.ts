export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'GUEST' | 'RECEPTIONIST' | 'HOUSEKEEPING' | 'ADMIN';
}

export interface Hotel {
  id: string;
  name: string;
  city: string;
  address: string;
  country: string;
  description: string;
  starRating: number;
  amenities: string[];
  images: string[];
  basePrice: number;
  popularityScore: number;
  rooms?: Room[];
}

export interface Room {
  id: string;
  hotelId: string;
  roomNumber: string;
  roomType: 'STANDARD' | 'DELUXE' | 'SUITE' | 'FAMILY';
  capacity: number;
  nightlyPrice: number;
  amenities: string[];
  status: 'AVAILABLE' | 'RESERVED' | 'OCCUPIED' | 'MAINTENANCE';
  housekeepingStatus: 'DIRTY' | 'CLEANING' | 'CLEAN' | 'INSPECTION';
  isAvailable?: boolean;
}

export interface Booking {
  id: string;
  idempotencyKey?: string;
  hotelId: string;
  hotelName: string;
  roomId: string;
  roomNumber: string;
  roomType: string;
  guestId: string;
  guestName: string;
  guestEmail: string;
  checkInDate: string;
  checkOutDate: string;
  guestCount: number;
  nightlyRateSnapshot: number;
  totalNights: number;
  totalPrice: number;
  status: 'PENDING' | 'CONFIRMED' | 'CHECKED_IN' | 'CHECKED_OUT' | 'CANCELLED';
  shortBookingCode?: string;
  shortBookingUrl?: string;
  createdAt: string;
}

export interface Invoice {
  id: string;
  bookingId: string;
  hotelId: string;
  guestId: string;
  guestName: string;
  roomCharges: number;
  taxAmount: number;
  serviceCharges: number;
  discount: number;
  totalAmount: number;
  paymentStatus: 'UNPAID' | 'PAID' | 'REFUNDED' | 'FAILED';
  paymentReference?: string;
  paymentMethod?: string;
  paidAt?: string;
  createdAt: string;
}

export interface HousekeepingTask {
  id: string;
  hotelId: string;
  hotelName?: string;
  roomId: string;
  roomNumber: string;
  status: 'DIRTY' | 'CLEANING' | 'CLEAN' | 'INSPECTION';
  assignedStaffName?: string;
  assignedStaffId?: string;
  notes?: string;
  scheduledAt: string;
  completedAt?: string;
}

export interface NotificationItem {
  id: string;
  guestId: string;
  type: string;
  title: string;
  message: string;
  bookingId?: string;
  read: boolean;
  createdAt: string;
}

export interface Suggestion {
  term: string;
  category: 'HOTEL' | 'CITY' | 'AMENITY';
  score: number;
  referenceId: string;
}
