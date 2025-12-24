import { useState, useEffect } from 'react';
import { useCalculateDiscountsMutation } from '../redux/api/couponsApi';
import type { OrderDiscountResponse } from '../types/marketing';

export const useDiscountCalculation = (subtotal: number) => {
  const [couponCode, setCouponCode] = useState<string>('');
  const [discountData, setDiscountData] = useState<OrderDiscountResponse | null>(null);
  const [calculateDiscounts, { isLoading }] = useCalculateDiscountsMutation();

  // Calculate discounts when subtotal or coupon changes
  useEffect(() => {
    const fetchDiscounts = async () => {
      if (subtotal <= 0) {
        setDiscountData(null);
        return;
      }

      try {
        const result = await calculateDiscounts({
          subtotal,
          couponCode: couponCode.trim() || undefined,
        }).unwrap();

        if (result.success && result.data) {
          setDiscountData(result.data);
        }
      } catch (error) {
        console.error('Failed to calculate discounts:', error);
        setDiscountData(null);
      }
    };

    fetchDiscounts();
  }, [subtotal, couponCode, calculateDiscounts]);

  const applyCoupon = (code: string) => {
    setCouponCode(code.toUpperCase());
  };

  const removeCoupon = () => {
    setCouponCode('');
  };

  return {
    couponCode,
    applyCoupon,
    removeCoupon,
    discountData,
    isCalculating: isLoading,
    finalAmount: discountData?.finalSubtotal || subtotal,
    totalDiscount: discountData?.totalDiscount || 0,
  };
};
