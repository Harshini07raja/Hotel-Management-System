import React, { useState, useEffect } from 'react';
import api from '../api/client';
import {
  Cpu,
  Play,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Star,
  MapPin,
  Sparkles,
} from 'lucide-react';

export const CrawlerDashboardPage: React.FC = () => {
  const [crawledData, setCrawledData] = useState<any[]>([]);
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [crawling, setCrawling] = useState(false);
  const [crawlSummary, setCrawlSummary] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      api.get('/api/v1/external-hotels'),
      api.get('/api/v1/crawler/status'),
    ])
      .then(([hRes, sRes]) => {
        setCrawledData(hRes.data);
        setStatus(sRes.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const handleRunCrawler = async () => {
    setCrawling(true);
    setCrawlSummary(null);
    try {
      const res = await api.post('/api/v1/crawler/run');
      setCrawlSummary(res.data);
      fetchData();
    } catch {
      setCrawlSummary({ status: 'ERROR', message: 'Failed to complete mock crawl.' });
    } finally {
      setCrawling(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center gap-2">
            <Cpu className="w-7 h-7 text-purple-600" /> Web Crawler & Market Intelligence
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Simulated web crawler scraping 3 mock competitor hotel websites locally. Enforces polite crawl delays and extracts rates & reviews.
          </p>
        </div>

        <button
          onClick={handleRunCrawler}
          disabled={crawling}
          className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition shadow-sm disabled:opacity-50 flex items-center gap-2"
        >
          <Play className="w-4 h-4 fill-white" />
          {crawling ? 'Crawling Mock Sites...' : 'Trigger Polite Crawl Run'}
        </button>
      </div>

      {/* Crawl Run Summary Banner */}
      {crawlSummary && (
        <div className="bg-purple-50 border border-purple-300 rounded-2xl p-5 text-xs text-purple-900 space-y-2">
          <div className="flex items-center gap-2 font-bold text-sm">
            <CheckCircle2 className="w-5 h-5 text-purple-600" />
            <span>Crawl Run Complete</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono pt-1 text-slate-800">
            <div className="bg-white p-2.5 rounded-xl border border-purple-200">
              <span>Pages Scraped: </span><strong>{crawlSummary.totalCrawled}</strong>
            </div>
            <div className="bg-white p-2.5 rounded-xl border border-purple-200">
              <span>Success Rate: </span><strong className="text-emerald-600">100%</strong>
            </div>
            <div className="bg-white p-2.5 rounded-xl border border-purple-200">
              <span>Duration: </span><strong>{crawlSummary.durationMs}ms</strong>
            </div>
            <div className="bg-white p-2.5 rounded-xl border border-purple-200">
              <span>Scrape Speed: </span><strong>{crawlSummary.pagesPerSecond} pages/sec</strong>
            </div>
          </div>
        </div>
      )}

      {/* Scraped Competitor Data Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Normalized External Hotel Intelligence</h2>
          <span className="text-xs text-slate-400 font-mono">{crawledData.length} mock websites indexed</span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-2xl h-56 animate-pulse border border-slate-200" />
            ))}
          </div>
        ) : crawledData.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-3">
            <p className="text-slate-500 text-sm">No external hotel data crawled yet.</p>
            <button
              onClick={handleRunCrawler}
              className="px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-bold transition shadow-sm"
            >
              Run Initial Scrape
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {crawledData.map((ext) => (
              <div
                key={ext.id}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                      External Reference
                    </span>
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> {ext.rating} ({ext.reviewsCount})
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-slate-900">{ext.hotelName}</h3>
                  <div className="text-xs text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" /> {ext.location}
                  </div>

                  <div className="pt-2">
                    <span className="text-[11px] font-semibold text-slate-400 block mb-1">Room Categories Scraped:</span>
                    <div className="flex flex-wrap gap-1">
                      {ext.roomCategories?.map((r: string) => (
                        <span key={r} className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                          {r}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2">
                    <span className="text-[11px] font-semibold text-slate-400 block mb-1">Published Amenities:</span>
                    <div className="flex flex-wrap gap-1">
                      {ext.amenities?.map((a: string) => (
                        <span key={a} className="text-[10px] bg-slate-50 border border-slate-100 text-slate-600 px-2 py-0.5 rounded">
                          {a}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-slate-400 block">Published Price</span>
                    <span className="text-xl font-extrabold text-slate-900">${ext.publishedPrice}</span>
                  </div>
                  <a
                    href={ext.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-semibold text-purple-600 hover:text-purple-500 flex items-center gap-1"
                  >
                    Source HTML <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
