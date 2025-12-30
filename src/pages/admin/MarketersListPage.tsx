import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Users, Download, Calendar, TrendingUp, ShoppingCart, UserCheck, ChevronDown } from 'lucide-react';
import { useGetAllMarketersReportQuery } from '@/redux/api/marketersApi';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { CreateMarketerModal } from '@/components/modals/CreateMarketerModal';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Get current month start and end dates
const getCurrentMonthDates = () => {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
  };
};

export default function MarketersListPage() {
  const navigate = useNavigate();
  const [selectedMarketerId, setSelectedMarketerId] = useState<string>('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Date filtering - default to current month
  const currentMonth = getCurrentMonthDates();
  const [startDate, setStartDate] = useState(currentMonth.startDate);
  const [endDate, setEndDate] = useState(currentMonth.endDate);

  // Fetch marketers report for the selected date range
  const { data, isLoading, error } = useGetAllMarketersReportQuery({
    startDate,
    endDate,
  });

  const reportData = data?.data;
  const marketers = reportData?.marketers || [];
  const summary = reportData?.summary;

  // Filter marketers by selected marketer
  const filteredMarketers = selectedMarketerId
    ? marketers.filter((m) => m.marketerId === selectedMarketerId)
    : marketers;

  const formatCurrency = (amountInKobo: number) => {
    return `₦${(amountInKobo / 100).toLocaleString()}`;
  };

  // Export to PDF
  const handleExport = () => {
    try {
      if (filteredMarketers.length === 0) {
        console.log('No marketers to export');
        return;
      }

      const doc = new jsPDF();
      let yPosition = 20;

      // Add title
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Marketers Report', 14, yPosition);

      yPosition += 8;

      // Add date range
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Period: ${startDate} to ${endDate}`, 14, yPosition);

      yPosition += 10;

      // Add summary if available
      if (summary) {
        doc.setFontSize(9);
        doc.text(`Total Marketers: ${summary.totalMarketers || 0}  |  Active: ${summary.activeMarketers || 0}  |  With Activity: ${summary.marketersWithActivity || 0}`, 14, yPosition);
        yPosition += 5;
        doc.text(`Total Orders: ${summary.totalOrders || 0}  |  Total Sales: ${formatCurrency(summary.totalRevenue || 0)}`, 14, yPosition);
        yPosition += 10;
      }

      // Prepare table data
      const tableData = filteredMarketers.map((marketer) => [
        marketer.name,
        marketer.code,
        marketer.signups.toString(),
        marketer.orders.toString(),
        formatCurrency(marketer.revenue),
        formatCurrency(marketer.commission),
      ]);

      // Add table
      autoTable(doc, {
        startY: yPosition,
        head: [['Name', 'Code', 'Signups', 'Orders', 'Revenue', 'Commission']],
        body: tableData,
        styles: {
          fontSize: 9,
          cellPadding: 4,
          lineColor: [220, 220, 220],
          lineWidth: 0.5,
        },
        headStyles: {
          fillColor: [22, 163, 74], // green-600
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 10,
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252],
        },
        columnStyles: {
          1: { halign: 'center', fontStyle: 'bold' }, // Code
          2: { halign: 'center' }, // Signups
          3: { halign: 'center' }, // Orders
          4: { halign: 'right' }, // Revenue
          5: { halign: 'right' }, // Commission
        },
      });

      // Add footer
      const docWithTable = doc as jsPDF & { lastAutoTable?: { finalY: number } };
      const finalY = docWithTable.lastAutoTable?.finalY || yPosition + 50;
      const pageHeight = doc.internal.pageSize.height;

      if (finalY < pageHeight - 15) {
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`Generated on ${new Date().toLocaleDateString()}`, 14, pageHeight - 10);
      }

      // Save
      const filename = `Marketers_Report_${startDate}_to_${endDate}.pdf`;
      doc.save(filename);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Failed to export PDF. Check console for details.');
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Marketers</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Add Marketer</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Start Date */}
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-green-600"
            />
          </div>

          {/* End Date */}
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-green-600"
            />
          </div>

          {/* Marketer Filter */}
          <div className="relative">
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <select
              value={selectedMarketerId}
              onChange={(e) => setSelectedMarketerId(e.target.value)}
              className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-green-600 appearance-none bg-white"
            >
              <option value="">All Marketers</option>
              {marketers.map((marketer) => (
                <option key={marketer.marketerId} value={marketer.marketerId}>
                  {marketer.name}
                </option>
              ))}
            </select>
          </div>

          {/* Export Button */}
          <button
            type="button"
            onClick={handleExport}
            disabled={isLoading || filteredMarketers.length === 0}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>

        {/* Clear Filters */}
        {(selectedMarketerId || startDate !== currentMonth.startDate || endDate !== currentMonth.endDate) && (
          <button
            type="button"
            onClick={() => {
              setSelectedMarketerId('');
              setStartDate(currentMonth.startDate);
              setEndDate(currentMonth.endDate);
            }}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Reset to Current Month
          </button>
        )}
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Marketers</p>
                <p className="text-2xl font-semibold text-gray-900 mt-1">{summary.totalMarketers || 0}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Marketers</p>
                <p className="text-2xl font-semibold text-gray-900 mt-1">{summary.activeMarketers || 0}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <UserCheck className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">With Activity</p>
                <p className="text-2xl font-semibold text-gray-900 mt-1">{summary.marketersWithActivity || 0}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <UserCheck className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-2xl font-semibold text-gray-900 mt-1">{summary.totalOrders || 0}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <ShoppingCart className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Sales</p>
                <p className="text-2xl font-semibold text-gray-900 mt-1">
                  {formatCurrency(summary.totalRevenue || 0)}
                </p>
              </div>
              <div className="p-3 bg-indigo-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12 px-6">
            <p className="text-red-500 font-semibold mb-2">Failed to load marketers report</p>
            <p className="text-sm text-gray-600 mb-4">
              {error && 'status' in error && error.status === 401
                ? 'Authentication failed. Please check if you have the "manage_marketing" permission.'
                : error && 'data' in error && typeof error.data === 'object' && error.data && 'message' in error.data
                ? String(error.data.message)
                : 'An error occurred while fetching marketers report.'}
            </p>
            <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded border border-gray-200 font-mono">
              {error && 'status' in error ? `Status: ${error.status}` : 'Unknown error'}
            </div>
          </div>
        ) : filteredMarketers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Users className="w-12 h-12 text-gray-300 mb-3" />
            <p className="text-gray-500">No marketers found for the selected period</p>
            {selectedMarketerId && (
              <button
                onClick={() => setSelectedMarketerId('')}
                className="mt-2 text-sm text-green-600 hover:underline"
              >
                Clear filter
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Marketer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Signups
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Orders
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Revenue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Commission
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredMarketers.map((marketer) => (
                  <tr key={marketer.marketerId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">
                        {marketer.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-mono font-semibold bg-blue-100 text-blue-800 rounded">
                        {marketer.code}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {marketer.signups}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {marketer.orders}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(marketer.revenue)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(marketer.commission)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => navigate(`/admin/marketers/${marketer.marketerId}`)}
                        className="text-green-600 hover:text-green-800 font-medium"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Modal */}
      <CreateMarketerModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          // Optionally refetch or show success message
          setShowCreateModal(false);
        }}
      />
    </div>
  );
}
