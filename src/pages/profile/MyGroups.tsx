// src/pages/profile/MyGroups.tsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { Users, Package, Clock, CheckCircle, XCircle, ArrowRight } from "lucide-react";
import { useGetMyGroupsQuery, useLeaveGroupMutation } from "@/redux/api/groupOrdersApi";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import type { MyGroupOrder } from "@/types/groupOrder";

const MyGroups = () => {
  const [statusFilter, setStatusFilter] = useState<string>("");
  const { data, isLoading } = useGetMyGroupsQuery({
    status: statusFilter || undefined
  });

  const groups = data?.groups || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Groups</h1>
          <p className="text-gray-600 mt-1">Track your group buying orders</p>
        </div>
        <Link
          to="/group-sharing"
          className="hidden sm:flex items-center gap-2 bg-[#1D7B3C] text-white px-4 py-2 rounded-full hover:bg-[#166430] transition-colors text-sm font-medium"
        >
          <Users className="h-4 w-4" />
          Browse Groups
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-gray-200 overflow-x-auto">
        {[
          { label: "All", value: "" },
          { label: "Active", value: "active" },
          { label: "Confirmed", value: "confirmed" },
          { label: "Cancelled", value: "cancelled" },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
              statusFilter === tab.value
                ? "border-[#1D7B3C] text-[#1D7B3C]"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      ) : groups.length === 0 ? (
        <div className="bg-white rounded-3xl shadow-sm p-12 text-center">
          <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">No Groups Yet</h3>
          <p className="text-gray-600 mb-6">
            You haven't joined any groups yet.
          </p>
          <Link
            to="/group-sharing"
            className="inline-flex items-center gap-2 bg-[#1D7B3C] text-white px-6 py-3 rounded-full hover:bg-[#166430]"
          >
            <Users className="h-5 w-5" />
            Browse Active Groups
          </Link>
        </div>
      ) : groups.length === 0 ? (
        <div className="bg-white rounded-3xl shadow-sm p-12 text-center">
          <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            {statusFilter ? `No ${statusFilter} groups` : "No groups yet"}
          </h3>
          <p className="text-gray-600 mb-6">
            Join a group to start buying at bulk prices!
          </p>
          <Link
            to="/group-sharing"
            className="inline-flex items-center gap-2 bg-[#1D7B3C] text-white px-6 py-3 rounded-full hover:bg-[#166430]"
          >
            <Users className="h-5 w-5" />
            Browse Active Groups
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {groups.map((group) => (
            <GroupCard key={group._id} group={group} />
          ))}
        </div>
      )}
    </div>
  );
};

// Group Card Component
const GroupCard = ({ group }: { group: MyGroupOrder }) => {
  const [leaveGroup, { isLoading: isLeaving }] = useLeaveGroupMutation();
  const progress = (group.filledSlots / group.totalSlots) * 100;
  const slotsLeft = group.totalSlots - group.filledSlots;

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
    });
  };

  const handleLeaveGroup = async () => {
    if (group.status !== 'active') {
      alert('You can only leave active groups');
      return;
    }

    if (!confirm('Are you sure you want to leave this group? You will receive a full refund.')) {
      return;
    }

    try {
      await leaveGroup(group.groupId).unwrap();
      alert('Successfully left the group. Your refund is being processed.');
    } catch (err: any) {
      console.error('Leave group failed:', err);
      const errorMessage = err?.data?.message || err?.message || 'Failed to leave group. Please try again.';
      alert(errorMessage);
    }
  };

  const getStatusBadge = () => {
    switch (group.status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
            <Clock className="h-3.5 w-3.5" />
            Active
          </span>
        );
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
            <CheckCircle className="h-3.5 w-3.5" />
            Confirmed
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-medium">
            <XCircle className="h-3.5 w-3.5" />
            Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* Product Image */}
          <div className="w-20 h-20 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
            {group.product.images?.[0] ? (
              <img
                src={group.product.images[0]}
                alt={group.product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="h-8 w-8 text-gray-300" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  {group.product.name}
                </h3>
                {getStatusBadge()}
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-[#1D7B3C]">
                  {formatCurrency(group.amountPaid)}
                </p>
                <p className="text-xs text-gray-500">
                  {group.quantity}{group.product.unit}
                </p>
              </div>
            </div>

            {/* Progress Bar (only for active groups) */}
            {group.status === 'active' && (
              <div className="mb-3">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-gray-600">
                    {group.filledSlots}/{group.totalSlots} members
                  </span>
                  <span className="font-medium text-gray-900">{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    className="bg-[#1D7B3C] h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {slotsLeft} {slotsLeft === 1 ? 'slot' : 'slots'} remaining
                </p>
              </div>
            )}

            {/* Order Info */}
            {group.orderId && (
              <div className="mb-3 p-3 bg-green-50 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Individual Order Created</p>
                <Link
                  to={`/orders/${group.orderId}`}
                  className="text-sm font-medium text-[#1D7B3C] hover:text-[#166430] flex items-center gap-1"
                >
                  Track Order <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            )}

            {/* Delivery Address */}
            <div className="text-xs text-gray-600 mb-3">
              <p className="font-medium text-gray-700 mb-0.5">Delivery to:</p>
              <p className="line-clamp-1">{group.deliveryAddress}</p>
            </div>

            {/* Actions & Dates */}
            <div className="flex items-center justify-between gap-3 pt-3 border-t border-gray-100">
              <span className="text-xs text-gray-500">
                Joined {formatDate(group.joinedAt)}
              </span>
              <div className="flex items-center gap-2">
                {group.status === 'active' && (
                  <button
                    type="button"
                    onClick={handleLeaveGroup}
                    disabled={isLeaving}
                    className="text-xs text-red-600 hover:text-red-700 font-medium disabled:opacity-50"
                  >
                    {isLeaving ? 'Leaving...' : 'Leave Group'}
                  </button>
                )}
                <Link
                  to={`/group/${group.groupId}`}
                  className="text-xs text-[#1D7B3C] hover:text-[#166430] font-medium flex items-center gap-1"
                >
                  View Details <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyGroups;
