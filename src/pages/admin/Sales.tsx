import { useState, useMemo } from "react";
import {
  useGetDashboardSummaryQuery,
  useGetConversionRateQuery,
  useGetRevenueTrendQuery,
  useGetPaymentMethodsQuery,
  useGetAverageOrderValueQuery,
  useGetTopProductsQuery,
} from "@/redux/api/adminDashboardApi";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from "recharts";

// Date filter options
const DATE_FILTERS = [
  { label: "Today", value: "today" },
  { label: "This Week", value: "week" },
  { label: "This Month", value: "month" },
  { label: "This Year", value: "year" },
  { label: "All Time", value: "all" },
] as const;

type DateFilterValue = (typeof DATE_FILTERS)[number]["value"];

function getDateRange(filter: DateFilterValue): {
  startDate?: string;
  endDate?: string;
} {
  const now = new Date();
  const endDate = now.toISOString().split("T")[0];

  switch (filter) {
    case "today": {
      return { startDate: endDate, endDate };
    }
    case "week": {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      return { startDate: startOfWeek.toISOString().split("T")[0], endDate };
    }
    case "month": {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      return { startDate: startOfMonth.toISOString().split("T")[0], endDate };
    }
    case "year": {
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      return { startDate: startOfYear.toISOString().split("T")[0], endDate };
    }
    case "all":
    default:
      return {};
  }
}

// Colors for pie chart
const PAYMENT_COLORS = ["#22c55e", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"];

const Sales = () => {
  const [dateFilter, setDateFilter] = useState<DateFilterValue>("all");
  const dateRange = useMemo(() => getDateRange(dateFilter), [dateFilter]);

  // API Queries
  const { data: summaryData, isLoading: summaryLoading } =
    useGetDashboardSummaryQuery(dateRange);
  const { data: conversionData, isLoading: conversionLoading } =
    useGetConversionRateQuery(dateRange);
  const { data: revenueTrendData, isLoading: revenueTrendLoading } =
    useGetRevenueTrendQuery(dateRange);
  const { data: paymentMethodsData, isLoading: paymentMethodsLoading } =
    useGetPaymentMethodsQuery(dateRange);
  const { data: aovData, isLoading: aovLoading } =
    useGetAverageOrderValueQuery(dateRange);
  const { data: topProductsData, isLoading: topProductsLoading } =
    useGetTopProductsQuery({ ...dateRange, limit: 5 });

  // Extract data
  const totalRevenue = summaryData?.data?.totalRevenue ?? 0;
  const totalSales = summaryData?.data?.totalOrders ?? 0;
  const conversionRate = conversionData?.data?.conversionRate ?? 0;

  // Revenue Trend data
  const revenueTrendChartData = useMemo(() => {
    const data = revenueTrendData?.data;
    if (!data || !Array.isArray(data)) return [];
    return data.map((item) => ({
      month: item.month,
      revenue: item.revenue,
    }));
  }, [revenueTrendData]);

  // Payment Methods data for pie chart
  const paymentMethodsChartData = useMemo(() => {
    const breakdown = paymentMethodsData?.data?.breakdown;
    if (!breakdown || !Array.isArray(breakdown)) return [];
    return breakdown.map((item) => ({
      name: item.method,
      value: item.percentage,
      count: item.count,
      amount: item.totalAmount,
    }));
  }, [paymentMethodsData]);

  // Average Order Value data - API returns { overall: {...}, trend: [...] }
  const aovChartData = useMemo(() => {
    const rawData = aovData?.data;
    // Handle nested structure: data.trend[] contains the monthly data
    const trend = (rawData as { trend?: { month: string; averageOrderValue: number }[] })?.trend;
    if (!trend || !Array.isArray(trend)) return [];
    return trend.map((item) => ({
      month: item.month,
      aov: item.averageOrderValue,
    }));
  }, [aovData]);

  // Top Products data - API returns data directly as array, not nested in products
  const topProducts = useMemo(() => {
    const rawData = topProductsData?.data;
    // Handle both structures: array directly or nested in products
    if (Array.isArray(rawData)) {
      return rawData.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        unitsSold: item.totalQuantity ?? item.unitsSold ?? 0,
        revenue: item.totalRevenue ?? item.revenue ?? 0,
      }));
    }
    const products = (rawData as { products?: { productId: string; productName: string; totalQuantity?: number; unitsSold?: number; totalRevenue?: number; revenue?: number }[] })?.products;
    if (!products || !Array.isArray(products)) return [];
    return products.map((item) => ({
      productId: item.productId,
      productName: item.productName,
      unitsSold: item.totalQuantity ?? item.unitsSold ?? 0,
      revenue: item.totalRevenue ?? item.revenue ?? 0,
    }));
  }, [topProductsData]);

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const isAnyLoading =
    summaryLoading ||
    conversionLoading ||
    revenueTrendLoading ||
    paymentMethodsLoading ||
    aovLoading ||
    topProductsLoading;

  return (
    <div className="p-2 md:p-6 mt-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-3xl font-semibold">Sales</h1>
        <select
          className="border border-gray-300 rounded-lg px-4 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value as DateFilterValue)}
        >
          {DATE_FILTERS.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Revenue */}
        <div className="bg-white rounded-2xl shadow p-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-green-100 text-green-600 rounded-full p-2">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </span>
            <span className="text-gray-500 font-medium">Total Revenue</span>
          </div>
          {summaryLoading ? (
            <div className="h-8 bg-gray-200 rounded animate-pulse w-32" />
          ) : (
            <div className="text-3xl font-bold text-gray-900">
              {formatCurrency(totalRevenue)}
            </div>
          )}
        </div>

        {/* Total Sales */}
        <div className="bg-white rounded-2xl shadow p-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-blue-100 text-blue-600 rounded-full p-2">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
            </span>
            <span className="text-gray-500 font-medium">Total Sales</span>
          </div>
          {summaryLoading ? (
            <div className="h-8 bg-gray-200 rounded animate-pulse w-24" />
          ) : (
            <div className="text-3xl font-bold text-gray-900">{totalSales}</div>
          )}
        </div>

        {/* Conversion Rate */}
        <div className="bg-white rounded-2xl shadow p-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-amber-100 text-amber-600 rounded-full p-2">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
            </span>
            <span className="text-gray-500 font-medium">Conversion Rate</span>
          </div>
          {conversionLoading ? (
            <div className="h-8 bg-gray-200 rounded animate-pulse w-20" />
          ) : (
            <div className="text-3xl font-bold text-gray-900">
              {conversionRate.toFixed(1)}%
            </div>
          )}
        </div>
      </div>

      {/* Charts Row 1: Revenue Trend + Payment Methods */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend Chart */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Revenue Trend
          </h2>
          {revenueTrendLoading ? (
            <div className="h-64 bg-gray-100 rounded animate-pulse" />
          ) : revenueTrendChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={revenueTrendChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" tick={{ fill: "#6b7280", fontSize: 12 }} />
                <YAxis
                  tick={{ fill: "#6b7280", fontSize: 12 }}
                  tickFormatter={(value) =>
                    value >= 1000000
                      ? `${(value / 1000000).toFixed(1)}M`
                      : value >= 1000
                      ? `${(value / 1000).toFixed(0)}K`
                      : value
                  }
                />
                <Tooltip
                  formatter={(value: number) => [formatCurrency(value), "Revenue"]}
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="revenue" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400">
              No revenue data available
            </div>
          )}
        </div>

        {/* Payment Methods Breakdown */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Payment Methods Breakdown
          </h2>
          {paymentMethodsLoading ? (
            <div className="h-64 bg-gray-100 rounded animate-pulse" />
          ) : paymentMethodsChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={paymentMethodsChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {paymentMethodsChartData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={PAYMENT_COLORS[index % PAYMENT_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number, _name: string, props: { payload?: { name: string; count: number; amount: number } }) => [
                    `${value.toFixed(1)}% (${props.payload?.count ?? 0} transactions)`,
                    props.payload?.name ?? "",
                  ]}
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value) => (
                    <span className="text-gray-600 text-sm">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400">
              No payment data available
            </div>
          )}
        </div>
      </div>

      {/* Charts Row 2: Average Order Value */}
      <div className="bg-white rounded-2xl shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Average Order Value
        </h2>
        {aovLoading ? (
          <div className="h-64 bg-gray-100 rounded animate-pulse" />
        ) : aovChartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={aovChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" tick={{ fill: "#6b7280", fontSize: 12 }} />
              <YAxis
                tick={{ fill: "#6b7280", fontSize: 12 }}
                tickFormatter={(value) =>
                  value >= 1000 ? `${(value / 1000).toFixed(0)}K` : value
                }
              />
              <Tooltip
                formatter={(value: number) => [
                  formatCurrency(value),
                  "Avg Order Value",
                ]}
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
              />
              <Line
                type="monotone"
                dataKey="aov"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-64 flex items-center justify-center text-gray-400">
            No average order value data available
          </div>
        )}
      </div>

      {/* Top Products Table */}
      <div className="bg-white rounded-2xl shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Top Products by Revenue
        </h2>
        {topProductsLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-12 bg-gray-100 rounded animate-pulse"
              />
            ))}
          </div>
        ) : topProducts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-gray-500 font-medium text-sm">
                    #
                  </th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium text-sm">
                    Product Name
                  </th>
                  <th className="text-right py-3 px-4 text-gray-500 font-medium text-sm">
                    Units Sold
                  </th>
                  <th className="text-right py-3 px-4 text-gray-500 font-medium text-sm">
                    Revenue
                  </th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((product, index) => (
                  <tr
                    key={product.productId}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-3 px-4 text-gray-600">{index + 1}</td>
                    <td className="py-3 px-4 text-gray-900 font-medium">
                      {product.productName}
                    </td>
                    <td className="py-3 px-4 text-gray-600 text-right">
                      {product.unitsSold.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-gray-900 font-semibold text-right">
                      {formatCurrency(product.revenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="h-32 flex items-center justify-center text-gray-400">
            No product data available
          </div>
        )}
      </div>

      {/* Loading Overlay */}
      {isAnyLoading && (
        <div className="fixed bottom-4 right-4 bg-white shadow-lg rounded-lg px-4 py-2 flex items-center gap-2 text-sm text-gray-600">
          <svg
            className="animate-spin h-4 w-4 text-green-500"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Loading data...
        </div>
      )}
    </div>
  );
};

export default Sales;
