/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/OrderHistory.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
	Package,
	Clock,
	CheckCircle,
	XCircle,
	Truck,
	Calendar,
	MapPin,
	CreditCard,
	Search,
	Filter,
} from "lucide-react";
import { useGetOrderHistoryQuery } from "@/redux/api/orderApi";
import type { OrderStatus, PaymentStatus } from "@/types/orders";

const OrderHistory = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data, isLoading, error } = useGetOrderHistoryQuery({
    page: currentPage,
    limit: 10,
  });


  const orders = data?.data?.orders || [];
  const pagination = data?.data?.pagination;

  console.log(orders)

  // Get status badge styling
  const getStatusBadge = (status: OrderStatus) => {
  const statusStyles: Record<OrderStatus, { bg: string; text: string; icon: typeof Clock }> = {
    pending: { bg: "bg-yellow-100", text: "text-yellow-800", icon: Clock },
    ready_for_processing: { bg: "bg-yellow-100", text: "text-yellow-800", icon: Clock },
    processing: { bg: "bg-blue-100", text: "text-blue-800", icon: Package },
    packed: { bg: "bg-blue-100", text: "text-blue-800", icon: Package },
    ready_for_dispatch: { bg: "bg-purple-100", text: "text-purple-800", icon: Truck },
    awaiting_pickup: { bg: "bg-purple-100", text: "text-purple-800", icon: Truck },
    en_route: { bg: "bg-purple-100", text: "text-purple-800", icon: Truck },
    delivered: { bg: "bg-green-100", text: "text-[#1D7B3C]", icon: CheckCircle },
    completed: { bg: "bg-green-100", text: "text-[#1D7B3C]", icon: CheckCircle },
    cancelled: { bg: "bg-red-100", text: "text-red-800", icon: XCircle },
    failed_delivery: { bg: "bg-red-100", text: "text-red-800", icon: XCircle },
  };

  const config = statusStyles[status] ?? statusStyles.pending;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      <Icon size={14} />
      {status
        .split("_")
        .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
        .join(" ")}
    </span>
  );
  };

  // Get payment status badge
  const getPaymentBadge = (status: PaymentStatus) => {
    const statusConfig = {
      pending: { bg: "bg-gray-100", text: "text-gray-800" },
      paid: { bg: "bg-green-100", text: "text-[#1D7B3C]" },
      failed: { bg: "bg-red-100", text: "text-red-800" },
      refunded: { bg: "bg-orange-100", text: "text-orange-800" },
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${config.bg} ${config.text}`}>
        <CreditCard size={12} />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    const matchesStatus = statusFilter === "all" || order.orderStatus === statusFilter;
    const matchesSearch =
      searchQuery === "" ||
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.items.some(item =>
        item.productName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    return matchesStatus && matchesSearch;
  });

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <XCircle className="mx-auto mb-4 text-red-500" size={48} />
            <h3 className="text-lg font-semibold text-red-900 mb-2">
              Failed to Load Orders
            </h3>
            <p className="text-red-700 mb-4">
              {(error as any)?.data?.message || "Something went wrong"}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-10">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8">Order History</h1>

          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Package className="mx-auto mb-4 text-gray-400" size={64} />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Orders Yet
            </h3>
            <p className="text-gray-600 mb-6">
              Start shopping to see your orders here
            </p>
            <button
              onClick={() => navigate("/products")}
              className="px-6 py-3 bg-[#1D7B3C] text-white rounded-lg hover:bg-green-700"
            >
              Browse Products
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order History</h1>
          <p className="text-gray-600">
            Track and manage your orders
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by order number or product..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-3 text-gray-400" size={20} />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as OrderStatus | "all")}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 appearance-none"
              >
                <option value="all">All Orders</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
                    {filteredOrders.map((order) => (
            <div
              key={order._id}
              className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                {/* Order Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {order.orderNumber}
                      </h3>
                      {getStatusBadge(order.orderStatus)}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {formatDate(order.createdAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Package size={14} />
                        {order.totalItems} {order.totalItems === 1 ? "item" : "items"}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-2xl font-bold text-[#1D7B3C]">
                      ₦{order.summary.totalAmountInNaira.toLocaleString()}
                    </p>
                    {getPaymentBadge(order.paymentStatus)}
                  </div>
                </div>



                {/* Order Items Preview */}
                <div className="border-t pt-4 mb-4">
                                    <div className="space-y-2">
                                        {order.items.slice(0, 2).map((item, index) => {
                      const productObj = item.product && typeof item.product === 'object' ? (item.product as any) : null;
                                            const imgSrc = Array.isArray(productObj?.images) && productObj.images.length > 0
                        ? productObj.images[0]
                        : 'https://via.placeholder.com/48';

                      const displayName = (productObj?.name || item.productName || 'Product');
                      return (
                        <div key={index} className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded bg-gray-100 overflow-hidden flex items-center justify-center">
                            {imgSrc ? (
                              <img src={imgSrc} alt={displayName} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-xs text-gray-500">No image</span>
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 text-sm">
                              {displayName}
                            </p>
                            <p className="text-xs text-gray-600">
                              Qty: {item.quantity} × ₦{(item.unitPrice / 100).toLocaleString()}
                            </p>
                          </div>
                          <p className="font-medium text-gray-900">
                            ₦{(item.totalPrice / 100).toLocaleString()}
                          </p>
                        </div>
                      );
                    })}

                                        {order.items.length > 2 && (
                      <p className="text-sm text-gray-500 pl-15">
                        +{order.items.length - 2} more {order.items.length - 2 === 1 ? "item" : "items"}
                      </p>
                    )}

                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="border-t pt-4 space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal:</span>
                    <span>₦{(order.subtotal / 100).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Delivery Fee:</span>
                    <span>₦{(order.deliveryFee / 100).toLocaleString()}</span>
                  </div>
                  {order.tax && (
                    <div className="flex justify-between text-gray-600">
                      <span>Tax (7.5%):</span>
                      <span>₦{(order.tax / 100).toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-semibold text-[#1D7B3C] pt-2 border-t">
                    <span>Total:</span>
                    <span>₦{(order.totalAmount / 100).toLocaleString()}</span>
                  </div>
                </div>

                {/* Delivery Info */}
                                <div className="flex items-start justify-between border-t pt-4">
                  <div className="flex items-start gap-2 text-sm text-gray-600">
                    <MapPin size={16} className="mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">Delivery Address</p>
                      <p>{order.deliveryInfo.address}</p>
                      <p>{order.deliveryInfo.city}</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredOrders.length === 0 && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Search className="mx-auto mb-4 text-gray-400" size={48} />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Orders Found
            </h3>
            <p className="text-gray-600">
              Try adjusting your filters or search query
            </p>
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            <div className="flex items-center gap-2">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-10 h-10 rounded-lg ${page === currentPage
                    ? "bg-[#1D7B3C] text-white"
                    : "border hover:bg-gray-50"
                    }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === pagination.totalPages}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}

        {/* Summary Stats */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">
              {orders.length}
            </p>
            <p className="text-sm text-gray-600">Total Orders</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <p className="text-2xl font-bold text-[#1D7B3C]">
              {orders.filter(o => o.orderStatus === "delivered").length}
            </p>
            <p className="text-sm text-gray-600">Delivered</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">
              {orders.filter(o => o.orderStatus === "processing").length}
            </p>
            <p className="text-sm text-gray-600">Processing</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <p className="text-2xl font-bold text-yellow-600">
              {orders.filter(o => o.orderStatus === "pending").length}
            </p>
            <p className="text-sm text-gray-600">Pending</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderHistory;