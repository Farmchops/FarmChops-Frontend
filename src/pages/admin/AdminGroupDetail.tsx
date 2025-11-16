// src/pages/admin/AdminGroupDetail.tsx
import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Users,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Mail,
  Phone,
  MapPin,
  AlertTriangle,
  Calendar
} from "lucide-react";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { alertService } from "@/lib/alertService";

// TODO: Replace with actual API types
interface AdminGroupOrderDetail {
  _id: string;
  groupId: string;
  product: {
    _id: string;
    name: string;
    images: string[];
    unit: string;
  };
  totalSlots: number;
  filledSlots: number;
  quantityPerSlot: number;
  pricePerSlot: number;
  status: 'active' | 'confirmed' | 'cancelled';
  participants: Array<{
    _id: string;
    userId: string;
    user: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
    };
    quantity: number;
    amountPaid: number;
    deliveryAddress: string;
    phoneNumber: string;
    paymentStatus: string;
    joinedAt: string;
    orderId?: string;
  }>;
  createdAt: string;
  confirmedAt?: string;
  cancelledAt?: string;
  cancelledReason?: string;
}

const AdminGroupDetail = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);

  // TODO: Replace with actual API call
  const isLoading = false;
  const group: AdminGroupOrderDetail | null = null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleCancelGroup = async () => {
    if (!cancelReason.trim()) {
      alertService.show({
        type: "error",
        title: "Validation Error",
        message: "Please provide a cancellation reason",
      });
      return;
    }

    alertService.show({
      type: "confirm",
      title: "Confirm Cancellation",
      message: "Are you sure you want to cancel this group? All participants will be refunded.",
      onConfirm: async () => {
        setIsCancelling(true);
        try {
          // TODO: Call cancel API
          await new Promise(resolve => setTimeout(resolve, 1000));

          alertService.show({
            type: "success",
            title: "Group Cancelled",
            message: "Group has been cancelled and refunds are being processed",
          });
          setShowCancelModal(false);
          navigate("/admin/group-orders");
        } catch (error: any) {
          alertService.show({
            type: "error",
            title: "Cancellation Failed",
            message: error?.data?.message || "Failed to cancel group",
          });
        } finally {
          setIsCancelling(false);
        }
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="py-6 mt-4">
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">Group Not Found</h3>
          <p className="text-gray-600 mb-6">
            The group order you're looking for doesn't exist or has been removed.
          </p>
          <Link
            to="/admin/group-orders"
            className="inline-flex items-center gap-2 text-[#1D7B3C] hover:text-[#166430] font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Group Orders
          </Link>
        </div>
      </div>
    );
  }

  const progress = (group.filledSlots / group.totalSlots) * 100;
  const totalRevenue = group.filledSlots * group.pricePerSlot;
  const slotsLeft = group.totalSlots - group.filledSlots;

  const getStatusBadge = () => {
    switch (group.status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium">
            <Clock className="h-4 w-4" />
            Active
          </span>
        );
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">
            <CheckCircle className="h-4 w-4" />
            Confirmed
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 bg-red-100 text-red-800 px-4 py-2 rounded-full text-sm font-medium">
            <XCircle className="h-4 w-4" />
            Cancelled
          </span>
        );
    }
  };

  return (
    <div className="py-6 mt-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate("/admin/group-orders")}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-3xl font-semibold">Group Order Details</h1>
            <p className="text-sm text-gray-700 mt-1">
              Group ID: <span className="font-mono">{group.groupId}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {getStatusBadge()}
          {group.status === 'active' && (
            <button
              type="button"
              onClick={() => setShowCancelModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <XCircle className="h-4 w-4" />
              Cancel Group
            </button>
          )}
        </div>
      </div>

      {/* Product & Progress Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product Card */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">Product Information</h3>
          <div className="space-y-4">
            {group.product.images?.[0] && (
              <img
                src={group.product.images[0]}
                alt={group.product.name}
                className="w-full h-48 object-cover rounded-lg"
              />
            )}
            <div>
              <p className="text-2xl font-bold text-gray-900">{group.product.name}</p>
              <p className="text-sm text-gray-600 mt-2">
                Quantity per slot: {group.quantityPerSlot}{group.product.unit}
              </p>
              <p className="text-sm text-gray-600">
                Price per slot: {formatCurrency(group.pricePerSlot)}
              </p>
            </div>
          </div>
        </div>

        {/* Progress Card */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">Group Progress</h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Filled Slots</span>
                <span className="text-2xl font-bold text-gray-900">
                  {group.filledSlots}/{group.totalSlots}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-[#1D7B3C] h-3 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {Math.round(progress)}% complete
              </p>
            </div>

            {group.status === 'active' && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm font-medium text-blue-900">
                  {slotsLeft} {slotsLeft === 1 ? 'slot' : 'slots'} remaining
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  Group will auto-confirm when full
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Revenue Card */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">Revenue Information</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">Current Revenue</p>
              <p className="text-3xl font-bold text-[#1D7B3C] mt-1">
                {formatCurrency(totalRevenue)}
              </p>
            </div>
            <div className="pt-4 border-t border-gray-200 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Participants</span>
                <span className="font-medium">{group.filledSlots}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Price/Slot</span>
                <span className="font-medium">{formatCurrency(group.pricePerSlot)}</span>
              </div>
              {group.status === 'active' && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Potential Revenue</span>
                  <span className="font-medium text-green-600">
                    {formatCurrency(group.totalSlots * group.pricePerSlot)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Timeline</h3>
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Calendar className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Group Created</p>
              <p className="text-sm text-gray-600">{formatDate(group.createdAt)}</p>
            </div>
          </div>

          {group.confirmedAt && (
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Group Confirmed</p>
                <p className="text-sm text-gray-600">{formatDate(group.confirmedAt)}</p>
              </div>
            </div>
          )}

          {group.cancelledAt && (
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Group Cancelled</p>
                <p className="text-sm text-gray-600">{formatDate(group.cancelledAt)}</p>
                {group.cancelledReason && (
                  <p className="text-sm text-red-600 mt-1">Reason: {group.cancelledReason}</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Participants Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Participants ({group.participants.length})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr className="text-left text-sm text-gray-600">
                <th className="p-4 font-medium">Participant</th>
                <th className="p-4 font-medium">Contact</th>
                <th className="p-4 font-medium">Delivery Address</th>
                <th className="p-4 font-medium">Quantity</th>
                <th className="p-4 font-medium">Amount Paid</th>
                <th className="p-4 font-medium">Payment Status</th>
                <th className="p-4 font-medium">Joined</th>
                <th className="p-4 font-medium">Order</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {group.participants.map((participant) => (
                <tr key={participant._id} className="hover:bg-gray-50">
                  <td className="p-4">
                    <div>
                      <p className="font-medium text-gray-900">
                        {participant.user.firstName} {participant.user.lastName}
                      </p>
                      <p className="text-sm text-gray-600">{participant.user.email}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="h-4 w-4" />
                      {participant.phoneNumber}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-start gap-2 max-w-xs">
                      <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {participant.deliveryAddress}
                      </p>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-sm font-medium">
                      {participant.quantity}{group.product.unit}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="text-sm font-bold text-[#1D7B3C]">
                      {formatCurrency(participant.amountPaid)}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      participant.paymentStatus === 'paid'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {participant.paymentStatus}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="text-sm text-gray-600">
                      {formatDate(participant.joinedAt)}
                    </span>
                  </td>
                  <td className="p-4">
                    {participant.orderId ? (
                      <Link
                        to={`/admin/orders/${participant.orderId}`}
                        className="text-sm text-[#1D7B3C] hover:text-[#166430] font-medium"
                      >
                        View Order
                      </Link>
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Cancel Group Order</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    This action will refund all {group.filledSlots} participants
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cancellation Reason *
                </label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  rows={4}
                  placeholder="Please provide a reason for cancelling this group order..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                />
              </div>

              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">
                  <strong>Warning:</strong> Cancelling this group will:
                </p>
                <ul className="text-sm text-red-700 mt-2 space-y-1 ml-4 list-disc">
                  <li>Issue refunds to all {group.filledSlots} participants</li>
                  <li>Send cancellation emails to all members</li>
                  <li>Mark the group as permanently cancelled</li>
                </ul>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => {
                  setShowCancelModal(false);
                  setCancelReason("");
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={isCancelling}
              >
                Keep Group Active
              </button>
              <button
                type="button"
                onClick={handleCancelGroup}
                disabled={isCancelling || !cancelReason.trim()}
                className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCancelling ? "Cancelling..." : "Cancel Group & Refund"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminGroupDetail;
