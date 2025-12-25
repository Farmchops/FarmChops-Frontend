import React from 'react';
import { Tag, Gift, X } from 'lucide-react';
import type { OrderDiscountResponse } from '../types/marketing';

interface DiscountDisplayProps {
  discountData: OrderDiscountResponse | null;
  onRemoveCoupon?: () => void;
}

export const DiscountDisplay: React.FC<DiscountDisplayProps> = ({
  discountData,
  onRemoveCoupon
}) => {
  if (!discountData || discountData.availableDiscounts.length === 0) {
    return null;
  }

  const formatCurrency = (amountInKobo: number) => {
    return `₦${(amountInKobo / 100).toLocaleString()}`;
  };

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
      <div className="flex items-center gap-2 text-green-800 font-medium">
        <Gift className="w-5 h-5" />
        <span>Discounts Applied</span>
      </div>

      {/* Show all available discounts */}
      <div className="space-y-2">
        {discountData.availableDiscounts.map((discount: {
          type: string;
          code?: string;
          description: string;
          amount: number;
          applied: boolean;
        }, index: number) => (
          <div
            key={index}
            className={`flex items-start justify-between text-sm ${
              discount.applied
                ? 'text-green-700 font-medium'
                : 'text-gray-500 line-through'
            }`}
          >
            <div className="flex items-start gap-2 flex-1">
              <Tag className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                discount.applied ? 'text-green-600' : 'text-gray-400'
              }`} />
              <div>
                <p>{discount.description}</p>
                {discount.code && (
                  <p className="text-xs text-gray-600 mt-0.5">
                    Code: {discount.code}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">
                -{formatCurrency(discount.amount)}
              </span>
              {discount.applied && discount.code && onRemoveCoupon && (
                <button
                  onClick={onRemoveCoupon}
                  className="p-1 hover:bg-red-100 rounded transition-colors"
                  title="Remove coupon"
                >
                  <X className="w-4 h-4 text-red-600" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Best discount message */}
      {discountData.bestDiscount && (
        <div className="pt-3 border-t border-green-300">
          <div className="flex items-center justify-between font-semibold text-green-800">
            <span>You're saving:</span>
            <span className="text-lg">
              {formatCurrency(discountData.totalDiscount)}
            </span>
          </div>
          {discountData.availableDiscounts.length > 1 && (
            <p className="text-xs text-green-700 mt-1">
              We automatically applied the best discount for you
            </p>
          )}
        </div>
      )}
    </div>
  );
};
