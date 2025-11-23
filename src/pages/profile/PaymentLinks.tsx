// src/pages/profile/PaymentLinks.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Link2,
  Filter,
  ChevronDown,
  X,
  RefreshCw,
} from 'lucide-react';
import {
  useGetMyPaymentLinksQuery,
  useCancelPaymentLinkMutation,
} from '@/redux/api/walletApi';
import { PaymentLinkCard } from '@/components/Wallet';
import type { PaymentLinkStatus } from '@/types/wallet';

const PaymentLinks = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<PaymentLinkStatus | ''>('');
  const [showConfirmCancel, setShowConfirmCancel] = useState<string | null>(null);

  const { data, isLoading, isFetching, refetch } = useGetMyPaymentLinksQuery({
    page,
    limit: 10,
    status: statusFilter || undefined,
  });

  const [cancelLink, { isLoading: cancelling }] = useCancelPaymentLinkMutation();

  const links = data?.data?.links ?? [];
  const pagination = data?.data?.pagination;

  const handleCancelLink = async (code: string) => {
    try {
      await cancelLink(code).unwrap();
      setShowConfirmCancel(null);
    } catch (err) {
      console.error('Failed to cancel link:', err);
    }
  };

  const statusOptions: { value: PaymentLinkStatus | ''; label: string }[] = [
    { value: '', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'paid', label: 'Paid' },
    { value: 'expired', label: 'Expired' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <div className="py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pay-for-Me Links</h1>
          <p className="text-gray-600 text-sm mt-1">
            Create and manage payment links to share with others
          </p>
        </div>
        <button
          onClick={() => navigate('/profile/payment-links/create')}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#1D7B3C] text-white rounded-xl font-medium hover:bg-green-700 transition"
        >
          <Plus className="w-4 h-4" />
          Create Link
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as PaymentLinkStatus | '');
              setPage(1);
            }}
            className="appearance-none px-4 py-2 pr-10 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#1D7B3C] focus:border-transparent"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {statusFilter && (
          <button
            onClick={() => {
              setStatusFilter('');
              setPage(1);
            }}
            className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 transition"
          >
            <X className="w-3 h-3" />
            Clear filter
          </button>
        )}

        <button
          onClick={() => refetch()}
          className="p-2 hover:bg-gray-100 rounded-full transition ml-auto"
          title="Refresh"
        >
          <RefreshCw className={`w-4 h-4 text-gray-500 ${isFetching ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
          <p className="text-sm text-blue-600 font-medium">Active</p>
          <p className="text-2xl font-bold text-blue-700">
            {links.filter((l) => l.status === 'active').length}
          </p>
        </div>
        <div className="bg-green-50 border border-green-100 rounded-xl p-4">
          <p className="text-sm text-green-600 font-medium">Paid</p>
          <p className="text-2xl font-bold text-green-700">
            {links.filter((l) => l.status === 'paid').length}
          </p>
        </div>
        <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4">
          <p className="text-sm text-yellow-600 font-medium">Expired</p>
          <p className="text-2xl font-bold text-yellow-700">
            {links.filter((l) => l.status === 'expired').length}
          </p>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
          <p className="text-sm text-gray-600 font-medium">Total</p>
          <p className="text-2xl font-bold text-gray-700">
            {pagination?.totalItems ?? links.length}
          </p>
        </div>
      </div>

      {/* Links List */}
      {isLoading ? (
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1D7B3C] mx-auto"></div>
          <p className="text-gray-500 mt-2">Loading payment links...</p>
        </div>
      ) : links.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Link2 className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No payment links yet
          </h3>
          <p className="text-gray-600 mb-6 max-w-sm mx-auto">
            Create a payment link to share with friends or family who want to help pay for your orders.
          </p>
          <button
            onClick={() => navigate('/profile/payment-links/create')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#1D7B3C] text-white rounded-xl font-medium hover:bg-green-700 transition"
          >
            <Plus className="w-4 h-4" />
            Create Your First Link
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {links.map((link) => (
            <PaymentLinkCard
              key={link.id}
              link={link}
              onCancel={(code) => setShowConfirmCancel(code)}
            />
          ))}
        </div>
      )}

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

      {/* How It Works */}
      <div className="mt-8 bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-100 rounded-2xl p-6">
        <h3 className="font-semibold text-gray-900 mb-4">How Pay-for-Me Works</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-purple-600">1</span>
            </div>
            <div>
              <p className="font-medium text-gray-900">Create a Link</p>
              <p className="text-sm text-gray-600">
                Specify the amount and add a description
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-purple-600">2</span>
            </div>
            <div>
              <p className="font-medium text-gray-900">Share the Link</p>
              <p className="text-sm text-gray-600">
                Send it to whoever wants to help pay
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-purple-600">3</span>
            </div>
            <div>
              <p className="font-medium text-gray-900">Receive Funds</p>
              <p className="text-sm text-gray-600">
                Money is added to your wallet instantly
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {showConfirmCancel && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Cancel Payment Link?
            </h3>
            <p className="text-gray-600 mb-6">
              This action cannot be undone. The link will no longer be usable.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmCancel(null)}
                className="flex-1 py-2.5 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition"
              >
                Keep Link
              </button>
              <button
                onClick={() => handleCancelLink(showConfirmCancel)}
                disabled={cancelling}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition disabled:opacity-50"
              >
                {cancelling ? 'Cancelling...' : 'Cancel Link'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentLinks;
