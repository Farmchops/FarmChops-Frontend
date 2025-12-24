import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  Users,
  ShoppingCart,
  TrendingUp,
  DollarSign,
  Download,
  Edit,
  Ban,
  CheckCircle
} from 'lucide-react';
import {
  useGetMarketerQuery,
  useGetMarketerReportQuery,
  useUpdateMarketerMutation
} from '@/redux/api/marketersApi';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import type { Marketer } from '@/types/marketing';

export default function MarketerDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
    endDate: new Date().toISOString().split('T')[0], // today
  });

  const { data: marketerData, isLoading: isLoadingMarketer } = useGetMarketerQuery(id!, {
    skip: !id,
  });

  const { data: reportData, isLoading: isLoadingReport } = useGetMarketerReportQuery({
    id: id!,
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
  }, {
    skip: !id,
  });

  const [updateMarketer] = useUpdateMarketerMutation();

  const marketer = marketerData?.data?.marketer;
  const report = reportData?.data?.report;

  const formatCurrency = (amountInKobo: number) => {
    return `₦${(amountInKobo / 100).toLocaleString()}`;
  };

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return '-';
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
      case 'suspended':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleStatusChange = async (newStatus: 'active' | 'inactive' | 'suspended') => {
    if (!marketer) return;

    const confirm = window.confirm(`Are you sure you want to change status to "${newStatus}"?`);
    if (!confirm) return;

    try {
      await updateMarketer({
        id: marketer._id,
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

  if (isLoadingMarketer) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (!marketer) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-red-500">Marketer not found</p>
          <button
            onClick={() => navigate('/admin/marketers')}
            className="mt-4 text-green-600 hover:underline"
          >
            Back to Marketers
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
          onClick={() => navigate('/admin/marketers')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Marketers</span>
        </button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              {marketer.firstName} {marketer.lastName}
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Marketing Code: <span className="font-mono font-semibold text-blue-600">{marketer.marketingCode}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Status Badge */}
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusBadgeClass(marketer.status)}`}>
              {marketer.status}
            </span>

            {/* Status Actions Dropdown */}
            <div className="relative group">
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                <Edit className="w-4 h-4" />
                <span className="text-sm">Change Status</span>
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                <button
                  onClick={() => handleStatusChange('active')}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-green-600"
                  disabled={marketer.status === 'active'}
                >
                  <CheckCircle className="w-4 h-4" />
                  Set Active
                </button>
                <button
                  onClick={() => handleStatusChange('inactive')}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-gray-600"
                  disabled={marketer.status === 'inactive'}
                >
                  <Ban className="w-4 h-4" />
                  Set Inactive
                </button>
                <button
                  onClick={() => handleStatusChange('suspended')}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-red-600"
                  disabled={marketer.status === 'suspended'}
                >
                  <Ban className="w-4 h-4" />
                  Suspend
                </button>
              </div>
            </div>

            <button
              onClick={handleExportReport}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span className="text-sm">Export Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* Marketer Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Contact Information */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="text-sm font-medium">{marketer.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Phone</p>
                <p className="text-sm font-medium">{marketer.phone}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Joined</p>
                <p className="text-sm font-medium">{formatDate(marketer.createdAt)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Commission Settings */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Commission Settings</h3>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-500">Commission Rate</p>
              <p className="text-2xl font-semibold text-green-600">{marketer.commissionRate}%</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Attribution Window</p>
              <p className="text-sm font-medium">{marketer.attributionWindowDays} days</p>
            </div>
          </div>
        </div>
      </div>

      {/* Lifetime Statistics */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
        <h3 className="text-lg font-semibold mb-4">Lifetime Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Signups</p>
                <p className="text-2xl font-semibold text-gray-900 mt-1">{marketer.totalSignups}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="p-4 bg-purple-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-2xl font-semibold text-gray-900 mt-1">{marketer.totalOrders}</p>
              </div>
              <ShoppingCart className="w-8 h-8 text-purple-600" />
            </div>
          </div>

          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-semibold text-gray-900 mt-1">
                  {formatCurrency(marketer.totalRevenue)}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="p-4 bg-orange-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Unpaid Commission</p>
                <p className="text-2xl font-semibold text-orange-600 mt-1">
                  {formatCurrency(marketer.unpaidCommission)}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-orange-600" />
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
              onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">To:</label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
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
              <p className="text-sm text-gray-600">Period Signups</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">{report.periodSignups}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <p className="text-sm text-gray-600">Period Orders</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">{report.periodOrders}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <p className="text-sm text-gray-600">Period Revenue</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">
                {formatCurrency(report.periodRevenue)}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <p className="text-sm text-gray-600">Period Commission</p>
              <p className="text-2xl font-semibold text-green-600 mt-1">
                {formatCurrency(report.periodCommission)}
              </p>
            </div>
          </div>

          {/* Recent Orders */}
          {report.recentOrders && report.recentOrders.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold">Recent Orders (Period)</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order #</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Commission</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {report.recentOrders.map((order) => (
                      <tr key={order.orderId} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          #{order.orderNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {order.customerName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(order.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(order.orderTotal)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                          {formatCurrency(order.commissionEarned)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            order.commissionPaid ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                          }`}>
                            {order.commissionPaid ? 'Paid' : 'Unpaid'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Commission Payment History */}
          {report.commissionPayments && report.commissionPayments.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold">Commission Payment History</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reference</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paid By</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {report.commissionPayments.map((payment) => (
                      <tr key={payment._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(payment.paymentDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                          {formatCurrency(payment.amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(payment.periodStart)} - {formatDate(payment.periodEnd)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {payment.paymentMethod}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {payment.paymentReference || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {payment.paidBy}
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
