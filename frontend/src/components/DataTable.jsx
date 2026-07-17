import React, { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown, Search, ChevronLeft, ChevronRight, MoreVertical } from 'lucide-react';
import EmptyState from './EmptyState';
import { TableSkeleton } from './LoadingSkeleton';

const DataTable = ({
  columns = [],
  data = [],
  searchPlaceholder = 'Search records...',
  filterField = '',
  filterOptions = [], // e.g. [{ label: 'All Statuses', value: '' }, { label: 'On Track', value: 'On Track' }]
  filterLabel = 'Filter',
  actions = [], // e.g. [{ label: 'Edit', onClick: (row) => {} }]
  isLoading = false,
  emptyStateTitle = 'No records found',
  emptyStateDescription = 'Try adjusting your filters or search query.'
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: '', direction: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [activeRowActions, setActiveRowActions] = useState(null);

  // Reset pagination on search or filter change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterChange = (e) => {
    setSelectedFilter(e.target.value);
    setCurrentPage(1);
  };

  // Sorting handler
  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    } else if (sortConfig.key === key && sortConfig.direction === 'descending') {
      direction = '';
      key = '';
    }
    setSortConfig({ key, direction });
    setCurrentPage(1);
  };

  // Filtered & Sorted Data
  const processedData = useMemo(() => {
    let result = [...data];

    // Apply status/category filters
    if (selectedFilter && filterField) {
      result = result.filter(row => {
        const value = row[filterField];
        return value && String(value).toLowerCase() === String(selectedFilter).toLowerCase();
      });
    }

    // Apply global text search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(row => {
        return columns.some(col => {
          if (!col.accessor) return false;
          // Custom render search is complex, search raw data instead
          const cellValue = row[col.accessor];
          return cellValue && String(cellValue).toLowerCase().includes(query);
        });
      });
    }

    // Apply sorting
    if (sortConfig.key && sortConfig.direction) {
      result.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];

        if (aVal === undefined || aVal === null) return 1;
        if (bVal === undefined || bVal === null) return -1;

        const aString = typeof aVal === 'string' ? aVal.toLowerCase() : aVal;
        const bString = typeof bVal === 'string' ? bVal.toLowerCase() : bVal;

        if (aString < bString) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aString > bString) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }

    return result;
  }, [data, searchQuery, selectedFilter, filterField, sortConfig, columns]);

  // Pagination calculations
  const totalItems = processedData.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return processedData.slice(start, start + pageSize);
  }, [processedData, currentPage, pageSize]);

  // Page index range text
  const startItemIdx = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItemIdx = Math.min(currentPage * pageSize, totalItems);

  // Sorting icon renderer
  const getSortIcon = (column) => {
    if (!column.sortable) return null;
    if (sortConfig.key !== column.accessor) {
      return <ChevronsUpDown className="w-3.5 h-3.5 ml-1 text-slate-400 group-hover:text-slate-600 shrink-0" />;
    }
    if (sortConfig.direction === 'ascending') {
      return <ChevronUp className="w-3.5 h-3.5 ml-1 text-primary dark:text-teal-400 shrink-0" />;
    }
    return <ChevronDown className="w-3.5 h-3.5 ml-1 text-primary dark:text-teal-400 shrink-0" />;
  };

  if (isLoading) {
    return <TableSkeleton rows={5} cols={columns.length + (actions.length > 0 ? 1 : 0)} />;
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
      {/* Controls Bar */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 flex flex-col sm:flex-row gap-3 items-center justify-between">
        {/* Search */}
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400 dark:text-slate-500 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder={searchPlaceholder}
            className="w-full pl-9 pr-4 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-lg text-slate-700 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-accent focus:border-accent"
          />
        </div>

        {/* Filters */}
        {filterField && filterOptions.length > 0 && (
          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{filterLabel}:</span>
            <select
              value={selectedFilter}
              onChange={handleFilterChange}
              className="text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-lg px-3 py-2 text-slate-700 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-accent focus:border-accent cursor-pointer min-w-[120px]"
            >
              {filterOptions.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Table Area */}
      <div className="overflow-x-auto min-h-[220px]">
        {paginatedData.length === 0 ? (
          <div className="py-12 px-4">
            <EmptyState
              title={emptyStateTitle}
              description={emptyStateDescription}
            />
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-900/20 border-b border-slate-100 dark:border-slate-800">
                {columns.map((col, idx) => (
                  <th
                    key={idx}
                    onClick={() => col.sortable && requestSort(col.accessor)}
                    className={`px-6 py-3.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ${
                      col.sortable ? 'cursor-pointer select-none group hover:bg-slate-100/50 dark:hover:bg-slate-800/30' : ''
                    }`}
                  >
                    <div className="flex items-center">
                      {col.header}
                      {getSortIcon(col)}
                    </div>
                  </th>
                ))}
                {actions.length > 0 && (
                  <th className="px-6 py-3.5 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {paginatedData.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className="hover:bg-slate-50/40 dark:hover:bg-slate-800/10 transition-colors"
                >
                  {columns.map((col, colIndex) => (
                    <td
                      key={colIndex}
                      className="px-6 py-4 text-sm text-slate-700 dark:text-slate-200 font-sans"
                    >
                      {col.render ? col.render(row) : row[col.accessor]}
                    </td>
                  ))}
                  {actions.length > 0 && (
                    <td className="px-6 py-4 text-right relative whitespace-nowrap">
                      {/* Action trigger button */}
                      <div className="flex items-center justify-end gap-1.5">
                        {actions.slice(0, 2).map((act, actIdx) => (
                          <button
                            key={actIdx}
                            onClick={() => act.onClick(row)}
                            className={`text-xs font-semibold px-2.5 py-1 rounded-md transition-colors border select-none cursor-pointer ${
                              act.danger
                                ? 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-800/30 hover:bg-rose-100 dark:hover:bg-rose-950/40'
                                : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                          >
                            {act.label}
                          </button>
                        ))}
                        {actions.length > 2 && (
                          <div className="relative inline-block">
                            <button
                              onClick={() =>
                                setActiveRowActions(
                                  activeRowActions === rowIndex ? null : rowIndex
                                )
                              }
                              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>
                            {activeRowActions === rowIndex && (
                              <>
                                <div
                                  className="fixed inset-0 z-10"
                                  onClick={() => setActiveRowActions(null)}
                                ></div>
                                <div className="absolute right-0 mt-1 w-36 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-20 py-1 text-left">
                                  {actions.slice(2).map((act, actIdx) => (
                                    <button
                                      key={actIdx}
                                      onClick={() => {
                                        act.onClick(row);
                                        setActiveRowActions(null);
                                      }}
                                      className={`w-full block text-left px-4 py-2 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-700/50 ${
                                        act.danger
                                          ? 'text-rose-600 dark:text-rose-400'
                                          : 'text-slate-700 dark:text-slate-300'
                                      }`}
                                    >
                                      {act.label}
                                    </button>
                                  ))}
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination Controls */}
      {totalItems > 0 && (
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 flex flex-col sm:flex-row gap-3 items-center justify-between">
          {/* Sizing description */}
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Showing <strong className="font-semibold text-slate-700 dark:text-slate-200">{startItemIdx}</strong> to{' '}
            <strong className="font-semibold text-slate-700 dark:text-slate-200">{endItemIdx}</strong> of{' '}
            <strong className="font-semibold text-slate-700 dark:text-slate-200">{totalItems}</strong> entries
          </span>

          {/* Navigation buttons */}
          <div className="flex items-center gap-1.5 select-none">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850 disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4 shrink-0" />
            </button>
            {Array.from({ length: totalPages }).map((_, i) => {
              const p = i + 1;
              const isSelected = p === currentPage;
              return (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-primary dark:bg-slate-800 border-primary dark:border-slate-750 text-white'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-850'
                  }`}
                >
                  {p}
                </button>
              );
            })}
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850 disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4 shrink-0" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
