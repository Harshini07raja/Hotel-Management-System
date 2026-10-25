import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { Suggestion } from '../types';
import { Search, Building, MapPin, Sparkles, Clock, Layers, Zap } from 'lucide-react';

export const AutocompleteDemoPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = () => {
    api.get('/api/v1/search/autocomplete?q=&limit=1')
      .then(() => {
        // Stats can be inferred or checked
      })
      .catch(() => {});
  };

  const handleQueryChange = async (val: string) => {
    setQuery(val);
    const start = performance.now();
    try {
      const res = await api.get(`/api/v1/search/autocomplete?q=${encodeURIComponent(val)}&limit=10`);
      const elapsed = performance.now() - start;
      setSuggestions(res.data);
      setLatencyMs(Math.round(elapsed * 100) / 100);
    } catch {
      setSuggestions([]);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center gap-2">
          <Search className="w-7 h-7 text-blue-600" /> Trie Prefix Autocomplete Laboratory
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          In-memory Prefix Tree (Trie) evaluating case-insensitive character transitions and popularity rankings with sub-millisecond latency.
        </p>
      </div>

      {/* Interactive Live Workbench */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Type Any Prefix (Hotel Name, City, or Amenity):
          </label>
          <div className="relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              placeholder="e.g. 'gr', 'par', 'spa', 'sol', 'new', 'wifi'..."
              className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-300 rounded-2xl text-base font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
            />
          </div>
        </div>

        {/* Real-time Telemetry Pill */}
        <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-200 gap-2">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-600" />
            <span>Observed Latency: <strong className="font-mono text-slate-900">{latencyMs !== null ? `${latencyMs} ms` : 'Idle'}</strong></span>
          </div>
          <div className="flex items-center gap-2 font-mono">
            <Zap className="w-4 h-4 text-amber-500" />
            <span>Returned: <strong>{suggestions.length} suggestions</strong></span>
          </div>
          <div className="flex items-center gap-1 font-mono text-[11px] text-blue-600">
            <span>Cache: Redis Prefix ac:*</span>
          </div>
        </div>

        {/* Suggestions List */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Trie Ranked Results</h3>

          {suggestions.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-2xl">
              {query ? 'No matching prefixes found in the Trie.' : 'Start typing to query the Trie index.'}
            </div>
          ) : (
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
              {suggestions.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 hover:bg-slate-50 flex items-center justify-between transition"
                >
                  <div className="flex items-center gap-3">
                    {item.category === 'HOTEL' && <Building className="w-4 h-4 text-sky-500" />}
                    {item.category === 'CITY' && <MapPin className="w-4 h-4 text-emerald-500" />}
                    {item.category === 'AMENITY' && <Sparkles className="w-4 h-4 text-purple-500" />}
                    <span className="font-semibold text-sm text-slate-900">{item.term}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        item.category === 'HOTEL'
                          ? 'bg-sky-100 text-sky-700'
                          : item.category === 'CITY'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-purple-100 text-purple-700'
                      }`}
                    >
                      {item.category}
                    </span>
                    <span className="font-mono text-xs text-slate-400">Score: {item.score}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Algorithmic Design Explanation */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4 text-xs leading-relaxed text-slate-600">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Algorithmic Justification: Trie (Prefix Tree)</h3>
        <p>
          Unlike SQL/NoSQL regular expression or <code>LIKE '%query%'</code> table scans which run in $O(N)$ linear time and degrade under large catalogs,
          a Prefix Trie operates in $O(L)$ time, where $L$ is the length of the search string (independent of the total database size!).
        </p>
        <p>
          Each Trie node caches pre-sorted candidate suggestions ranked by hotel star rating and popularity weight, providing instant top-K recommendations within <strong>&lt; 1 millisecond</strong>.
        </p>
      </div>
    </div>
  );
};
