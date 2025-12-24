import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Tag,
  Calendar,
  Users,
  TrendingDown,
  Download,
  Edit,
  Ban,
  CheckCircle
} from 'lucide-react';
import {
  useGetCouponQuery,
  useGetCouponReportQuery,
  useUpdateCouponMutation
} from '@/redux/api/couponsApi';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export default function CouponDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
    endDate: new Date().toISOString().split('T')[0], // today
  });

  const { data: couponData, isLoading: isLoadingCoupon } = useGetCouponQuery(id!, {
    skip: !id,
  });

  const { data: reportData, isLoading: isLoadingReport } = useGetCouponReportQuery(id!, {
    skip: !id,
  });

  const [updateCoupon] = useUpdateCouponMutation();

  const coupon = couponData?.data?.coupon;
  const report = reportData?.data;

  const formatCurrency = (amountInKobo: number) => {
    return `₦${(amountInKobo / 100).toLocaleString()}`;
  };

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return 'No expiry';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDiscountTypeLabel = (type: string) => {
    switch (type) {
      case 'percentage':
        return 'Percentage';
      case 'fixed_amount':
        return 'Fixed Amount';
      case 'free_delivery':
        return 'Free Delivery';
      default:
        return type;
    }
  };

  const handleStatusChange = async (newStatus: 'active' | 'inactive') => {
    if (!coupon) return;

    const confirm = window.confirm(`Are you sure you want to change status to "${newStatus}"?`);
    if (!confirm) return;

    try {
      await updateCoupon({
        couponId: coupon._id,
        data: { status: newStatus }
      }).unwrap();
    } catch (error: any) {
      alert(error?.data?.message || 'Failed to update status');
    }
  };

  const handleExportReport = () => {
    // TODO: Implement CSV export
    alert('CSV export feature coming soon!');
  };

  if (isLoadingCoupon) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (!coupon) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-red-500">Coupon not found</p>
          <button
            type="button"
            onClick={() => navigate('/admin/coupons')}
            className="mt-4 text-green-600 hover:underline"
          >
            Back to Coupons
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          type="button"
          onClick={() => navigate('/admin/coupons')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Coupons</span>
        </button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              {coupon.code}
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              {coupon.description}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Status Badge */}
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusBadgeClass(coupon.status)}`}>
              {coupon.status}
            </span>

            {/* Status Actions Dropdown */}
            {coupon.status !== 'expired' && (
              <div className="relative group">
                <button
                  type="button"
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  <span className="text-sm">Change Status</span>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                  <button
                    type="button"
                    onClick={() => handleStatusChange('active')}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-green-600"
                    disabled={coupon.status === 'active'}
                  >
                    <CheckCircle className="w-4 h-4" />
                    Set Active
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStatusChange('inactive')}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-gray-600"
                    disabled={coupon.status === 'inactive'}
                  >
                    <Ban className="w-4 h-4" />
                    Set Inactive
                  </button>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={handleExportReport}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span className="text-sm">Export Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* Coupon Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Discount Details */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Discount Details</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Tag className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Type</p>
                <p className="text-sm font-medium">{getDiscountTypeLabel(coupon.discountType)}</p>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500">Value</p>
              <p className="text-2xl font-semibold text-green-600">
                {coupon.discountType === 'percentage'
                  ? `${coupon.discountValue}%`
                  : coupon.discountType === 'fixed_amount'
                    ? formatCurrency(coupon.discountValue)
                    : 'Free Delivery'}
              </p>
            </div>
            {coupon.maxDiscountAmount && (
              <div>
                <p className="text-xs text-gray-500">Max Discount</p>
                <p className="text-sm font-medium">{formatCurrency(coupon.maxDiscountAmount)}</p>
              </div>
            )}
            {coupon.minOrderAmount && (
              <div>
                <p className="text-xs text-gray-500">Minimum Order</p>
                <p className="text-sm font-medium">{formatCurrency(coupon.minOrderAmount)}</p>
              </div>
            )}
          </div>
        </div>

        {/* Usage & Validity */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Usage & Validity</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Valid From</p>
                <p className="text-sm font-medium">{formatDate(coupon.validFrom)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Valid Until</p>
                <p className="text-sm font-medium">{formatDate(coupon.validUntil)}</p>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500">Usage Limits</p>
              <p className="text-sm font-medium">
                {coupon.maxUsesTotal ? `Max ${coupon.maxUsesTotal} total uses` : 'Unlimited total uses'}
                {' • '}
                Max {coupon.maxUsesPerUser} per user
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Current Uses</p>
              <p className="text-2xl font-semibold text-gray-900">{coupon.currentUses}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Lifetime Statistics */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
        <h3 className="text-lg font-semibold mb-4">Lifetime Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Uses</p>
                <p className="text-2xl font-semibold text-gray-900 mt-1">{coupon.currentUses}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="p-4 bg-purple-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Unique Users</p>
                <p className="text-2xl font-semibold text-gray-900 mt-1">
                  {report?.lifetimeUniqueUsers || 0}
                </p>
              </div>
              <Users className="w-8 h-8 text-purple-600" />
            </div>
          </div>

          <div className="p-4 bg-orange-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Discount Given</p>
                <p className="text-2xl font-semibold text-gray-900 mt-1">
                  {formatCurrency(report?.lifetimeTotalDiscount || 0)}
                </p>
              </div>
              <TrendingDown className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="flex items-center gap-4">
          <h3 className="font-semibold">Period Report</h3>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">From:</label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange((prev: { startDate: string; endDate: string }) => ({ ...prev, startDate: e.target.value }))}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">To:</label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange((prev: { startDate: string; endDate: string }) => ({ ...prev, endDate: e.target.value }))}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm"
            />
          </div>
        </div>
      </div>

      {/* Period Performance Report */}
      {isLoadingReport ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner />
        </div>
      ) : report ? (
        <>
          {/* Period Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <p className="text-sm text-gray-600">Period Uses</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">{report?.metrics?.totalUses || 0}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <p className="text-sm text-gray-600">Period Users</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">{report?.metrics?.uniqueUsers || 0}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <p className="text-sm text-gray-600">Period Discount</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">
                {formatCurrency(report?.metrics?.totalDiscount || 0)}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <p className="text-sm text-gray-600">Avg Discount/Use</p>
              <p className="text-2xl font-semibold text-green-600 mt-1">
                {formatCurrency(report?.metrics?.averageDiscount || 0)}
              </p>
            </div>
          </div>

          {/* Recent Usage */}
          {report?.recentUses && report.recentUses.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold">Recent Usage (Period)</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order #</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order Total</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Discount</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {report.recentUses.map((usage: any) => (
                      <tr key={usage._id || usage.orderId} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          #{usage.orderNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {usage.customerName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(usage.usedAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(usage.orderTotal)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                          {formatCurrency(usage.discountAmount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Top Users */}
          {report.topUsers && report.topUsers.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold">Top Users</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Uses</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Discount</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {report.topUsers.map((user: any) => (
                      <tr key={user.userId} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {user.userName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.userEmail}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {user.useCount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                          {formatCurrency(user.totalDiscount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">No report data available for this period</p>
        </div>
      )}
    </div>
  );
}
