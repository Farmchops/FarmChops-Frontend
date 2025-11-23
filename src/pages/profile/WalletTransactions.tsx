// src/pages/profile/WalletTransactions.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Filter,
  ChevronDown,
  Calendar,
  X,
  Download,
  History,
} from 'lucide-react';
import { useGetWalletTransactionsQuery } from '@/redux/api/walletApi';
import { TransactionItem } from '@/components/Wallet';
import type { TransactionType, TransactionStatus } from '@/types/wallet';

const WalletTransactions = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<{
    type?: TransactionType;
    status?: TransactionStatus;
    startDate?: string;
    endDate?: string;
  }>({});

  const { data, isLoading, isFetching } = useGetWalletTransactionsQuery({
    page,
    limit: 20,
    ...filters,
  });

  const transactions = data?.data?.transactions ?? [];
  const pagination = data?.data?.pagination;

  const hasActiveFilters = Object.values(filters).some(Boolean);

  const clearFilters = () => {
    setFilters({});
    setPage(1);
  };

  const applyFilter = (key: keyof typeof filters, value: string | undefined) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
    }));
    setPage(1);
  };

  return (
    <div className="py-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/profile/wallet')}
          className="p-2 hover:bg-gray-100 rounded-full transition"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Transaction History</h1>
          <p className="text-gray-600 text-sm mt-1">
            {pagination?.totalItems ?? 0} transactions
          </p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition ${
            hasActiveFilters
              ? 'border-[#1D7B3C] bg-green-50 text-[#1D7B3C]'
              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Filter className="w-4 h-4" />
          Filters
          {hasActiveFilters && (
            <span className="w-5 h-5 bg-[#1D7B3C] text-white text-xs rounded-full flex items-center justify-center">
              {Object.values(filters).filter(Boolean).length}
            </span>
          )}
        </button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-900">Filter Transactions</h3>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-red-600 hover:underline flex items-center gap-1"
              >
                <X className="w-3 h-3" />
                Clear all
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <div className="relative">
                <select
                  value={filters.type || ''}
                  onChange={(e) => applyFilter('type', e.target.value as TransactionType)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-[#1D7B3C] focus:border-transparent"
                >
                  <option value="">All Types</option>
                  <option value="credit">Credit</option>
                  <option value="debit">Debit</option>
                  <option value="refund">Refund</option>
                </select>
                <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <div className="relative">
                <select
                  value={filters.status || ''}
                  onChange={(e) => applyFilter('status', e.target.value as TransactionStatus)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-[#1D7B3C] focus:border-transparent"
                >
                  <option value="">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                </select>
                <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                From Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={filters.startDate || ''}
                  onChange={(e) => applyFilter('startDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#1D7B3C] focus:border-transparent"
                />
                <Calendar className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                To Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={filters.endDate || ''}
                  onChange={(e) => applyFilter('endDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#1D7B3C] focus:border-transparent"
                />
                <Calendar className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Tags */}
      {hasActiveFilters && !showFilters && (
        <div className="flex flex-wrap gap-2 mb-4">
          {filters.type && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
              Type: {filters.type}
              <button onClick={() => applyFilter('type', undefined)}>
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {filters.status && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
              Status: {filters.status}
              <button onClick={() => applyFilter('status', undefined)}>
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {filters.startDate && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
              From: {filters.startDate}
              <button onClick={() => applyFilter('startDate', undefined)}>
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {filters.endDate && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
              To: {filters.endDate}
              <button onClick={() => applyFilter('endDate', undefined)}>
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}

      {/* Transactions List */}
      <div className="bg-white border border-gray-100 rounded-xl">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1D7B3C] mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading transactions...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-12 text-center">
            <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              No transactions found
            </h3>
            <p className="text-gray-500">
              {hasActiveFilters
                ? 'Try adjusting your filters'
                : 'Your transaction history will appear here'}
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="mt-4 text-[#1D7B3C] hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="divide-y divide-gray-100">
              {transactions.map((transaction) => (
                <TransactionItem key={transaction.id} transaction={transaction} />
              ))}
            </div>

            {/* Loading overlay */}
            {isFetching && !isLoading && (
              <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1D7B3C]"></div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-gray-600">
            Page {pagination.currentPage} of {pagination.totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || isFetching}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= pagination.totalPages || isFetching}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Export Button (placeholder) */}
      <div className="mt-6 flex justify-end">
        <button
          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition"
          title="Coming soon"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>
    </div>
  );
};

export default WalletTransactions;
