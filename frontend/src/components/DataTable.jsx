import React, { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown, Search, ChevronLeft, ChevronRight, MoreVertical } from 'lucide-react';
import EmptyState from './EmptyState';
import { TableSkeleton } from './LoadingSkeleton';

const getNestedValue = (obj, path) => {
  if (!path) return undefined;
  return path.split('.').reduce((acc, part) => acc && acc[part], obj);
};

const DataTable = ({
  columns = [],
  data = [],
  searchPlaceholder = 'Search records...',
  filterField = '',
  filterOptions = [],
  filterLabel = 'Filter',
  actions = [],
  isLoading = false,
  emptyStateTitle = 'No records found',
  emptyStateDescription = 'Try adjusting your filters or search query.'
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: '', direction: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [activeRowActions, setActiveRowActions] = useState(null);

  const handleSearchChange = (e) => { setSearchQuery(e.target.value); setCurrentPage(1); };
  const handleFilterChange = (e) => { setSelectedFilter(e.target.value); setCurrentPage(1); };

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') { direction = 'descending'; }
    else if (sortConfig.key === key && sortConfig.direction === 'descending') { direction = ''; key = ''; }
    setSortConfig({ key, direction });
    setCurrentPage(1);
  };

  const processedData = useMemo(() => {
    let result = [...data];
    if (selectedFilter && filterField) {
      result = result.filter(row => {
        const value = getNestedValue(row, filterField);
        return value && String(value).toLowerCase() === String(selectedFilter).toLowerCase();
      });
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(row => {
        const matchCol = columns.some(col => {
          if (!col.accessor) return false;
          const cellValue = getNestedValue(row, col.accessor);
          return cellValue && String(cellValue).toLowerCase().includes(query);
        });
        const matchDesc = row.description && String(row.description).toLowerCase().includes(query);
        return matchCol || matchDesc;
      });
    }
    if (sortConfig.key && sortConfig.direction) {
      result.sort((a, b) => {
        const aVal = getNestedValue(a, sortConfig.key);
        const bVal = getNestedValue(b, sortConfig.key);
        if (aVal === undefined || aVal === null) return 1;
        if (bVal === undefined || bVal === null) return -1;
        const aString = typeof aVal === 'string' ? aVal.toLowerCase() : aVal;
        const bString = typeof bVal === 'string' ? bVal.toLowerCase() : bVal;
        if (aString < bString) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (aString > bString) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }
    return result;
  }, [data, searchQuery, selectedFilter, filterField, sortConfig, columns]);

  const totalItems = processedData.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return processedData.slice(start, start + pageSize);
  }, [processedData, currentPage, pageSize]);

  const startItemIdx = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItemIdx = Math.min(currentPage * pageSize, totalItems);

  const getSortIcon = (column) => {
    if (!column.sortable) return null;
    if (sortConfig.key !== column.accessor) {
      return <ChevronsUpDown className="w-3.5 h-3.5 ml-1 text-text-muted dark:text-text-muted-dark group-hover:text-text-primary shrink-0" strokeWidth={1.5} />;
    }
    if (sortConfig.direction === 'ascending') {
      return <ChevronUp className="w-3.5 h-3.5 ml-1 text-brand dark:text-brand-dark shrink-0" strokeWidth={1.5} />;
    }
    return <ChevronDown className="w-3.5 h-3.5 ml-1 text-brand dark:text-brand-dark shrink-0" strokeWidth={1.5} />;
  };

  if (isLoading) {
    return <TableSkeleton rows={5} cols={columns.length + (actions.length > 0 ? 1 : 0)} />;
  }

  return (
    <div className="bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-xl overflow-hidden shadow-sm transition-colors duration-200">
      {/* Controls Bar */}
      <div className="p-4 border-b border-border dark:border-border-dark bg-background dark:bg-background-dark flex flex-col sm:flex-row gap-3 items-center justify-between">
        {/* Search */}
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-muted dark:text-text-muted-dark pointer-events-none" strokeWidth={1.5} />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder={searchPlaceholder}
            className="w-full pl-9 pr-4 py-2 text-sm bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-lg text-text-primary dark:text-text-primary-dark placeholder-text-muted focus:outline-hidden focus:ring-1 focus:ring-accent dark:focus:ring-accent-dark focus:border-accent transition-colors duration-200"
          />
        </div>

        {/* Filters */}
        {filterField && filterOptions.length > 0 && (
          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
            <span className="text-xs font-semibold text-text-muted dark:text-text-muted-dark">{filterLabel}:</span>
            <select
              value={selectedFilter}
              onChange={handleFilterChange}
              className="text-sm bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-lg px-3 py-2 text-text-primary dark:text-text-primary-dark focus:outline-hidden focus:ring-1 focus:ring-accent dark:focus:ring-accent-dark cursor-pointer min-w-[120px] transition-colors duration-200"
            >
              {filterOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Table Area */}
      <div className="overflow-x-auto min-h-[220px]">
        {paginatedData.length === 0 ? (
          <div className="py-12 px-4">
            <EmptyState title={emptyStateTitle} description={emptyStateDescription} />
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-background dark:bg-background-dark border-b border-border dark:border-border-dark">
                {columns.map((col, idx) => (
                  <th
                    key={idx}
                    onClick={() => col.sortable && requestSort(col.accessor)}
                    className={`px-6 py-3.5 text-[10px] font-semibold text-text-muted dark:text-text-muted-dark uppercase tracking-wider ${
                      col.sortable ? 'cursor-pointer select-none group hover:bg-border/30 dark:hover:bg-border-dark/30' : ''
                    }`}
                  >
                    <div className="flex items-center">
                      {col.header}
                      {getSortIcon(col)}
                    </div>
                  </th>
                ))}
                {actions.length > 0 && (
                  <th className="px-6 py-3.5 text-right text-[10px] font-semibold text-text-muted dark:text-text-muted-dark uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-border dark:divide-border-dark">
              {paginatedData.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className="hover:bg-background dark:hover:bg-background-dark transition-colors duration-150"
                >
                  {columns.map((col, colIndex) => (
                    <td
                      key={colIndex}
                      className="px-6 py-4 text-sm text-text-primary dark:text-text-primary-dark font-sans"
                    >
                      {col.render ? col.render(row) : row[col.accessor]}
                    </td>
                  ))}
                  {actions.length > 0 && (
                    <td className="px-6 py-4 text-right relative whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {actions.slice(0, 2).map((act, actIdx) => (
                          <button
                            key={actIdx}
                            onClick={() => act.onClick(row)}
                            className={`text-xs font-semibold px-2.5 py-1 rounded-md transition-colors duration-150 border select-none cursor-pointer ${
                              act.danger
                                ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-500/20 hover:bg-rose-100 dark:hover:bg-rose-500/20'
                                : 'bg-background dark:bg-background-dark text-text-primary dark:text-text-primary-dark border-border dark:border-border-dark hover:bg-border/30 dark:hover:bg-border-dark/30'
                            }`}
                          >
                            {act.label}
                          </button>
                        ))}
                        {actions.length > 2 && (
                          <div className="relative inline-block">
                            <button
                              onClick={() => setActiveRowActions(activeRowActions === rowIndex ? null : rowIndex)}
                              className="text-text-muted dark:text-text-muted-dark hover:text-text-primary dark:hover:text-text-primary-dark p-1 rounded-md hover:bg-background dark:hover:bg-background-dark cursor-pointer transition-colors"
                            >
                              <MoreVertical className="w-4 h-4" strokeWidth={1.5} />
                            </button>
                            {activeRowActions === rowIndex && (
                              <>
                                <div className="fixed inset-0 z-10" onClick={() => setActiveRowActions(null)}></div>
                                <div className="absolute right-0 mt-1 w-36 bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-lg shadow-lg z-20 py-1 text-left">
                                  {actions.slice(2).map((act, actIdx) => (
                                    <button
                                      key={actIdx}
                                      onClick={() => { act.onClick(row); setActiveRowActions(null); }}
                                      className={`w-full block text-left px-4 py-2 text-xs font-semibold hover:bg-background dark:hover:bg-background-dark transition-colors ${
                                        act.danger ? 'text-rose-600 dark:text-rose-400' : 'text-text-primary dark:text-text-primary-dark'
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

      {/* Pagination */}
      {totalItems > 0 && (
        <div className="px-6 py-4 border-t border-border dark:border-border-dark bg-background dark:bg-background-dark flex flex-col sm:flex-row gap-3 items-center justify-between transition-colors duration-200">
          <span className="text-xs text-text-muted dark:text-text-muted-dark">
            Showing <strong className="font-semibold text-text-primary dark:text-text-primary-dark">{startItemIdx}</strong> to{' '}
            <strong className="font-semibold text-text-primary dark:text-text-primary-dark">{endItemIdx}</strong> of{' '}
            <strong className="font-semibold text-text-primary dark:text-text-primary-dark">{totalItems}</strong> entries
          </span>
          <div className="flex items-center gap-1.5 select-none">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 border border-border dark:border-border-dark rounded-lg text-text-muted dark:text-text-muted-dark hover:bg-surface dark:hover:bg-surface-dark disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4 shrink-0" strokeWidth={1.5} />
            </button>
            {Array.from({ length: Math.min(totalPages, 7) }).map((_, i) => {
              const p = i + 1;
              const isSelected = p === currentPage;
              return (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-brand dark:bg-brand-dark border-brand dark:border-brand-dark text-white'
                      : 'bg-surface dark:bg-surface-dark border-border dark:border-border-dark text-text-muted dark:text-text-muted-dark hover:bg-background dark:hover:bg-background-dark'
                  }`}
                >
                  {p}
                </button>
              );
            })}
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 border border-border dark:border-border-dark rounded-lg text-text-muted dark:text-text-muted-dark hover:bg-surface dark:hover:bg-surface-dark disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4 shrink-0" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
