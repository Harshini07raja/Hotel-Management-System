import React from 'react';
import { Link } from 'react-router-dom';
import { Tag, AlertTriangle } from 'lucide-react';

export const PricingPage: React.FC = () => (
  <div className="p-6 space-y-6">
    <div>
      <h2 className="font-display text-2xl font-semibold text-slate-800 flex items-center gap-2">
        <Tag className="w-6 h-6 text-aurevia-forest" />
        Pricing &amp; Offers
      </h2>
      <p className="text-sm text-slate-400 mt-0.5">Manage room pricing and promotional offers</p>
    </div>

    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
      <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
      <div>
        <p className="font-semibold text-amber-800 text-sm">Pricing Management API Not Available</p>
        <p className="text-amber-700 text-sm mt-1">
          Dynamic pricing updates and offer management require backend APIs that are not yet implemented.
          Room base prices are currently set at data seeding time and stored per room record.
          Promotional offers shown on the public site are statically defined.
        </p>
      </div>
    </div>

    <div className="card card-padding">
      <h3 className="font-semibold text-slate-700 mb-3">Current Pricing</h3>
      <p className="text-sm text-slate-500 mb-4">
        Room pricing is currently managed at the room level in the database. To view current room prices,
        navigate to Hotels &amp; Rooms.
      </p>
      <Link to="/admin/hotels" className="btn-primary text-sm">View Hotels &amp; Rooms →</Link>
    </div>
  </div>
);

export default PricingPage;
