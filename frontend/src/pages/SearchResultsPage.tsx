import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { Hotel } from '../types';
import { HotelCard } from '../components/hotel/HotelCard';
import { SearchForm } from '../components/hotel/SearchForm';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import {
  Filter,
  Star,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  RotateCcw,
} from 'lucide-react';

const COMMON_AMENITIES = [
  'WiFi',
  'Swimming Pool',
  'Spa & Wellness',
  'Fitness Center',
  'Fine Dining',
  'Cocktail Bar',
  'Valet Parking',
  'Airport Shuttle',
  'Room Service',
  'Ocean View',
];

const ROOM_TYPES = ['STANDARD', 'DELUXE', 'SUITE', 'FAMILY'];

export const SearchResultsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Search query params from URL
  const city = searchParams.get('city') || '';
  const query = searchParams.get('query') || '';
  const checkIn = searchParams.get('checkIn') || '';
  const checkOut = searchParams.get('checkOut') || '';
  const guests = parseInt(searchParams.get('guests') || '2', 10);
  const pageParam = parseInt(searchParams.get('page') || '0', 10);
  const sortByParam = searchParams.get('sortBy') || 'popularity';
  const minPriceParam = searchParams.get('minPrice') || '';
  const maxPriceParam = searchParams.get('maxPrice') || '';
  const roomTypeParam = searchParams.get('roomType') || '';
  const amenitiesParam = searchParams.get('amenities') || '';
  const starsParam = searchParams.get('stars') || '';

  // Local filter states for sidebar form
  const [minPrice, setMinPrice] = useState(minPriceParam);
  const [maxPrice, setMaxPrice] = useState(maxPriceParam);
  const [sortBy, setSortBy] = useState(sortByParam);
  const [selectedStars, setSelectedStars] = useState<number[]>(
    starsParam ? starsParam.split(',').map(Number).filter(Boolean) : []
  );
  const [selectedRoomTypes, setSelectedRoomTypes] = useState<string[]>(
    roomTypeParam ? roomTypeParam.split(',').filter(Boolean) : []
  );
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(
    amenitiesParam ? amenitiesParam.split(',').filter(Boolean) : []
  );

  // Results state
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(pageParam);

  // Sync state when URL params change
  useEffect(() => {
    setMinPrice(searchParams.get('minPrice') || '');
    setMaxPrice(searchParams.get('maxPrice') || '');
    setSortBy(searchParams.get('sortBy') || 'popularity');
    const s = searchParams.get('stars');
    setSelectedStars(s ? s.split(',').map(Number).filter(Boolean) : []);
    const r = searchParams.get('roomType');
    setSelectedRoomTypes(r ? r.split(',').filter(Boolean) : []);
    const a = searchParams.get('amenities');
    setSelectedAmenities(a ? a.split(',').filter(Boolean) : []);
    setCurrentPage(parseInt(searchParams.get('page') || '0', 10));

    fetchHotels();
  }, [searchParams]);

  const fetchHotels = () => {
    setLoading(true);
    setError(false);

    const params: Record<string, any> = {
      city: city || undefined,
      query: query || undefined,
      checkInDate: checkIn || undefined,
      checkOutDate: checkOut || undefined,
      guests: guests || undefined,
      minPrice: minPriceParam || undefined,
      maxPrice: maxPriceParam || undefined,
      amenities: amenitiesParam || undefined,
      roomType: roomTypeParam || undefined,
      sortBy: sortByParam || 'popularity',
      page: pageParam || 0,
      size: 12,
    };

    api
      .get('/api/v1/search/hotels', { params })
      .then((res) => {
        let list: Hotel[] = res.data.hotels || [];
        // Client-side star filter if provided
        if (starsParam) {
          const validStars = starsParam.split(',').map(Number);
          list = list.filter((h) => validStars.includes(h.starRating));
        }
        setHotels(list);
        setTotalElements(res.data.totalElements ?? list.length);
        setTotalPages(res.data.totalPages || Math.max(1, Math.ceil((res.data.totalElements || list.length) / 12)));
      })
      .catch((err) => {
        console.error('Failed to fetch hotels:', err);
        setError(true);
      })
      .finally(() => setLoading(false));
  };

  const handleApplyFilters = (e: React.FormEvent) => {
    e.preventDefault();
    const newParams = new URLSearchParams(searchParams);

    if (minPrice) newParams.set('minPrice', minPrice);
    else newParams.delete('minPrice');

    if (maxPrice) newParams.set('maxPrice', maxPrice);
    else newParams.delete('maxPrice');

    if (selectedStars.length > 0) newParams.set('stars', selectedStars.join(','));
    else newParams.delete('stars');

    if (selectedRoomTypes.length > 0) newParams.set('roomType', selectedRoomTypes.join(','));
    else newParams.delete('roomType');

    if (selectedAmenities.length > 0) newParams.set('amenities', selectedAmenities.join(','));
    else newParams.delete('amenities');

    newParams.set('sortBy', sortBy);
    newParams.set('page', '0');
    setSearchParams(newParams);
  };

  const handleClearFilters = () => {
    setMinPrice('');
    setMaxPrice('');
    setSelectedStars([]);
    setSelectedRoomTypes([]);
    setSelectedAmenities([]);
    setSortBy('popularity');

    const newParams = new URLSearchParams();
    if (city) newParams.set('city', city);
    if (query) newParams.set('query', query);
    if (checkIn) newParams.set('checkIn', checkIn);
    if (checkOut) newParams.set('checkOut', checkOut);
    if (guests) newParams.set('guests', String(guests));
    setSearchParams(newParams);
  };

  const handleSortChange = (newSort: string) => {
    setSortBy(newSort);
    const newParams = new URLSearchParams(searchParams);
    newParams.set('sortBy', newSort);
    newParams.set('page', '0');
    setSearchParams(newParams);
  };

  const handlePageChange = (newPage: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', String(newPage));
    setSearchParams(newParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleStar = (star: number) => {
    setSelectedStars((prev) =>
      prev.includes(star) ? prev.filter((s) => s !== star) : [...prev, star]
    );
  };

  const toggleRoomType = (rt: string) => {
    setSelectedRoomTypes((prev) =>
      prev.includes(rt) ? prev.filter((t) => t !== rt) : [...prev, rt]
    );
  };

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  };

  const destinationLabel = city || query || 'All Destinations';

  return (
    <div className="page-container">
      {/* Top Search Bar */}
      <section className="bg-white border-b border-aurevia-border py-4 shadow-sm sticky top-16 z-20">
        <div className="page-section">
          <SearchForm
            compact={true}
            initialCity={city || query}
            initialCheckIn={checkIn}
            initialCheckOut={checkOut}
            initialGuests={guests}
          />
        </div>
      </section>

      {/* Main Content Layout */}
      <main className="page-section py-8 flex flex-col lg:flex-row gap-8 items-start">
        {/* Left Sidebar Filters */}
        <aside className="w-full lg:w-72 shrink-0 hidden lg:block">
          <div className="card card-padding space-y-6 sticky top-36">
            <div className="flex items-center justify-between pb-4 border-b border-aurevia-border">
              <h2 className="font-display text-lg font-semibold text-aurevia-charcoal flex items-center gap-2">
                <Filter className="w-4 h-4 text-aurevia-forest" />
                Filters
              </h2>
              <button
                type="button"
                onClick={handleClearFilters}
                className="text-xs text-aurevia-muted hover:text-aurevia-forest flex items-center gap-1 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                Clear All
              </button>
            </div>

            <form onSubmit={handleApplyFilters} className="space-y-6 text-sm">
              {/* Star Rating */}
              <div>
                <label className="input-label mb-2 block">Star Rating</label>
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((star) => (
                    <label
                      key={star}
                      className="flex items-center gap-2.5 text-xs text-aurevia-charcoal cursor-pointer hover:text-aurevia-forest transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedStars.includes(star)}
                        onChange={() => toggleStar(star)}
                        className="rounded border-aurevia-border text-aurevia-forest focus:ring-aurevia-forest/30"
                      />
                      <span className="flex items-center gap-1">
                        {Array.from({ length: star }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        ))}
                      </span>
                      <span className="text-aurevia-muted text-[11px]">({star} Star{star > 1 ? 's' : ''})</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <label className="input-label mb-2 block">Price Range ($ / night)</label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <input
                      type="number"
                      placeholder="Min"
                      min="0"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="input-field py-2 text-xs"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      placeholder="Max"
                      min="0"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="input-field py-2 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Room Types */}
              <div>
                <label className="input-label mb-2 block">Room Type</label>
                <div className="space-y-2">
                  {ROOM_TYPES.map((type) => (
                    <label
                      key={type}
                      className="flex items-center gap-2.5 text-xs text-aurevia-charcoal cursor-pointer hover:text-aurevia-forest transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedRoomTypes.includes(type)}
                        onChange={() => toggleRoomType(type)}
                        className="rounded border-aurevia-border text-aurevia-forest focus:ring-aurevia-forest/30"
                      />
                      <span className="capitalize">{type.toLowerCase()}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Amenities */}
              <div>
                <label className="input-label mb-2 block">Amenities</label>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {COMMON_AMENITIES.map((amenity) => (
                    <label
                      key={amenity}
                      className="flex items-center gap-2.5 text-xs text-aurevia-charcoal cursor-pointer hover:text-aurevia-forest transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedAmenities.includes(amenity)}
                        onChange={() => toggleAmenity(amenity)}
                        className="rounded border-aurevia-border text-aurevia-forest focus:ring-aurevia-forest/30"
                      />
                      <span>{amenity}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 space-y-2">
                <button type="submit" className="btn-primary w-full py-2.5 text-xs">
                  Apply Filters
                </button>
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="btn-ghost w-full py-2 text-xs"
                >
                  Clear All
                </button>
              </div>
            </form>
          </div>
        </aside>

        {/* Right Main Column */}
        <section className="flex-1 w-full min-w-0">
          {/* Top Bar with count and Sort */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-aurevia-border gap-4">
            <div>
              <h1 className="font-display text-2xl font-semibold text-aurevia-charcoal">
                {destinationLabel}
              </h1>
              <p className="text-sm text-aurevia-muted mt-0.5">
                {loading
                  ? 'Searching for premier accommodations…'
                  : `${totalElements} hotel${totalElements === 1 ? '' : 's'} found in ${destinationLabel}`}
              </p>
            </div>

            {/* Sort Select */}
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <label htmlFor="sort-select" className="text-xs text-aurevia-muted font-medium whitespace-nowrap flex items-center gap-1">
                <ArrowUpDown className="w-3.5 h-3.5" />
                Sort by:
              </label>
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="input-field py-1.5 px-3 text-xs w-auto min-w-[170px]"
              >
                <option value="popularity">Relevance / Popularity</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating_desc">Highest Star Rating</option>
              </select>
            </div>
          </div>

          {/* Results State Rendering */}
          {loading ? (
            <LoadingSkeleton count={6} variant="hotel-card" />
          ) : error ? (
            <ErrorState
              title="Unable to load hotels"
              message="We encountered an issue searching across our distributed shards. Please try again."
              onRetry={fetchHotels}
            />
          ) : hotels.length === 0 ? (
            <EmptyState
              title="No hotels found"
              description="Try adjusting your search filters, expanding your price range, or choosing different dates."
              action={
                <button onClick={handleClearFilters} className="btn-primary text-xs">
                  Reset Search Filters
                </button>
              }
            />
          ) : (
            <div className="space-y-8">
              {/* Hotel Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {hotels.map((hotel) => (
                  <HotelCard
                    key={hotel.id}
                    hotel={hotel}
                    checkIn={checkIn}
                    checkOut={checkOut}
                    guests={guests}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 pt-6 border-t border-aurevia-border">
                  <button
                    onClick={() => handlePageChange(Math.max(0, currentPage - 1))}
                    disabled={currentPage === 0}
                    className="btn-ghost px-3 py-2 text-xs flex items-center gap-1 disabled:opacity-40"
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </button>

                  <div className="flex items-center gap-1.5">
                    {Array.from({ length: totalPages }).map((_, idx) => {
                      if (
                        idx === 0 ||
                        idx === totalPages - 1 ||
                        Math.abs(idx - currentPage) <= 1
                      ) {
                        const isActive = idx === currentPage;
                        return (
                          <button
                            key={idx}
                            onClick={() => handlePageChange(idx)}
                            className={`w-9 h-9 rounded-xl text-xs font-semibold transition-all ${
                              isActive
                                ? 'bg-aurevia-forest text-aurevia-gold shadow-sm'
                                : 'text-aurevia-charcoal hover:bg-aurevia-ivory-dark border border-aurevia-border'
                            }`}
                          >
                            {idx + 1}
                          </button>
                        );
                      }
                      if (
                        idx === currentPage - 2 ||
                        idx === currentPage + 2
                      ) {
                        return (
                          <span key={idx} className="px-1 text-aurevia-muted text-xs">
                            …
                          </span>
                        );
                      }
                      return null;
                    })}
                  </div>

                  <button
                    onClick={() => handlePageChange(Math.min(totalPages - 1, currentPage + 1))}
                    disabled={currentPage >= totalPages - 1}
                    className="btn-ghost px-3 py-2 text-xs flex items-center gap-1 disabled:opacity-40"
                    aria-label="Next page"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default SearchResultsPage;
