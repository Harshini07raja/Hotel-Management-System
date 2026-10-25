import React, { useState, useMemo } from 'react';

interface Column<T> {
  key: keyof T | string;
  label: string;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  loading = false,
  emptyMessage = 'No records found',
  className = '',
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [search, setSearch] = useState('');

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const filteredData = useMemo(() => {
    if (!search.trim()) return data;
    const q = search.toLowerCase();
    return data.filter(row =>
      Object.values(row as Record<string, unknown>).some(v =>
        String(v ?? '').toLowerCase().includes(q)
      )
    );
  }, [data, search]);

  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;
    return [...filteredData].sort((a, b) => {
      const av = (a as Record<string, unknown>)[sortKey] ?? '';
      const bv = (b as Record<string, unknown>)[sortKey] ?? '';
      const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true });
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [filteredData, sortKey, sortDir]);

  return (
    <div className={`card overflow-hidden ${className}`}>
      {/* Search bar */}
      <div className="p-4 border-b border-aurevia-border">
        <input
          className="input-field max-w-xs text-sm py-2"
          placeholder="Search table…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-aurevia-ivory border-b border-aurevia-border">
            <tr>
              {columns.map(col => (
                <th
                  key={String(col.key)}
                  className={`px-4 py-3 text-left font-semibold text-aurevia-charcoal text-xs uppercase tracking-wide ${col.sortable ? 'cursor-pointer hover:text-aurevia-forest select-none' : ''} ${col.width || ''}`}
                  onClick={() => col.sortable && handleSort(String(col.key))}
                >
                  <span className="flex items-center gap-1">
                    {col.label}
                    {col.sortable && sortKey === String(col.key) && (
                      <span className="text-aurevia-forest">{sortDir === 'asc' ? ' ↑' : ' ↓'}</span>
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-aurevia-border">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {columns.map((col, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="skeleton h-4 rounded" style={{ width: `${50 + j * 10}%` }} />
                    </td>
                  ))}
                </tr>
              ))
            ) : sortedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-aurevia-muted text-sm">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              sortedData.map(row => (
                <tr key={keyExtractor(row)} className="hover:bg-aurevia-ivory/40 transition-colors">
                  {columns.map(col => (
                    <td key={String(col.key)} className="px-4 py-3 text-aurevia-charcoal">
                      {col.render
                        ? col.render(row)
                        : String((row as Record<string, unknown>)[String(col.key)] ?? '—')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {!loading && sortedData.length > 0 && (
        <div className="px-4 py-3 border-t border-aurevia-border text-xs text-aurevia-muted">
          Showing {sortedData.length} of {data.length} record{data.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}
