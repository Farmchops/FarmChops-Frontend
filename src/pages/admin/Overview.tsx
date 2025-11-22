// src/pages/admin/Overview.tsx
import React, { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { ArrowUpRight, ArrowDownRight, ChevronDown, Loader2 } from "lucide-react";
import {
  useGetTotalOrdersQuery,
  useGetConversionRateQuery,
  useGetOrderTrendQuery,
  useGetUsersTrendQuery,
  useGetRecentOrdersQuery,
  type RecentOrder,
} from "@/redux/api/adminDashboardApi";

type DateFilterPreset = "today" | "this_week" | "this_month" | "last_30_days" | "this_year" | "all_time";

interface DateRange {
  startDate?: string;
  endDate?: string;
}

const getDateRange = (preset: DateFilterPreset): DateRange => {
  const today = new Date();
  const formatDate = (d: Date) => d.toISOString().split("T")[0];

  switch (preset) {
    case "today":
      return { startDate: formatDate(today), endDate: formatDate(today) };
    case "this_week": {
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      return { startDate: formatDate(startOfWeek), endDate: formatDate(today) };
    }
    case "this_month": {
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      return { startDate: formatDate(startOfMonth), endDate: formatDate(today) };
    }
    case "last_30_days": {
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(today.getDate() - 30);
      return { startDate: formatDate(thirtyDaysAgo), endDate: formatDate(today) };
    }
    case "this_year": {
      const startOfYear = new Date(today.getFullYear(), 0, 1);
      return { startDate: formatDate(startOfYear), endDate: formatDate(today) };
    }
    case "all_time":
    default:
      return {};
  }
};

const formatMonth = (monthString: string): string => {
  const [year, month] = monthString.split("-");
  return new Date(parseInt(year), parseInt(month) - 1).toLocaleString("default", { month: "short" });
};

const formatCurrency = (amount: number): string => {
  return `₦${amount.toLocaleString()}`;
};

const DATE_FILTER_OPTIONS: { value: DateFilterPreset; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "this_week", label: "This Week" },
  { value: "this_month", label: "This Month" },
  { value: "last_30_days", label: "Last 30 Days" },
  { value: "this_year", label: "This Year" },
  { value: "all_time", label: "All Time" },
];

const Overview: React.FC = () => {
  const [dateFilter, setDateFilter] = useState<DateFilterPreset>("all_time");
  const [showDateDropdown, setShowDateDropdown] = useState(false);

  const dateRange = useMemo(() => getDateRange(dateFilter), [dateFilter]);

  // API Queries - also capture errors for debugging
  const { data: totalOrdersRes, isLoading: loadingOrders, error: ordersError } = useGetTotalOrdersQuery(dateRange);
  const { data: conversionRes, isLoading: loadingConversion, error: conversionError } = useGetConversionRateQuery(dateRange);
  const { data: orderTrendRes, isLoading: loadingOrderTrend, error: orderTrendError } = useGetOrderTrendQuery(dateRange);
  const { data: usersTrendRes, isLoading: loadingUsersTrend, error: usersTrendError } = useGetUsersTrendQuery(dateRange);
  const { data: recentOrdersRes, isLoading: loadingRecentOrders, error: recentOrdersError } = useGetRecentOrdersQuery({ ...dateRange, limit: 5 });

  // Log errors for debugging (can be removed in production)
  if (ordersError) console.error('Orders API Error:', ordersError);
  if (conversionError) console.error('Conversion API Error:', conversionError);
  if (orderTrendError) console.error('Order Trend API Error:', orderTrendError);
  if (usersTrendError) console.error('Users Trend API Error:', usersTrendError);
  if (recentOrdersError) console.error('Recent Orders API Error:', recentOrdersError);

  // Extract data - handle nested API response structure
  const totalOrdersData = totalOrdersRes?.data;
  const conversionData = conversionRes?.data;
  const orderTrendData = orderTrendRes?.data ?? [];
  const usersTrendData = usersTrendRes?.data ?? [];

  // Recent orders might be nested: { success: true, data: [...] } or just [...]
  const rawRecentOrders = recentOrdersRes?.data;
  const recentOrdersData = Array.isArray(rawRecentOrders)
    ? rawRecentOrders
    : (rawRecentOrders as { data?: RecentOrder[] } | undefined)?.data ?? [];

  // Stats cards data - show "Error" on API failure, "0" as default when data exists but value is missing
  const stats = [
    {
      title: "Total Orders",
      value: ordersError ? "Error" : (totalOrdersData?.totalOrders?.toLocaleString() ?? (loadingOrders ? "—" : "0")),
      change: "+20%",
      isPositive: true,
      loading: loadingOrders,
      hasError: !!ordersError,
    },
    {
      title: "Conversion Rate",
      value: conversionError ? "Error" : (conversionData ? `${Math.round(conversionData.conversionRate)}%` : (loadingConversion ? "—" : "0%")),
      change: "+20%",
      isPositive: true,
      loading: loadingConversion,
      hasError: !!conversionError,
    },
    {
      title: "Total Users",
      value: conversionError ? "Error" : (conversionData?.totalUsers?.toLocaleString() ?? (loadingConversion ? "—" : "0")),
      change: "+20%",
      isPositive: true,
      loading: loadingConversion,
      hasError: !!conversionError,
    },
  ];

  // Order status pie chart data
  const orderStatusData = useMemo(() => {
    const byOrderStatus = totalOrdersData?.byOrderStatus as Record<string, number | { count?: number; percentage?: number; revenue?: number }> | undefined;
    const totalOrders = totalOrdersData?.totalOrders ?? 0;

    // Default structure when no data
    const defaultData = [
      { name: "Delivered", value: 0, count: 0, color: "#16a34a" },
      { name: "Pending", value: 0, count: 0, color: "#facc15" },
      { name: "Cancelled", value: 0, count: 0, color: "#dc2626" },
    ];

    if (!byOrderStatus || totalOrders === 0) return defaultData;

    // Handle different API response structures
    // Backend may return: { active: 90, completed: 1, cancelled: 1 } (counts)
    // Or: { delivered: { count, percentage, revenue }, pending: {...}, cancelled: {...} }

    const getStatusData = (key: string, altKey?: string) => {
      const val = byOrderStatus[key] ?? (altKey ? byOrderStatus[altKey] : undefined);
      if (typeof val === "number") {
        return { count: val, percentage: totalOrders > 0 ? (val / totalOrders) * 100 : 0 };
      }
      if (val && typeof val === "object") {
        return {
          count: val.count ?? 0,
          percentage: val.percentage ?? (totalOrders > 0 ? ((val.count ?? 0) / totalOrders) * 100 : 0)
        };
      }
      return { count: 0, percentage: 0 };
    };

    // Map backend keys to display names
    // Backend uses: completed/delivered, active/pending, cancelled
    const delivered = getStatusData("completed", "delivered");
    const pending = getStatusData("active", "pending");
    const cancelled = getStatusData("cancelled");

    return [
      {
        name: "Delivered",
        value: delivered.percentage,
        count: delivered.count,
        color: "#16a34a"
      },
      {
        name: "Pending",
        value: pending.percentage,
        count: pending.count,
        color: "#facc15"
      },
      {
        name: "Cancelled",
        value: cancelled.percentage,
        count: cancelled.count,
        color: "#dc2626"
      },
    ];
  }, [totalOrdersData]);

  // Check if pie chart has any data to display
  const hasOrderStatusData = orderStatusData.some(item => item.value > 0);

  // Order trend chart data
  const orderTrendChartData = useMemo(() => {
    return orderTrendData.map((item) => ({
      name: formatMonth(item.month),
      value: item.orderCount,
    }));
  }, [orderTrendData]);

  // Users trend chart data
  const usersTrendChartData = useMemo(() => {
    return usersTrendData.map((item) => ({
      name: formatMonth(item.month),
      value: item.userCount,
    }));
  }, [usersTrendData]);

  const currentFilterLabel = DATE_FILTER_OPTIONS.find((opt) => opt.value === dateFilter)?.label ?? "All Time";

  return (
    <div className="p-2 md:p-6 mt-4 space-y-6 w-full min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-semibold">Overview</h1>

        {/* Date Filter Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowDateDropdown(!showDateDropdown)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition"
          >
            <span className="text-sm text-gray-700">{currentFilterLabel}</span>
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </button>

          {showDateDropdown && (
            <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
              {DATE_FILTER_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setDateFilter(option.value);
                    setShowDateDropdown(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition ${
                    dateFilter === option.value ? "bg-gray-100 text-green-600 font-medium" : "text-gray-700"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((item, idx) => (
          <Card key={idx} className="shadow rounded-2xl">
            <CardContent className="p-4 flex flex-col">
              <span className="text-gray-500 text-sm">{item.title}</span>
              <div className="flex items-center justify-between mt-2">
                {item.loading ? (
                  <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                ) : (
                  <span className="text-2xl font-semibold">{item.value}</span>
                )}
                <span className={`flex items-center text-sm ${item.isPositive ? "text-green-500" : "text-red-500"}`}>
                  {item.change}
                  {item.isPositive ? (
                    <ArrowUpRight className="w-4 h-4 ml-1" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 ml-1" />
                  )}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts & Order Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Order Trend */}
        <Card className="lg:col-span-2 shadow rounded-2xl">
          <CardContent className="p-4">
            <div className="mb-4">
              <h2 className="font-semibold">Order Trend overtime</h2>
            </div>
            {loadingOrderTrend ? (
              <div className="flex items-center justify-center h-[250px]">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
              </div>
            ) : orderTrendChartData.length > 0 ? (
              <div className="w-full min-w-0 h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={orderTrendChartData}>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <Tooltip
                      formatter={(value: number) => [value, "Orders"]}
                      contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb" }}
                    />
                    <Bar dataKey="value" fill="#f97316" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[250px] text-gray-400">
                No data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Order Status Pie Chart */}
        <Card className="shadow rounded-2xl">
          <CardContent className="p-4">
            <div className="mb-4">
              <h2 className="font-semibold">Order Status</h2>
            </div>
            {loadingOrders ? (
              <div className="flex items-center justify-center h-[220px]">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
              </div>
            ) : (
              <>
                <div className="w-full min-w-0 h-[180px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      {hasOrderStatusData ? (
                        <Pie
                          data={orderStatusData}
                          dataKey="value"
                          nameKey="name"
                          innerRadius={50}
                          outerRadius={70}
                          paddingAngle={3}
                        >
                          {orderStatusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      ) : (
                        <Pie
                          data={[{ name: "No Data", value: 100 }]}
                          dataKey="value"
                          innerRadius={50}
                          outerRadius={70}
                        >
                          <Cell fill="#e5e7eb" />
                        </Pie>
                      )}
                      {hasOrderStatusData && (
                        <Tooltip
                          formatter={(value: number, name: string) => [`${value.toFixed(1)}%`, name]}
                          contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb" }}
                        />
                      )}
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2 mt-2">
                  {orderStatusData.map((s, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="flex items-center">
                        <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: s.color }} />
                        {s.name}
                      </span>
                      <span className="flex items-center gap-3">
                        <span className="text-gray-500">{s.count} orders</span>
                        <span className="font-medium">{s.value.toFixed(1)}%</span>
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Users & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Users Trend */}
        <Card className="shadow rounded-2xl">
          <CardContent className="p-4">
            <div className="mb-4">
              <h2 className="font-semibold">Users</h2>
            </div>
            {loadingUsersTrend ? (
              <div className="flex items-center justify-center h-[200px]">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
              </div>
            ) : usersTrendChartData.length > 0 ? (
              <div className="w-full min-w-0 h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={usersTrendChartData}>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <Tooltip
                      formatter={(value: number) => [value, "Users"]}
                      contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb" }}
                    />
                    <Line type="monotone" dataKey="value" stroke="#f97316" strokeWidth={3} dot={true} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[200px] text-gray-400">
                No data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card className="shadow rounded-2xl">
          <CardContent className="p-4">
            <div className="mb-4">
              <h2 className="font-semibold">Recent Orders</h2>
            </div>
            {loadingRecentOrders ? (
              <div className="flex items-center justify-center h-[150px]">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
              </div>
            ) : recentOrdersData.length > 0 ? (
              <div className="space-y-3">
                <div className="flex justify-between text-sm text-gray-500 font-medium pb-2 border-b">
                  <span>Order Name & ID</span>
                  <span>Amount</span>
                </div>
                <ul className="space-y-3 text-sm">
                  {recentOrdersData.map((order, idx) => {
                    // Generate order number from orderId if not provided
                    const displayOrderNumber = order.orderNumber || `#${order.orderId?.slice(-6).toUpperCase() || idx + 1}`;
                    const displayName = order.customerName || "Customer";

                    return (
                      <li key={order.orderId || idx} className="flex justify-between items-center">
                        <div>
                          <div className="font-medium text-gray-900">{displayName}</div>
                          <div className="text-gray-500 text-xs">{displayOrderNumber}</div>
                        </div>
                        <span className="font-medium text-green-600">{formatCurrency(order.amount)}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[150px] text-gray-400">
                No recent orders
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Overview;
