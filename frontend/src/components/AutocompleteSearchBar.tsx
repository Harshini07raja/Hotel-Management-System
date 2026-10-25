import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { Suggestion } from '../types';
import { Search, MapPin, Building, Sparkles } from 'lucide-react';

interface AutocompleteSearchBarProps {
  onSearch?: (query: string) => void;
  initialValue?: string;
  placeholder?: string;
}

export const AutocompleteSearchBar: React.FC<AutocompleteSearchBarProps> = ({
  onSearch,
  initialValue = '',
  placeholder = 'Search by hotel name, city (Paris, New York, Zurich), or amenities...',
}) => {
  const [query, setQuery] = useState(initialValue);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (query.trim().length === 0) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(() => {
      setLoading(true);
      api.get(`/api/v1/search/autocomplete?q=${encodeURIComponent(query)}&limit=6`)
        .then((res) => {
          setSuggestions(res.data);
          setIsOpen(res.data.length > 0);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }, 150); // 150ms debounce

    return () => clearTimeout(timer);
  }, [query]);

  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (item: Suggestion) => {
    setQuery(item.term);
    setIsOpen(false);
    if (item.category === 'HOTEL' && item.referenceId.startsWith('HTL-')) {
      navigate(`/hotels/${item.referenceId}`);
    } else if (item.category === 'CITY') {
      navigate(`/search?city=${encodeURIComponent(item.term)}`);
    } else {
      if (onSearch) onSearch(item.term);
      else navigate(`/search?query=${encodeURIComponent(item.term)}`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsOpen(false);
    if (onSearch) onSearch(query);
    else navigate(`/search?query=${encodeURIComponent(query)}`);
  };

  return (
    <div ref={wrapperRef} className="relative w-full max-w-2xl">
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <div className="absolute left-4 text-slate-400">
          <Search className="w-5 h-5" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim().length > 0 && setIsOpen(suggestions.length > 0)}
          placeholder={placeholder}
          className="w-full pl-12 pr-28 py-3.5 bg-white rounded-xl shadow-lg border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-sm font-medium transition"
        />
        <button
          type="submit"
          className="absolute right-2 px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-sm font-semibold transition shadow-md"
        >
          Search
        </button>
      </form>

      {/* Autocomplete Dropdown List */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-50">
          <div className="p-2 border-b border-slate-100 flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            <span>Trie Autocomplete Suggestions</span>
            <span className="text-sky-600 lowercase font-mono">latency &lt; 1ms</span>
          </div>
          <div className="py-1 max-h-72 overflow-y-auto">
            {suggestions.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelect(item)}
                className="w-full text-left px-4 py-2.5 hover:bg-slate-50 flex items-center justify-between transition border-b border-slate-50 last:border-b-0"
              >
                <div className="flex items-center space-x-3">
                  {item.category === 'HOTEL' && <Building className="w-4 h-4 text-sky-500" />}
                  {item.category === 'CITY' && <MapPin className="w-4 h-4 text-emerald-500" />}
                  {item.category === 'AMENITY' && <Sparkles className="w-4 h-4 text-purple-500" />}
                  <span className="text-sm font-medium text-slate-800">{item.term}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                      item.category === 'HOTEL'
                        ? 'bg-sky-50 text-sky-600 border border-sky-200'
                        : item.category === 'CITY'
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                        : 'bg-purple-50 text-purple-600 border border-purple-200'
                    }`}
                  >
                    {item.category}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">score: {item.score}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
