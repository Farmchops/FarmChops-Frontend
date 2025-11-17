// src/pages/GroupDetail.tsx
import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft, Users, Package, Clock, Share2,
  MapPin, Phone, CheckCircle, AlertCircle, Truck
} from "lucide-react";
import { resolveErrorMessage } from "@/lib/utils";
import { useGetGroupByIdQuery, useJoinGroupMutation } from "@/redux/api/groupOrdersApi";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";

const GroupDetail = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  const [showJoinModal, setShowJoinModal] = useState(false);
  const [deliveryInfo, setDeliveryInfo] = useState({
    address: user?.profile?.address || "",
    city: "",
    state: "",
    phoneNumber: user?.phone || "",
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [joinGroup] = useJoinGroupMutation();

  const { data, isLoading, error } = useGetGroupByIdQuery(groupId!, {
    skip: !groupId
  });

  const group = data?.group;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Group Not Found</h2>
          <p className="text-gray-600 mb-6">This group may have been cancelled or doesn't exist.</p>
          <Link
            to="/group-sharing"
            className="inline-flex items-center gap-2 bg-[#1D7B3C] text-white px-6 py-3 rounded-full hover:bg-[#166430]"
          >
            <ArrowLeft className="h-4 w-4" />
            Browse Active Groups
          </Link>
        </div>
      </div>
    );
  }

  const progress = (group.filledSlots / group.totalSlots) * 100;
  const slotsLeft = group.totalSlots - group.filledSlots;
  const isFull = group.filledSlots >= group.totalSlots;
  const isConfirmed = group.status === 'confirmed';
  const isCancelled = group.status === 'cancelled';
  const alreadyJoined = group.participants?.some(p => p.userId === user?._id) || false;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleShare = async () => {
    const shareData = {
      title: `Join my ${group.product.name} group!`,
      text: `I'm buying ${group.product.name} in a group. Join to get bulk prices!`,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // Fallback to copy
        navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="hidden sm:inline">Back</span>
            </button>
            <button
              onClick={handleShare}
              className="flex items-center gap-2 text-[#1D7B3C] hover:text-[#166430]"
            >
              <Share2 className="h-5 w-5" />
              <span className="hidden sm:inline">Share</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Product Info */}
            <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
              <div className="aspect-video bg-gray-100 relative">
                {group.product.images?.[0] ? (
                  <img
                    src={group.product.images[0]}
                    alt={group.product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="h-24 w-24 text-gray-300" />
                  </div>
                )}
                {isCancelled && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <div className="text-center text-white">
                      <AlertCircle className="h-16 w-16 mx-auto mb-2" />
                      <p className="text-xl font-semibold">Group Cancelled</p>
                    </div>
                  </div>
                )}
                {isConfirmed && (
                  <div className="absolute top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-full flex items-center gap-2 font-medium">
                    <CheckCircle className="h-5 w-5" />
                    Confirmed
                  </div>
                )}
              </div>

              <div className="p-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {group.product.name}
                </h1>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-[#1D7B3C]">
                      {formatCurrency(group.pricePerSlot)}
                    </span>
                    <span className="text-gray-600">per person</span>
                  </div>
                  <p className="text-lg text-gray-700 mt-1">
                    You get: {group.quantityPerSlot}{group.product.unit}
                  </p>
                </div>

                {/* Status Badges */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {!isFull && !isCancelled && (
                    <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                      <Clock className="h-4 w-4" />
                      {slotsLeft} {slotsLeft === 1 ? 'slot' : 'slots'} left
                    </span>
                  )}
                  {isFull && !isConfirmed && (
                    <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                      <CheckCircle className="h-4 w-4" />
                      Full - Processing
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    <Users className="h-4 w-4" />
                    {group.filledSlots}/{group.totalSlots} members
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="mb-6">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="font-medium text-gray-700">Group Progress</span>
                    <span className="font-bold text-gray-900">{Math.round(progress)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-[#1D7B3C] h-3 rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Delivery Timeline */}
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Truck className="h-5 w-5 text-blue-600" />
                    When will I get my delivery?
                  </h3>
                  <div className="space-y-2 text-sm text-gray-700">
                    <div className="flex items-start gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                        1
                      </div>
                      <p>
                        <strong>After you join:</strong> Your payment is held securely. Your slot is reserved.
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                        2
                      </div>
                      <p>
                        <strong>Group fills up:</strong> When {group.totalSlots}/{group.totalSlots} people join, the group auto-confirms.
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                        3
                      </div>
                      <p>
                        <strong>Processing starts:</strong> Your individual order is created and enters our fulfillment workflow.
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                        ✓
                      </div>
                      <p>
                        <strong>Delivery:</strong> Expect delivery 3-5 business days after group confirms.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Participants */}
            <div className="bg-white rounded-3xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Users className="h-6 w-6" />
                Participants ({group.participants?.length || group.filledSlots || 0})
              </h2>
              {!group.participants || group.participants.length === 0 ? (
                <p className="text-gray-600 text-center py-8">No participants yet. Be the first!</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {group.participants.map((participant, index) => (
                    <div
                      key={participant.id}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl"
                    >
                      <div className="w-10 h-10 rounded-full bg-[#1D7B3C] text-white flex items-center justify-center font-semibold">
                        {participant.user.firstName?.[0] || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {participant.user.firstName} {participant.user.lastName?.[0]}.
                        </p>
                        <p className="text-sm text-gray-600">
                          {participant.quantity}{group.product.unit}
                        </p>
                      </div>
                      {index === 0 && (
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-medium">
                          Creator
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Join CTA */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-sm p-6 sticky top-24">
              <h3 className="font-semibold text-gray-900 mb-4">Join This Group</h3>

              {isCancelled ? (
                <div className="text-center py-6">
                  <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
                  <p className="text-gray-600 mb-4">This group has been cancelled</p>
                  {group.cancelledReason && (
                    <p className="text-sm text-gray-500 mb-4">Reason: {group.cancelledReason}</p>
                  )}
                  <Link
                    to="/group-sharing"
                    className="inline-block w-full bg-gray-100 text-gray-700 font-medium py-3 px-4 rounded-full hover:bg-gray-200"
                  >
                    Browse Other Groups
                  </Link>
                </div>
              ) : isConfirmed ? (
                <div className="text-center py-6">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                  <p className="text-gray-600 mb-4">This group is now confirmed and processing orders</p>
                  <Link
                    to="/group-sharing"
                    className="inline-block w-full bg-gray-100 text-gray-700 font-medium py-3 px-4 rounded-full hover:bg-gray-200"
                  >
                    Browse Other Groups
                  </Link>
                </div>
              ) : alreadyJoined ? (
                <div className="text-center py-6">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                  <p className="text-gray-600 mb-4">You're already in this group!</p>
                  <Link
                    to="/profile/groups"
                    className="inline-block w-full bg-[#1D7B3C] text-white font-medium py-3 px-4 rounded-full hover:bg-[#166430]"
                  >
                    View My Groups
                  </Link>
                </div>
              ) : isFull ? (
                <div className="text-center py-6">
                  <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-3" />
                  <p className="text-gray-600 mb-4">This group is now full</p>
                  <Link
                    to="/group-sharing"
                    className="inline-block w-full bg-gray-100 text-gray-700 font-medium py-3 px-4 rounded-full hover:bg-gray-200"
                  >
                    Browse Other Groups
                  </Link>
                </div>
              ) : (
                <>
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-between py-2 border-b">
                      <span className="text-gray-600">Your share:</span>
                      <span className="font-semibold">{formatCurrency(group.pricePerSlot)}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b">
                      <span className="text-gray-600">Quantity:</span>
                      <span className="font-semibold">{group.quantityPerSlot}{group.product.unit}</span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-gray-600">Delivery fee:</span>
                      <span className="font-semibold text-sm text-gray-500">Calculated at checkout</span>
                    </div>
                  </div>

                  {isAuthenticated ? (
                    <button
                      onClick={() => setShowJoinModal(true)}
                      className="w-full bg-[#1D7B3C] hover:bg-[#166430] text-white font-medium py-4 px-4 rounded-full transition-colors mb-3"
                    >
                      Join for {formatCurrency(group.pricePerSlot)} →
                    </button>
                  ) : (
                    <Link
                      to={`/login?redirect=/group/${groupId}`}
                      className="block w-full bg-[#1D7B3C] hover:bg-[#166430] text-white font-medium py-4 px-4 rounded-full transition-colors mb-3 text-center"
                    >
                      Login to Join
                    </Link>
                  )}

                  <div className="space-y-2 text-xs text-gray-500">
                    <p className="flex items-start gap-1">
                      <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>Secure payment via Paystack</span>
                    </p>
                    <p className="flex items-start gap-1">
                      <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>Full refund if group doesn't fill or is cancelled</span>
                    </p>
                    <p className="flex items-start gap-1">
                      <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>Delivery to your address</span>
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Join Modal */}
      {showJoinModal && group && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-semibold text-gray-900">Join Group</h3>
              <button
                type="button"
                onClick={() => {
                  setShowJoinModal(false);
                  setDeliveryInfo({
                    address: user?.profile?.address || "",
                    city: "",
                    state: "",
                    phoneNumber: user?.phone || "",
                  });
                }}
                disabled={isProcessing}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="text-2xl">×</span>
              </button>
            </div>

            {/* Product Summary */}
            <div className="bg-gray-50 rounded-2xl p-4 mb-6">
              <div className="flex items-center gap-3 mb-3">
                <img
                  src={group.product.images?.[0] || ''}
                  alt={group.product.name}
                  className="w-16 h-16 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{group.product.name}</h4>
                  <p className="text-sm text-gray-600">
                    {group.quantityPerSlot}{group.product.unit}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                <span className="text-gray-600">Your share:</span>
                <span className="text-2xl font-bold text-[#1D7B3C]">
                  {formatCurrency(group.pricePerSlot)}
                </span>
              </div>
            </div>

            {/* Delivery Information Form */}
            <div className="space-y-4 mb-6">
              <div>
                <label htmlFor="join-phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <div className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg bg-white">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <input
                    id="join-phone"
                    type="tel"
                    value={deliveryInfo.phoneNumber}
                    onChange={(e) => setDeliveryInfo({ ...deliveryInfo, phoneNumber: e.target.value })}
                    placeholder="08012345678"
                    className="flex-1 outline-none text-sm"
                    required
                    disabled={isProcessing}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="join-address" className="block text-sm font-medium text-gray-700 mb-2">
                  Street Address *
                </label>
                <div className="flex items-start gap-2 px-4 py-3 border border-gray-300 rounded-lg bg-white">
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <input
                    id="join-address"
                    type="text"
                    value={deliveryInfo.address}
                    onChange={(e) => setDeliveryInfo({ ...deliveryInfo, address: e.target.value })}
                    placeholder="123 Main Street, Ikeja"
                    className="flex-1 outline-none text-sm"
                    required
                    disabled={isProcessing}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="join-city" className="block text-sm font-medium text-gray-700 mb-2">
                    City *
                  </label>
                  <input
                    id="join-city"
                    type="text"
                    value={deliveryInfo.city}
                    onChange={(e) => setDeliveryInfo({ ...deliveryInfo, city: e.target.value })}
                    placeholder="Lagos"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none text-sm"
                    required
                    disabled={isProcessing}
                  />
                </div>

                <div>
                  <label htmlFor="join-state" className="block text-sm font-medium text-gray-700 mb-2">
                    State *
                  </label>
                  <input
                    id="join-state"
                    type="text"
                    value={deliveryInfo.state}
                    onChange={(e) => setDeliveryInfo({ ...deliveryInfo, state: e.target.value })}
                    placeholder="Lagos"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none text-sm"
                    required
                    disabled={isProcessing}
                  />
                </div>
              </div>
            </div>

            {/* Important Note */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <h4 className="font-semibold text-sm text-gray-900 mb-2">
                What happens after payment?
              </h4>
              <ul className="space-y-1 text-xs text-gray-700">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span>Your payment is held securely until the group fills</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span>You'll be notified when the group is confirmed</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span>Delivery starts 3-5 days after group confirms</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span>Full refund if group is cancelled</span>
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={async () => {
                  // Validation
                  if (!deliveryInfo.phoneNumber.trim() || !deliveryInfo.address.trim() ||
                      !deliveryInfo.city.trim() || !deliveryInfo.state.trim()) {
                    alert('Please fill in all required fields');
                    return;
                  }

                  setIsProcessing(true);

                  try {
                    const requestData = {
                      deliveryInfo: {
                        address: deliveryInfo.address,
                        city: deliveryInfo.city,
                        state: deliveryInfo.state,
                        phoneNumber: deliveryInfo.phoneNumber,
                      }
                    };

                    console.log('Sending join request:', JSON.stringify(requestData, null, 2));
                    console.log('Group ID:', group.groupId);
                    console.log('Full URL:', `/group-orders/${group.groupId}/join`);

                    const response = await joinGroup({
                      groupId: group.groupId,
                      data: requestData
                    }).unwrap();

                    console.log('Join response:', JSON.stringify(response, null, 2));

                    if (response.success && response.payment?.authorizationUrl) {
                      // Redirect to Paystack
                      window.location.href = response.payment.authorizationUrl;
                    } else {
                      throw new Error('Payment initialization failed');
                    }
                  } catch (err: unknown) {
                    console.error('Full error object:', err);
                    console.error('Error details:', JSON.stringify(err, null, 2));
                    const errorMessage = resolveErrorMessage(err) || 'Failed to join group. Please try again.';
                    alert(errorMessage);
                    setIsProcessing(false);
                  }
                }}
                disabled={isProcessing}
                className="w-full bg-[#1D7B3C] hover:bg-[#166430] text-white font-semibold py-4 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                    Processing...
                  </span>
                ) : (
                  `Pay ${formatCurrency(group.pricePerSlot)} with Paystack`
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowJoinModal(false);
                  setDeliveryInfo({
                    address: user?.profile?.address || "",
                    city: "",
                    state: "",
                    phoneNumber: user?.phone || "",
                  });
                }}
                disabled={isProcessing}
                className="w-full bg-gray-100 text-gray-700 font-medium py-3 rounded-full hover:bg-gray-200 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>

            {/* Payment Security Badge */}
            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Secure payment powered by Paystack</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupDetail;
