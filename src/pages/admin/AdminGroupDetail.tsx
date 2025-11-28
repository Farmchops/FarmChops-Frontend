// src/pages/admin/AdminGroupDetail.tsx
import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Phone,
  MapPin,
  AlertTriangle,
  Calendar
} from "lucide-react";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { alertService } from "@/lib/alertService";
import { resolveErrorMessage } from "@/lib/utils";
import { useGetGroupByIdQuery, useCancelGroupMutation } from "@/redux/api/groupOrdersApi";

const AdminGroupDetail = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);

  const { data, isLoading } = useGetGroupByIdQuery(groupId || '', {
    skip: !groupId,
  });
  const [cancelGroup] = useCancelGroupMutation();

  const group = data?.group;

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
          await cancelGroup({
            groupId: groupId || '',
            data: { reason: cancelReason },
          }).unwrap();

          alertService.show({
            type: "success",
            title: "Group Cancelled",
            message: "Group has been cancelled and refunds are being processed",
          });
          setShowCancelModal(false);
          setCancelReason("");
          navigate("/admin/group-orders");
        } catch (error: unknown) {
          alertService.show({
            type: "error",
            title: "Cancellation Failed",
            message: resolveErrorMessage(error) || "Failed to cancel group",
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

  const groupData = group;

  const totalFilled = groupData.reservedSlots + groupData.paidSlots;
  const progress = (totalFilled / groupData.maxParticipants) * 100;
  const totalRevenue = groupData.paidSlots * groupData.bulkPricePerUnit;
  const spotsLeft = groupData.maxParticipants - totalFilled;

  const getStatusBadge = () => {
    switch (groupData.phase) {
      case 'filling':
        return (
          <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium">
            <Clock className="h-4 w-4" />
            Filling
          </span>
        );
      case 'checkout_window':
        return (
          <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full text-sm font-medium">
            <Clock className="h-4 w-4" />
            Checkout Open
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
              Group ID: <span className="font-mono">{groupData.groupId}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {getStatusBadge()}
          {(groupData.phase === 'filling' || groupData.phase === 'checkout_window') && (
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Product Card */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">Product Information</h3>
          <div className="space-y-4">
            {groupData.product.images?.[0] && (
              <img
                src={groupData.product.images[0]}
                alt={groupData.product.name}
                className="w-full h-48 object-cover rounded-lg"
              />
            )}
            <div>
              <p className="text-2xl font-bold text-gray-900">{groupData.product.name}</p>
              <p className="text-sm text-gray-600 mt-2">
                Quantity per person: {groupData.quantityPerPerson?.min ?? 0}-{groupData.quantityPerPerson?.max ?? 0}{groupData.product.unit}
              </p>
              <p className="text-sm text-gray-600">
                Bulk price: {formatCurrency(groupData.bulkPricePerUnit)}/{groupData.product.unit}
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
                <span className="text-sm text-gray-600">Participants</span>
                <span className="text-2xl font-bold text-gray-900">
                  {totalFilled}/{groupData.maxParticipants}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="flex h-3 rounded-full overflow-hidden">
                  <div
                    className="bg-green-600 transition-all"
                    style={{ width: `${(groupData.paidSlots / groupData.maxParticipants) * 100}%` }}
                  />
                  <div
                    className="bg-yellow-400 transition-all"
                    style={{ width: `${(groupData.reservedSlots / groupData.maxParticipants) * 100}%` }}
                  />
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {groupData.paidSlots} paid • {groupData.reservedSlots} reserved • {Math.round(progress)}% complete
              </p>
            </div>

            {(groupData.phase === 'filling' || groupData.phase === 'checkout_window') && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm font-medium text-blue-900">
                  {spotsLeft} {spotsLeft === 1 ? 'spot' : 'spots'} remaining
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  {groupData.phase === 'filling' ? 'Group will open checkout when minimum reached' : 'Checkout window is open'}
                </p>
              </div>
            )}
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
              <p className="text-sm text-gray-600">{formatDate(groupData.createdAt)}</p>
            </div>
          </div>

          {groupData.confirmedAt && (
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Group Confirmed</p>
                <p className="text-sm text-gray-600">{formatDate(groupData.confirmedAt)}</p>
              </div>
            </div>
          )}

          {groupData.cancelledAt && (
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Group Cancelled</p>
                <p className="text-sm text-gray-600">{formatDate(groupData.cancelledAt)}</p>
                {groupData.cancelledReason && (
                  <p className="text-sm text-red-600 mt-1">Reason: {groupData.cancelledReason}</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Participants Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Participants ({groupData.participants?.length || 0})</h3>
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
              {groupData.participants?.map((participant) => (
                <tr key={participant.id} className="hover:bg-gray-50">
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
                      {participant.deliveryInfo?.phoneNumber || 'N/A'}
                    </div>
                  </td>
                  <td className="p-4">
                    {participant.deliveryInfo ? (
                      <div className="flex items-start gap-2 max-w-xs">
                        <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {participant.deliveryInfo.address}, {participant.deliveryInfo.city}, {participant.deliveryInfo.state}
                        </p>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">Not provided yet</span>
                    )}
                  </td>
                  <td className="p-4">
                    <span className="text-sm font-medium">
                      {participant.quantity}{groupData.product.unit}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="text-sm font-bold text-[#1D7B3C]">
                      {formatCurrency((participant.quantity * groupData.bulkPricePerUnit) / 100)}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      participant.status === 'paid'
                        ? 'bg-green-100 text-green-800'
                        : participant.status === 'reserved'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {participant.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="text-sm text-gray-600">
                      {formatDate(participant.reservedAt)}
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
                    This action will refund all {groupData.paidSlots} paid participants
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
                  <li>Issue refunds to all {groupData.paidSlots} paid participants</li>
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
