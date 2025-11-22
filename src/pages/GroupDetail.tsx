// src/pages/GroupDetail.tsx
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft, Users, Package, Clock, Share2,
  AlertCircle, CheckCircle, Truck, Timer
} from "lucide-react";
import { resolveErrorMessage } from "@/lib/utils";
import { alertService } from "@/lib/alertService";
import {
  useGetGroupByIdQuery,
  useReserveSlotMutation,
  useInitiateCheckoutMutation,
  useJoinWaitlistMutation,
  useLeaveGroupMutation
} from "@/redux/api/groupOrdersApi";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";

const GroupDetail = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  const [showReserveModal, setShowReserveModal] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [quantity, setQuantity] = useState(0);
  const [deliveryInfo, setDeliveryInfo] = useState({
    address: user?.profile?.address || "",
    city: "",
    state: "",
    phoneNumber: user?.phone || "",
  });
  const [deliveryFee] = useState(0); // Can be calculated based on location
  const [isProcessing, setIsProcessing] = useState(false);

  const { data, isLoading, error } = useGetGroupByIdQuery(groupId!, {
    skip: !groupId,
    pollingInterval: 30000, // Refresh every 30 seconds
  });

  const [reserveSlot] = useReserveSlotMutation();
  const [initiateCheckout] = useInitiateCheckoutMutation();
  const [joinWaitlist] = useJoinWaitlistMutation();
  const [leaveGroup] = useLeaveGroupMutation();

  const group = data?.group;

  // Initialize quantity to min when modal opens
  useEffect(() => {
    if (showReserveModal && group && group.quantityPerPerson) {
      setQuantity(group.quantityPerPerson.min);
    }
  }, [showReserveModal, group]);

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

  const totalFilled = group.reservedSlots + group.paidSlots;
  const progress = (totalFilled / group.maxParticipants) * 100;
  const spotsLeft = group.spotsLeft ?? (group.maxParticipants - totalFilled);
  const isFull = totalFilled >= group.maxParticipants;
  const isCancelled = group.phase === 'cancelled';
  const isConfirmed = group.phase === 'confirmed';
  const isCheckoutWindow = group.phase === 'checkout_window';
  const isFilling = group.phase === 'filling';

  const myParticipation = group.participants?.find(p => p.userId === user?._id);
  const hasReserved = myParticipation?.status === 'reserved';
  const hasPaid = myParticipation?.status === 'paid';
  const canCheckout = hasReserved && isCheckoutWindow;
  
  // Ensure participants is always an array to satisfy strict null checks
  const participants = group.participants ?? [];

  const formatCurrency = (amount: number) => {
    if (amount === undefined || amount === null || isNaN(amount)) {
      return '₦0';
    }
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount / 100); // Backend sends in kobo
  };

  const handleShare = async () => {
    const shareUrl = group.shareableLink || window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Join my ${group.product.name} group!`,
          text: `I'm buying ${group.product.name} in a group. Join to get bulk prices!`,
          url: shareUrl,
        });
      } catch {
        navigator.clipboard.writeText(shareUrl);
        alertService.show({
          type: 'success',
          title: 'Link Copied',
          message: 'Link copied to clipboard!',
        });
      }
    } else {
      navigator.clipboard.writeText(shareUrl);
      alertService.show({
        type: 'success',
        title: 'Link Copied',
        message: 'Link copied to clipboard!',
      });
    }
  };

  const handleReserve = async () => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=/group/${groupId}`);
      return;
    }

    if (group.quantityPerPerson && (quantity < group.quantityPerPerson.min || quantity > group.quantityPerPerson.max)) {
      alertService.show({
        type: 'error',
        title: 'Invalid Quantity',
        message: `Please select between ${group.quantityPerPerson.min} and ${group.quantityPerPerson.max} ${group.product.unit || 'units'}`,
      });
      return;
    }

    setIsProcessing(true);
    try {
      const response = await reserveSlot({
        groupId: group.groupId,
        data: { quantity },
      }).unwrap();

      alertService.show({
        type: 'success',
        title: 'Slot Reserved',
        message: response.message || 'Successfully reserved your slot in the group',
      });
      setShowReserveModal(false);

      // If checkout window opened, show notification
      if (response.data.checkoutWindow) {
        alertService.show({
          type: 'info',
          title: 'Checkout Window Open',
          message: `Great! The group is now ready. You have ${response.data.checkoutWindow.durationHours} hours to checkout.`,
        });
      }
    } catch (err) {
      const errorMessage = resolveErrorMessage(err) || 'Failed to reserve slot. Please try again.';
      alertService.show({
        type: 'error',
        title: 'Reservation Failed',
        message: errorMessage,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCheckout = async () => {
    if (!deliveryInfo.address.trim() || !deliveryInfo.city.trim() ||
        !deliveryInfo.state.trim() || !deliveryInfo.phoneNumber.trim()) {
      alertService.show({
        type: 'error',
        title: 'Missing Information',
        message: 'Please fill in all delivery information',
      });
      return;
    }

    setIsProcessing(true);
    try {
      const response = await initiateCheckout({
        groupId: group.groupId,
        data: {
          deliveryInfo: {
            address: deliveryInfo.address,
            city: deliveryInfo.city,
            state: deliveryInfo.state,
            phoneNumber: deliveryInfo.phoneNumber,
          },
          deliveryFee,
        },
      }).unwrap();

      // Redirect to Paystack
      if (response.data.payment.authorizationUrl) {
        window.location.href = response.data.payment.authorizationUrl;
      } else {
        throw new Error('Payment initialization failed');
      }
    } catch (err) {
      const errorMessage = resolveErrorMessage(err) || 'Failed to initiate checkout. Please try again.';
      alertService.show({
        type: 'error',
        title: 'Checkout Failed',
        message: errorMessage,
      });
      setIsProcessing(false);
    }
  };

  const handleLeave = async () => {
    alertService.show({
      type: 'confirm',
      title: 'Leave Group',
      message: 'Are you sure you want to leave this group?',
      onConfirm: async () => {
        try {
          await leaveGroup(group.groupId).unwrap();
          alertService.show({
            type: 'success',
            title: 'Left Group',
            message: 'Successfully left the group',
          });
          navigate('/group-sharing');
        } catch (err) {
          const errorMessage = resolveErrorMessage(err) || 'Failed to leave group';
          alertService.show({
            type: 'error',
            title: 'Failed to Leave',
            message: errorMessage,
          });
        }
      },
    });
  };

  const handleJoinWaitlist = async () => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=/group/${groupId}`);
      return;
    }

    setIsProcessing(true);
    try {
      const response = await joinWaitlist({
        groupId: group.groupId,
        data: { quantity: group.quantityPerPerson?.min ?? 1 },
      }).unwrap();

      alertService.show({
        type: 'success',
        title: 'Joined Waitlist',
        message: `You're #${response.data.group.waitlistPosition} on the waitlist!`,
      });
    } catch (err) {
      const errorMessage = resolveErrorMessage(err) || 'Failed to join waitlist';
      alertService.show({
        type: 'error',
        title: 'Waitlist Failed',
        message: errorMessage,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Calculate total price for selected quantity
  const calculateTotal = () => {
    const productTotal = quantity * group.bulkPricePerUnit;
    return productTotal + (deliveryFee * 100); // deliveryFee in naira, convert to kobo
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
              className="flex items-center gap-2 text-[#1D7B3C] hover:bg-[#166430] px-4 py-2 rounded-full bg-green-50"
            >
              <Share2 className="h-5 w-5" />
              <span className="hidden sm:inline">Share Group</span>
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
                {isCheckoutWindow && (
                  <div className="absolute top-4 right-4 bg-yellow-500 text-white px-4 py-2 rounded-full flex items-center gap-2 font-medium">
                    <Timer className="h-5 w-5" />
                    Checkout Open
                  </div>
                )}
              </div>

              <div className="p-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {group.product.name}
                </h1>

                {/* Bulk Price */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-[#1D7B3C]">
                      {formatCurrency(group.bulkPricePerUnit)}
                    </span>
                    <span className="text-gray-600">per {group.product.unit || 'unit'}</span>
                  </div>
                  {group.product.regularPrice && (
                    <p className="text-lg text-gray-500 line-through mt-1">
                      Regular: {formatCurrency(group.product.regularPrice)}
                    </p>
                  )}
                  <p className="text-sm text-gray-600 mt-2">
                    Min: {group.quantityPerPerson?.min ?? 0}{group.product.unit} • Max: {group.quantityPerPerson?.max ?? 0}{group.product.unit} per person
                  </p>
                </div>

                {/* Phase Badges */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {isFilling && !isFull && (
                    <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                      <Clock className="h-4 w-4" />
                      Filling - {spotsLeft} spots left
                    </span>
                  )}
                  {isCheckoutWindow && (
                    <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                      <Timer className="h-4 w-4" />
                      Checkout Window Open
                    </span>
                  )}
                  {isFull && !isConfirmed && (
                    <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                      <CheckCircle className="h-4 w-4" />
                      Full - Awaiting Payments
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
                    <Users className="h-4 w-4" />
                    {totalFilled}/{group.maxParticipants} members
                  </span>
                  <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                    {group.paidSlots} paid • {group.reservedSlots} reserved
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="mb-6">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="font-medium text-gray-700">Group Progress</span>
                    <span className="font-bold text-gray-900">{Math.round(progress)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className="flex h-3 rounded-full overflow-hidden">
                      <div
                        className="bg-green-600"
                        style={{ width: `${(group.paidSlots / group.maxParticipants) * 100}%` }}
                      />
                      <div
                        className="bg-yellow-400"
                        style={{ width: `${(group.reservedSlots / group.maxParticipants) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-600 mt-1">
                    <span>Green = Paid • Yellow = Reserved</span>
                  </div>
                </div>

                {/* Checkout Window Countdown */}
                {isCheckoutWindow && group.checkoutWindowClosesAt && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 mb-6">
                    <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <Timer className="h-5 w-5 text-yellow-600" />
                      Checkout Deadline
                    </h3>
                    <p className="text-sm text-gray-700">
                      {new Date(group.checkoutWindowClosesAt).toLocaleString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </p>
                    {hasReserved && !hasPaid && (
                      <p className="text-sm text-yellow-800 font-medium mt-2">
                        ⚠️ Complete checkout before deadline or lose your spot!
                      </p>
                    )}
                  </div>
                )}

                {/* Delivery Timeline */}
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Truck className="h-5 w-5 text-blue-600" />
                    How Group Buying Works
                  </h3>
                  <div className="space-y-2 text-sm text-gray-700">
                    <div className="flex items-start gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                        1
                      </div>
                      <p>
                        <strong>Reserve your spot:</strong> Select quantity ({group.quantityPerPerson?.min ?? 0}-{group.quantityPerPerson?.max ?? 0}{group.product.unit}) and reserve. No payment yet!
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                        2
                      </div>
                      <p>
                        <strong>Group fills:</strong> When {group.minParticipants} people join, checkout window opens for {group.checkoutWindowDurationHours} hours.
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                        3
                      </div>
                      <p>
                        <strong>Checkout:</strong> Enter delivery address and complete payment via Paystack.
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                        ✓
                      </div>
                      <p>
                        <strong>Delivery:</strong> Receive individual delivery to your address 3-5 days after group confirms.
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
                Participants ({participants.length || totalFilled})
              </h2>
              {participants.length === 0 ? (
                <p className="text-gray-600 text-center py-8">No participants yet. Be the first!</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {participants.map((participant, index) => (
                    <div
                      key={participant.id}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl"
                    >
                      <div className={`w-10 h-10 rounded-full ${participant.status === 'paid' ? 'bg-green-600' : 'bg-yellow-500'} text-white flex items-center justify-center font-semibold`}>
                        {participant.user.firstName?.[0] || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {participant.user.firstName} {participant.user.lastName?.[0]}.
                        </p>
                        <p className="text-sm text-gray-600">
                          {participant.quantity}{group.product.unit} •{' '}
                          <span className={participant.status === 'paid' ? 'text-green-600 font-medium' : 'text-yellow-600'}>
                            {participant.status}
                          </span>
                        </p>
                      </div>
                      {index === 0 && (
                        <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full font-medium">
                          First
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Waitlist */}
              {group.waitlist && group.waitlist.length > 0 && (
                <div className="mt-6 pt-6 border-t">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">
                    Waitlist ({group.waitlist.length})
                  </h3>
                  <div className="space-y-2">
                    {group.waitlist.map((person, index) => (
                      <div key={person.userId} className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="w-6 h-6 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center text-xs font-bold">
                          {index + 1}
                        </span>
                        <span>{person.user.firstName} {person.user.lastName?.[0]}.</span>
                        <span className="text-gray-400">• {person.quantity}{group.product.unit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - CTA */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-sm p-6 sticky top-24">
              <h3 className="font-semibold text-gray-900 mb-4">
                {hasReserved && !hasPaid ? 'Complete Checkout' : hasPaid ? 'You\'re In!' : 'Reserve Your Spot'}
              </h3>

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
                  <p className="text-gray-600 mb-4">This group is now confirmed</p>
                  <Link
                    to="/group-sharing"
                    className="inline-block w-full bg-gray-100 text-gray-700 font-medium py-3 px-4 rounded-full hover:bg-gray-200"
                  >
                    Browse Other Groups
                  </Link>
                </div>
              ) : hasPaid ? (
                <div className="text-center py-6">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                  <p className="text-gray-600 mb-4">Payment completed! Waiting for group to fill.</p>
                  <Link
                    to="/profile/groups"
                    className="inline-block w-full bg-[#1D7B3C] text-white font-medium py-3 px-4 rounded-full hover:bg-[#166430]"
                  >
                    View My Groups
                  </Link>
                </div>
              ) : canCheckout ? (
                <>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-4">
                    <p className="text-sm text-yellow-800 font-medium">
                      ⏰ Checkout now before your reservation expires!
                    </p>
                  </div>
                  <button
                    onClick={() => setShowCheckoutModal(true)}
                    className="w-full bg-[#1D7B3C] hover:bg-[#166430] text-white font-medium py-4 px-4 rounded-full transition-colors mb-3"
                  >
                    Checkout Now →
                  </button>
                  <button
                    onClick={handleLeave}
                    className="w-full bg-gray-100 text-gray-700 font-medium py-3 rounded-full hover:bg-gray-200"
                  >
                    Leave Group
                  </button>
                </>
              ) : hasReserved ? (
                <div className="text-center py-6">
                  <Clock className="h-12 w-12 text-yellow-500 mx-auto mb-3" />
                  <p className="text-gray-600 mb-4">
                    Spot reserved! Waiting for {group.minParticipants - totalFilled} more people to unlock checkout.
                  </p>
                  <button
                    onClick={handleLeave}
                    className="w-full bg-gray-100 text-gray-700 font-medium py-3 rounded-full hover:bg-gray-200"
                  >
                    Leave Group
                  </button>
                </div>
              ) : isFull ? (
                <div className="text-center py-6">
                  <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-3" />
                  <p className="text-gray-600 mb-4">This group is full</p>
                  <button
                    onClick={handleJoinWaitlist}
                    disabled={isProcessing}
                    className="w-full bg-yellow-500 text-white font-medium py-3 rounded-full hover:bg-yellow-600 disabled:opacity-50"
                  >
                    Join Waitlist
                  </button>
                </div>
              ) : (
                <>
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-between py-2 border-b">
                      <span className="text-gray-600">Bulk Price:</span>
                      <span className="font-semibold">{formatCurrency(group.bulkPricePerUnit)}/{group.product.unit}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b">
                      <span className="text-gray-600">Min per person:</span>
                      <span className="font-semibold">{group.quantityPerPerson?.min ?? 0}{group.product.unit}</span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-gray-600">Max per person:</span>
                      <span className="font-semibold">{group.quantityPerPerson?.max ?? 0}{group.product.unit}</span>
                    </div>
                  </div>

                  {isAuthenticated ? (
                    <button
                      onClick={() => setShowReserveModal(true)}
                      className="w-full bg-[#1D7B3C] hover:bg-[#166430] text-white font-medium py-4 px-4 rounded-full transition-colors mb-3"
                    >
                      Reserve Spot (No Payment) →
                    </button>
                  ) : (
                    <Link
                      to={`/login?redirect=/group/${groupId}`}
                      className="block w-full bg-[#1D7B3C] hover:bg-[#166430] text-white font-medium py-4 px-4 rounded-full transition-colors mb-3 text-center"
                    >
                      Login to Reserve
                    </Link>
                  )}

                  <div className="space-y-2 text-xs text-gray-500">
                    <p className="flex items-start gap-1">
                      <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>No payment required to reserve</span>
                    </p>
                    <p className="flex items-start gap-1">
                      <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>Pay only when group fills ({group.minParticipants} people)</span>
                    </p>
                    <p className="flex items-start gap-1">
                      <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>Individual delivery to your address</span>
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Reserve Modal */}
      {showReserveModal && group && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-semibold text-gray-900">Reserve Spot</h3>
              <button
                onClick={() => setShowReserveModal(false)}
                disabled={isProcessing}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="text-2xl">×</span>
              </button>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                How much do you want? ({group.quantityPerPerson?.min ?? 0}-{group.quantityPerPerson?.max ?? 0}{group.product.unit})
              </label>
              <input
                type="number"
                min={group.quantityPerPerson?.min ?? 0}
                max={group.quantityPerPerson?.max ?? 0}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg font-semibold"
                disabled={isProcessing}
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <h4 className="font-semibold text-sm text-gray-900 mb-2">
                What happens after reserving?
              </h4>
              <ul className="space-y-1 text-xs text-gray-700">
                <li>✓ Your spot is saved (no payment yet)</li>
                <li>✓ When {group.minParticipants} people join, you'll get {group.checkoutWindowDurationHours}h to checkout</li>
                <li>✓ You can leave anytime before paying</li>
              </ul>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleReserve}
                disabled={isProcessing}
                className="w-full bg-[#1D7B3C] hover:bg-[#166430] text-white font-semibold py-4 rounded-full disabled:opacity-50"
              >
                {isProcessing ? 'Reserving...' : `Reserve ${quantity}${group.product.unit} (Free)`}
              </button>
              <button
                onClick={() => setShowReserveModal(false)}
                disabled={isProcessing}
                className="w-full bg-gray-100 text-gray-700 font-medium py-3 rounded-full hover:bg-gray-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {showCheckoutModal && group && myParticipation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-semibold text-gray-900">Complete Checkout</h3>
              <button
                onClick={() => setShowCheckoutModal(false)}
                disabled={isProcessing}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="text-2xl">×</span>
              </button>
            </div>

            {/* Order Summary */}
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
                    {myParticipation.quantity}{group.product.unit} @ {formatCurrency(group.bulkPricePerUnit)}/{group.product.unit}
                  </p>
                </div>
              </div>
              <div className="space-y-2 pt-3 border-t border-gray-200">
                <div className="flex justify-between text-sm">
                  <span>Product Total:</span>
                  <span className="font-semibold">{formatCurrency(myParticipation.amount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Delivery Fee:</span>
                  <span className="font-semibold">{formatCurrency(deliveryFee * 100)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>Total:</span>
                  <span className="text-[#1D7B3C]">{formatCurrency(calculateTotal())}</span>
                </div>
              </div>
            </div>

            {/* Delivery Form */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={deliveryInfo.phoneNumber}
                  onChange={(e) => setDeliveryInfo({ ...deliveryInfo, phoneNumber: e.target.value })}
                  placeholder="08012345678"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  required
                  disabled={isProcessing}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Street Address *
                </label>
                <input
                  type="text"
                  value={deliveryInfo.address}
                  onChange={(e) => setDeliveryInfo({ ...deliveryInfo, address: e.target.value })}
                  placeholder="123 Main Street"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  required
                  disabled={isProcessing}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    value={deliveryInfo.city}
                    onChange={(e) => setDeliveryInfo({ ...deliveryInfo, city: e.target.value })}
                    placeholder="Lagos"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                    required
                    disabled={isProcessing}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State *
                  </label>
                  <input
                    type="text"
                    value={deliveryInfo.state}
                    onChange={(e) => setDeliveryInfo({ ...deliveryInfo, state: e.target.value })}
                    placeholder="Lagos"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                    required
                    disabled={isProcessing}
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleCheckout}
                disabled={isProcessing}
                className="w-full bg-[#1D7B3C] hover:bg-[#166430] text-white font-semibold py-4 rounded-full disabled:opacity-50"
              >
                {isProcessing ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                    Processing...
                  </span>
                ) : (
                  `Pay ${formatCurrency(calculateTotal())} with Paystack`
                )}
              </button>
              <button
                onClick={() => setShowCheckoutModal(false)}
                disabled={isProcessing}
                className="w-full bg-gray-100 text-gray-700 font-medium py-3 rounded-full hover:bg-gray-200"
              >
                Cancel
              </button>
            </div>

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
