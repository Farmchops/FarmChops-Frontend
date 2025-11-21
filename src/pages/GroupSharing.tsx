// src/pages/GroupSharing.tsx
import { Link } from "react-router-dom";
import { Users, Clock, Package, Sparkles, Timer } from "lucide-react";
import { useGetActiveGroupsQuery } from "@/redux/api/groupOrdersApi";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import type { GroupOrder } from "@/types/groupOrder";

const GroupSharing = () => {
  const { data, isLoading, error } = useGetActiveGroupsQuery({});

  const groups = data?.groups || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#1D7B3C] to-[#166430] text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Users className="h-10 w-10" />
              <h1 className="text-4xl font-bold">Group Sharing</h1>
            </div>
            <p className="text-xl text-green-100 max-w-2xl mx-auto">
              Buy together, save more! Join active groups or create your own to get bulk prices without buying bulk quantities.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* How It Works */}
        <div className="bg-white rounded-3xl shadow-sm p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-[#1D7B3C]/10 text-[#1D7B3C] flex items-center justify-center mx-auto mb-3 text-xl font-bold">
                1
              </div>
              <h3 className="font-medium text-gray-900 mb-1">Reserve Your Spot</h3>
              <p className="text-sm text-gray-600">Pick quantity and reserve (no payment yet!)</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-[#1D7B3C]/10 text-[#1D7B3C] flex items-center justify-center mx-auto mb-3 text-xl font-bold">
                2
              </div>
              <h3 className="font-medium text-gray-900 mb-1">Group Fills Up</h3>
              <p className="text-sm text-gray-600">Wait for others to join (no time limit!)</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-[#1D7B3C]/10 text-[#1D7B3C] flex items-center justify-center mx-auto mb-3 text-xl font-bold">
                3
              </div>
              <h3 className="font-medium text-gray-900 mb-1">Checkout & Pay</h3>
              <p className="text-sm text-gray-600">48hr window opens when group is ready</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-[#1D7B3C]/10 text-[#1D7B3C] flex items-center justify-center mx-auto mb-3 text-xl font-bold">
                4
              </div>
              <h3 className="font-medium text-gray-900 mb-1">Get Delivery</h3>
              <p className="text-sm text-gray-600">Receive your share at your doorstep</p>
            </div>
          </div>
        </div>

        {/* Active Groups */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-gray-900">Active Groups</h2>
          <Link
            to="/profile/groups"
            className="text-[#1D7B3C] hover:text-[#166430] font-medium text-sm"
          >
            My Groups →
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : error ? (
          <div className="bg-white rounded-3xl shadow-sm p-12 text-center">
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No Active Groups</h3>
            <p className="text-gray-600 mb-2">
              There are no active groups at the moment.
            </p>
            <p className="text-sm text-gray-500">
              Check back soon or contact support if this seems wrong!
            </p>
          </div>
        ) : groups.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-sm p-12 text-center">
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No Active Groups</h3>
            <p className="text-gray-600 mb-6">
              There are no active groups at the moment. Check back soon!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group) => (
              <GroupCard key={group._id} group={group} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Group Card Component
const GroupCard = ({ group }: { group: GroupOrder }) => {
  const totalFilled = group.reservedSlots + group.paidSlots;
  const progress = (totalFilled / group.maxParticipants) * 100;
  const spotsLeft = group.spotsLeft ?? (group.maxParticipants - totalFilled);
  const isCheckoutWindow = group.phase === 'checkout_window';
  const isFilling = group.phase === 'filling';

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

  return (
    <Link
      to={`/group/${group.groupId}`}
      className="bg-white rounded-3xl shadow-sm hover:shadow-md transition-shadow overflow-hidden group"
    >
      {/* Product Image */}
      <div className="aspect-video bg-gray-100 relative overflow-hidden">
        {group.product.images?.[0] ? (
          <img
            src={group.product.images[0]}
            alt={group.product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="h-16 w-16 text-gray-300" />
          </div>
        )}
        {spotsLeft <= 3 && spotsLeft > 0 && (
          <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            Only {spotsLeft} left!
          </div>
        )}
        {isCheckoutWindow && (
          <div className="absolute top-3 left-3 bg-yellow-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
            <Timer className="h-3 w-3" />
            Checkout Open
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-1">
          {group.product.name}
        </h3>

        {/* Price */}
        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#1D7B3C]">
              {formatCurrency(group.bulkPricePerUnit)}
            </span>
            <span className="text-sm text-gray-500">per {group.product.unit || 'unit'}</span>
          </div>
          {group.quantityPerPerson && (
            <p className="text-sm text-gray-600">
              {group.quantityPerPerson.min}-{group.quantityPerPerson.max} {group.product.unit || 'kg'} per person
            </p>
          )}
        </div>

        {/* Progress */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-600">
              {totalFilled}/{group.maxParticipants} members
            </span>
            <span className="font-medium text-gray-900">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="flex h-2 rounded-full overflow-hidden">
              <div
                className="bg-green-600 transition-all duration-300"
                style={{ width: `${(group.paidSlots / group.maxParticipants) * 100}%` }}
              />
              <div
                className="bg-yellow-400 transition-all duration-300"
                style={{ width: `${(group.reservedSlots / group.maxParticipants) * 100}%` }}
              />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {group.paidSlots} paid • {group.reservedSlots} reserved
          </p>
        </div>

        {/* Participants Preview */}
        {group.participants && group.participants.length > 0 && (
          <div className="flex items-center gap-2 mb-4">
            <div className="flex -space-x-2">
              {group.participants.slice(0, 3).map((participant) => (
                <div
                  key={participant.id}
                  className="w-8 h-8 rounded-full bg-[#1D7B3C] text-white flex items-center justify-center text-xs font-medium border-2 border-white"
                >
                  {participant.user.firstName?.[0] || '?'}
                </div>
              ))}
            </div>
            <span className="text-xs text-gray-600">
              {group.participants.length > 3
                ? `+${group.participants.length - 3} more`
                : `${group.participants.length} joined`}
            </span>
          </div>
        )}

        {/* CTA Button */}
        <button type="button" className="w-full bg-[#1D7B3C] hover:bg-[#166430] text-white font-medium py-3 px-4 rounded-full transition-colors">
          {isFilling ? 'Reserve Spot (Free)' : isCheckoutWindow ? 'Checkout Now' : 'View Group'} →
        </button>

        {/* Status Badge */}
        <div className="mt-3 flex items-center justify-center gap-1 text-xs text-gray-500">
          {isFilling ? (
            <>
              <Clock className="h-3.5 w-3.5" />
              <span>Filling - {spotsLeft} spots left</span>
            </>
          ) : isCheckoutWindow ? (
            <>
              <Timer className="h-3.5 w-3.5 text-yellow-600" />
              <span className="text-yellow-600">Checkout window open</span>
            </>
          ) : (
            <>
              <Clock className="h-3.5 w-3.5 text-green-600" />
              <span className="text-green-600">Group confirmed</span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
};

export default GroupSharing;
