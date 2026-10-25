import React from 'react';
import { Settings, Info, AlertTriangle } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold text-slate-800 flex items-center gap-2">
          <Settings className="w-6 h-6 text-slate-600" />
          Settings
        </h2>
        <p className="text-sm text-slate-400 mt-0.5">System configuration and administration</p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-amber-800 text-sm">Backend Configuration Not Available</p>
          <p className="text-amber-700 text-sm mt-1">
            System-level settings (rate limiter thresholds, cache TTLs, shard topology) are currently
            managed directly through the Spring Boot application properties and environment variables.
            A settings management API has not been implemented in the backend.
          </p>
        </div>
      </div>

      <div className="card card-padding space-y-4">
        <h3 className="font-semibold text-slate-700 flex items-center gap-2">
          <Info className="w-4 h-4 text-blue-600" />
          Backend Capabilities — Missing Settings APIs
        </h3>
        <div className="text-sm text-slate-600 space-y-2">
          <p>The following settings would require new backend endpoints to implement:</p>
          <ul className="list-disc list-inside space-y-1 text-slate-500 mt-2">
            <li>Rate limiter configuration (requests/min per IP)</li>
            <li>Cache TTL configuration per entity type</li>
            <li>Shard rebalancing triggers</li>
            <li>Email/notification settings</li>
            <li>Booking cancellation policy windows</li>
            <li>Tax rate configuration per property</li>
          </ul>
        </div>
      </div>

      <div className="card card-padding">
        <h3 className="font-semibold text-slate-700 mb-3">Available Admin Actions</h3>
        <p className="text-sm text-slate-500 mb-4">These actions are available through the backend API:</p>
        <div className="flex gap-3 flex-wrap">
          <a href="/admin" className="btn-ghost text-sm">
            ← Back to Dashboard
          </a>
          <a href="/admin/system-design" className="btn-primary text-sm">
            System Design Tools
          </a>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
