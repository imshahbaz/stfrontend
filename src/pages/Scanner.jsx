import { useEffect, useState, useMemo } from 'react';
import { fetchStrategyWithMargin } from '../api/service';
import { useStrategies } from '../context/StrategyContext';


function SortIcon({ dir }) {
  if (!dir) {
    return (
      <svg className="h-3 w-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 15l5 5 5-5M7 9l5-5 5 5" />
      </svg>
    );
  }
  if (dir === 'asc') {
    return (
      <svg className="h-3 w-3 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
      </svg>
    );
  }
  return (
    <svg className="h-3 w-3 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function formatNumber(val) {
  if (val === null || val === undefined || isNaN(Number(val))) return '—';
  return Number(val).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

export default function Scanner() {
  // Shared Strategies Context
  const {
    strategies,
    loading: loadingStrategies,
    error: strategiesError,
    refreshStrategies,
  } = useStrategies();

  // Selection & Search States
  const [selectedStrategy, setSelectedStrategy] = useState('');
  const [loadingResults, setLoadingResults] = useState(false);
  const [resultsError, setResultsError] = useState(null);
  const [results, setResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [lastSearchedStrategy, setLastSearchedStrategy] = useState('');

  // Table Filtering, Sorting & Pagination
  const [filterQuery, setFilterQuery] = useState('');
  const [sortColumn, setSortColumn] = useState('symbol');
  const [sortDirection, setSortDirection] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Auto-select first strategy if none selected
  useEffect(() => {
    if (strategies.length > 0 && !selectedStrategy) {
      setSelectedStrategy(strategies[0].name);
    }
  }, [strategies, selectedStrategy]);


  // Selected Strategy Object
  const currentStrategyObj = useMemo(() => {
    return strategies.find((s) => s.name === selectedStrategy);
  }, [strategies, selectedStrategy]);

  // Execute Search API Call
  const handleSearch = async () => {
    if (!selectedStrategy) return;
    setLoadingResults(true);
    setResultsError(null);
    setHasSearched(true);
    setLastSearchedStrategy(selectedStrategy);
    setCurrentPage(1);

    try {
      const res = await fetchStrategyWithMargin(selectedStrategy);
      setResults(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error('Scanner search failed:', err);
      setResultsError(err.message || 'Failed to execute scanner search.');
      setResults([]);
    } finally {
      setLoadingResults(false);
    }
  };

  // Sort Toggle Handler
  const handleSort = (col) => {
    if (sortColumn === col) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(col);
      setSortDirection('asc');
    }
  };

  // Filter & Sort Results
  const filteredAndSortedResults = useMemo(() => {
    let list = [...results];

    // Filter
    if (filterQuery.trim()) {
      const q = filterQuery.trim().toLowerCase();
      list = list.filter(
        (item) =>
          (item.symbol && item.symbol.toLowerCase().includes(q)) ||
          (item.name && item.name.toLowerCase().includes(q))
      );
    }

    // Sort
    list.sort((a, b) => {
      let valA = a[sortColumn];
      let valB = b[sortColumn];

      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return list;
  }, [results, filterQuery, sortColumn, sortDirection]);

  // Reset page when filter changes
  const handleFilterChange = (e) => {
    setFilterQuery(e.target.value);
    setCurrentPage(1);
  };

  // Reset page when page size changes
  const handlePageSizeChange = (e) => {
    setPageSize(Number(e.target.value));
    setCurrentPage(1);
  };

  // Pagination Math
  const totalItems = filteredAndSortedResults.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);

  const paginatedResults = useMemo(() => {
    return filteredAndSortedResults.slice(startIndex, endIndex);
  }, [filteredAndSortedResults, startIndex, endIndex]);

  // Export CSV Helper
  const handleExportCSV = () => {
    if (filteredAndSortedResults.length === 0) return;
    const headers = ['Symbol', 'Name', 'Close', 'Margin', 'Rupeezy Margin'];
    const rows = filteredAndSortedResults.map((r) => [
      `"${r.symbol || ''}"`,
      `"${r.name || ''}"`,
      r.close ?? '',
      r.margin ?? '',
      r.rupeezyMargin ?? '',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `scanner_${lastSearchedStrategy || 'results'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white">Chartink Strategy Scanner</h1>
            <span className="rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-semibold text-blue-400 border border-blue-500/20">
              Live Margin Scan
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-400">
            Select an active strategy from Strategy Management to scan real-time stock signals & margin metrics.
          </p>
        </div>

        <button
          type="button"
          onClick={refreshStrategies}
          disabled={loadingStrategies}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-800/80 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-700 hover:text-white disabled:opacity-50"
        >
          <svg
            className={`h-4 w-4 ${loadingStrategies ? 'animate-spin text-blue-400' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Reload Strategies
        </button>
      </div>

      {/* Strategy Control Panel */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl backdrop-blur-md">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Strategy Selection</h2>
        
        <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <select
              value={selectedStrategy}
              onChange={(e) => setSelectedStrategy(e.target.value)}
              disabled={loadingStrategies || strategies.length === 0}
              className="w-full appearance-none rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 pr-10 text-sm font-medium text-white shadow-inner transition focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
            >
              {loadingStrategies ? (
                <option value="">Loading strategies...</option>
              ) : strategies.length === 0 ? (
                <option value="">No strategies available</option>
              ) : (
                <>
                  <option value="" disabled>-- Select a Strategy --</option>
                  {strategies.map((strat) => (
                    <option key={strat.name} value={strat.name}>
                      {strat.name} {strat.timeFrame ? `(${strat.timeFrame})` : ''} {strat.active === false ? '[Inactive]' : ''}
                    </option>
                  ))}
                </>
              )}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSearch}
            disabled={!selectedStrategy || loadingResults || loadingStrategies}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
          >
            {loadingResults ? (
              <>
                <svg className="h-4 w-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Scanning...</span>
              </>
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span>Search Scanner</span>
              </>
            )}
          </button>
        </div>

        {/* Error when fetching strategies */}
        {strategiesError && (
          <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">
            {strategiesError}
          </div>
        )}

        {/* Selected Strategy Details Bar */}
        {currentStrategyObj && (
          <div className="mt-4 flex flex-wrap items-center gap-3 rounded-lg bg-slate-950/60 p-3 text-xs text-slate-300 border border-slate-800">
            <span className="font-semibold text-slate-400">Details:</span>
            {currentStrategyObj.timeFrame && (
              <span className="rounded bg-slate-800 px-2 py-0.5 font-mono text-blue-400">
                TF: {currentStrategyObj.timeFrame}
              </span>
            )}
            {currentStrategyObj.successRate != null && (
              <span className="rounded bg-emerald-500/10 px-2 py-0.5 font-mono text-emerald-400 border border-emerald-500/20">
                Win Rate: {currentStrategyObj.successRate}%
              </span>
            )}
            {currentStrategyObj.active != null && (
              <span className={`rounded px-2 py-0.5 font-semibold ${currentStrategyObj.active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                {currentStrategyObj.active ? 'Active' : 'Inactive'}
              </span>
            )}
            {currentStrategyObj.scanClause && (
              <div className="w-full mt-1 pt-2 border-t border-slate-800/80 font-mono text-[11px] text-slate-400 truncate">
                <span className="text-slate-500 uppercase font-semibold mr-2">Clause:</span>
                {currentStrategyObj.scanClause}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Results Section */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/80 shadow-xl backdrop-blur-md overflow-hidden">
        {/* Table Top Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 border-b border-slate-800">
          <div>
            <h2 className="text-base font-semibold text-white">Scan Results</h2>
            <p className="text-xs text-slate-400">
              {hasSearched ? (
                <>
                  Results for strategy <span className="font-semibold text-blue-400">"{lastSearchedStrategy}"</span> ({totalItems} items)
                </>
              ) : (
                'Select a strategy and search to populate results'
              )}
            </p>
          </div>

          {hasSearched && results.length > 0 && (
            <div className="flex items-center gap-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Filter by symbol or name..."
                  value={filterQuery}
                  onChange={handleFilterChange}
                  className="w-full sm:w-64 rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 pl-9 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                />
                <svg
                  className="absolute left-3 top-2 h-3.5 w-3.5 text-slate-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              <button
                type="button"
                onClick={handleExportCSV}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-slate-700 hover:text-white"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                CSV Export
              </button>
            </div>
          )}
        </div>

        {/* Results Body */}
        {loadingResults ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="relative flex items-center justify-center">
              <div className="h-12 w-12 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin" />
            </div>
            <p className="mt-4 text-sm font-medium text-slate-300">Fetching scanner results for "{selectedStrategy}"...</p>
            <p className="mt-1 text-xs text-slate-500">Querying Chartink and margin calculation API</p>
          </div>
        ) : resultsError ? (
          <div className="p-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="mt-3 text-sm font-semibold text-white">Scanner Request Failed</h3>
            <p className="mt-1 text-xs text-slate-400">{resultsError}</p>
            <button
              type="button"
              onClick={handleSearch}
              className="mt-4 rounded-lg bg-slate-800 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-700"
            >
              Try Again
            </button>
          </div>
        ) : !hasSearched ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600/10 text-blue-400 border border-blue-500/20">
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="mt-4 text-base font-medium text-white">No Scan Executed Yet</h3>
            <p className="mt-1 text-xs text-slate-400 max-w-sm">
              Select a strategy from the dropdown above and click <span className="text-blue-400 font-semibold">Search Scanner</span> to run the Chartink scanner.
            </p>
          </div>
        ) : filteredAndSortedResults.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-800 text-slate-400">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 className="mt-3 text-sm font-semibold text-white">No Results Found</h3>
            <p className="mt-1 text-xs text-slate-400">
              {filterQuery
                ? `No stock items match your filter criteria "${filterQuery}".`
                : `Strategy "${lastSearchedStrategy}" returned 0 matching stock items.`}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="border-b border-slate-800 bg-slate-950/70 text-xs font-semibold text-slate-400">
                  <tr>
                    <th className="px-4 py-3.5 w-12 text-center">#</th>
                    <th
                      className="cursor-pointer px-4 py-3.5 hover:text-white transition"
                      onClick={() => handleSort('symbol')}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Symbol</span>
                        <SortIcon dir={sortColumn === 'symbol' ? sortDirection : null} />
                      </div>
                    </th>
                    <th
                      className="cursor-pointer px-4 py-3.5 hover:text-white transition"
                      onClick={() => handleSort('name')}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Name</span>
                        <SortIcon dir={sortColumn === 'name' ? sortDirection : null} />
                      </div>
                    </th>
                    <th
                      className="cursor-pointer px-4 py-3.5 text-right hover:text-white transition"
                      onClick={() => handleSort('close')}
                    >
                      <div className="flex items-center justify-end gap-1.5">
                        <span>Close (₹)</span>
                        <SortIcon dir={sortColumn === 'close' ? sortDirection : null} />
                      </div>
                    </th>
                    <th
                      className="cursor-pointer px-4 py-3.5 text-right hover:text-white transition"
                      onClick={() => handleSort('margin')}
                    >
                      <div className="flex items-center justify-end gap-1.5">
                        <span>Margin (₹)</span>
                        <SortIcon dir={sortColumn === 'margin' ? sortDirection : null} />
                      </div>
                    </th>
                    <th
                      className="cursor-pointer px-4 py-3.5 text-right hover:text-white transition"
                      onClick={() => handleSort('rupeezyMargin')}
                    >
                      <div className="flex items-center justify-end gap-1.5">
                        <span>Rupeezy Margin (₹)</span>
                        <SortIcon dir={sortColumn === 'rupeezyMargin' ? sortDirection : null} />
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
                  {paginatedResults.map((item, idx) => (
                    <tr
                      key={item.symbol || idx}
                      className="transition hover:bg-slate-800/50"
                    >
                      <td className="px-4 py-3 text-center text-xs font-mono text-slate-500">
                        {startIndex + idx + 1}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center rounded-md border border-slate-700 bg-slate-800/90 px-2.5 py-1 text-xs font-mono font-bold text-blue-300">
                          {item.symbol || '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium text-white">{item.name || '—'}</td>
                      <td className="px-4 py-3 text-right font-mono font-semibold text-slate-200">
                        {formatNumber(item.close)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-medium text-emerald-400">
                        {formatNumber(item.margin)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-medium text-indigo-400">
                        {formatNumber(item.rupeezyMargin)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-800 px-5 py-4 bg-slate-950/40 text-xs text-slate-400">
              <div className="flex items-center gap-3">
                <span>
                  Showing <span className="font-semibold text-white">{startIndex + 1}</span> to{' '}
                  <span className="font-semibold text-white">{endIndex}</span> of{' '}
                  <span className="font-semibold text-white">{totalItems}</span> results
                </span>

                <div className="flex items-center gap-1.5 ml-2 border-l border-slate-800 pl-3">
                  <span>Per page:</span>
                  <select
                    value={pageSize}
                    onChange={handlePageSizeChange}
                    className="rounded border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-white focus:border-blue-500 focus:outline-none"
                  >
                    {PAGE_SIZE_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 font-medium text-slate-300 transition hover:bg-slate-700 hover:text-white disabled:opacity-40 disabled:pointer-events-none"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous
                </button>

                <div className="flex items-center gap-1 px-2 font-mono text-slate-300">
                  <span className="font-semibold text-white">{currentPage}</span> / <span>{totalPages}</span>
                </div>

                <button
                  type="button"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage >= totalPages}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 font-medium text-slate-300 transition hover:bg-slate-700 hover:text-white disabled:opacity-40 disabled:pointer-events-none"
                >
                  Next
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
