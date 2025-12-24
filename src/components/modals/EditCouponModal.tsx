import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useUpdateCouponMutation } from '@/redux/api/couponsApi';
import type { Coupon, UpdateCouponPayload } from '@/types/marketing';

interface EditCouponModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  coupon: Coupon;
}

export const EditCouponModal: React.FC<EditCouponModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  coupon,
}) => {
  const [updateCoupon, { isLoading }] = useUpdateCouponMutation();

  const [formData, setFormData] = useState<UpdateCouponPayload>({
    description: coupon.description,
    discountType: coupon.discountType,
    discountValue: coupon.discountType === 'percentage'
      ? coupon.discountValue
      : coupon.discountValue / 100, // Convert kobo to naira for display
    maxDiscountAmount: coupon.maxDiscountAmount ? coupon.maxDiscountAmount / 100 : undefined,
    minOrderAmount: coupon.minOrderAmount ? coupon.minOrderAmount / 100 : undefined,
    maxUsesTotal: coupon.maxUsesTotal,
    maxUsesPerUser: coupon.maxUsesPerUser,
    validFrom: coupon.validFrom
      ? new Date(coupon.validFrom).toISOString().split('T')[0]
      : undefined,
    validUntil: coupon.validUntil
      ? new Date(coupon.validUntil).toISOString().split('T')[0]
      : undefined,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string>('');

  // Update form data when coupon changes
  useEffect(() => {
    if (coupon) {
      setFormData({
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountType === 'percentage'
          ? coupon.discountValue
          : coupon.discountValue / 100,
        maxDiscountAmount: coupon.maxDiscountAmount ? coupon.maxDiscountAmount / 100 : undefined,
        minOrderAmount: coupon.minOrderAmount ? coupon.minOrderAmount / 100 : undefined,
        maxUsesTotal: coupon.maxUsesTotal,
        maxUsesPerUser: coupon.maxUsesPerUser,
        validFrom: coupon.validFrom
          ? new Date(coupon.validFrom).toISOString().split('T')[0]
          : undefined,
        validUntil: coupon.validUntil
          ? new Date(coupon.validUntil).toISOString().split('T')[0]
          : undefined,
      });
    }
  }, [coupon]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.description?.trim()) {
      newErrors.description = 'Description is required';
    }

    if (formData.discountValue !== undefined) {
      if (formData.discountType === 'percentage') {
        if (formData.discountValue <= 0 || formData.discountValue > 100) {
          newErrors.discountValue = 'Percentage must be between 0 and 100';
        }
      } else if (formData.discountType === 'fixed_amount') {
        if (formData.discountValue <= 0) {
          newErrors.discountValue = 'Amount must be greater than 0';
        }
      }
    }

    if (formData.maxDiscountAmount !== undefined && formData.maxDiscountAmount <= 0) {
      newErrors.maxDiscountAmount = 'Max discount must be greater than 0';
    }

    if (formData.minOrderAmount !== undefined && formData.minOrderAmount < 0) {
      newErrors.minOrderAmount = 'Min order amount cannot be negative';
    }

    if (formData.maxUsesPerUser !== undefined && formData.maxUsesPerUser < 1) {
      newErrors.maxUsesPerUser = 'Max uses per user must be at least 1';
    }

    if (formData.maxUsesTotal !== undefined && formData.maxUsesTotal < 1) {
      newErrors.maxUsesTotal = 'Max total uses must be at least 1';
    }

    if (formData.validFrom && formData.validUntil) {
      const from = new Date(formData.validFrom);
      const until = new Date(formData.validUntil);
      if (from >= until) {
        newErrors.validUntil = 'End date must be after start date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');

    if (!validate()) return;

    try {
      // Convert Naira to Kobo for amounts
      const payload: UpdateCouponPayload = {
        ...formData,
        discountValue: formData.discountType === 'percentage'
          ? formData.discountValue
          : (formData.discountValue || 0) * 100, // Naira -> Kobo
        maxDiscountAmount: formData.maxDiscountAmount
          ? formData.maxDiscountAmount * 100
          : undefined,
        minOrderAmount: formData.minOrderAmount
          ? formData.minOrderAmount * 100
          : undefined,
      };

      const result = await updateCoupon({
        couponId: coupon._id,
        data: payload,
      }).unwrap();

      if (result.success) {
        onSuccess?.();
        handleClose();
      }
    } catch (error) {
      const err = error as { data?: { message?: string } };
      setServerError(err?.data?.message || 'Failed to update coupon');
    }
  };

  const handleClose = () => {
    setFormData({
      description: coupon.description,
      discountType: coupon.discountType,
      discountValue: coupon.discountType === 'percentage'
        ? coupon.discountValue
        : coupon.discountValue / 100,
      maxDiscountAmount: coupon.maxDiscountAmount ? coupon.maxDiscountAmount / 100 : undefined,
      minOrderAmount: coupon.minOrderAmount ? coupon.minOrderAmount / 100 : undefined,
      maxUsesTotal: coupon.maxUsesTotal,
      maxUsesPerUser: coupon.maxUsesPerUser,
      validFrom: coupon.validFrom
        ? new Date(coupon.validFrom).toISOString().split('T')[0]
        : undefined,
      validUntil: coupon.validUntil
        ? new Date(coupon.validUntil).toISOString().split('T')[0]
        : undefined,
    });
    setErrors({});
    setServerError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Edit Coupon</h2>
            <p className="text-sm text-gray-500 mt-1">
              Update coupon settings
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {serverError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{serverError}</p>
            </div>
          )}

          <div className="space-y-4">
            {/* Code - Read Only */}
            <div>
              <label htmlFor="edit-code" className="block text-sm font-medium text-gray-700 mb-1">
                Coupon Code
              </label>
              <input
                id="edit-code"
                type="text"
                value={coupon.code}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed font-mono uppercase"
              />
              <p className="mt-1 text-xs text-gray-500">
                Coupon code cannot be changed
              </p>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                id="edit-description"
                value={formData.description || ''}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, description: e.target.value }))
                }
                rows={2}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Brief description of this coupon"
              />
              {errors.description && (
                <p className="mt-1 text-xs text-red-500">{errors.description}</p>
              )}
            </div>

            {/* Discount Type - Read Only */}
            <div>
              <label htmlFor="edit-discountType" className="block text-sm font-medium text-gray-700 mb-1">
                Discount Type
              </label>
              <select
                id="edit-discountType"
                value={formData.discountType}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
              >
                <option value="percentage">Percentage Discount</option>
                <option value="fixed_amount">Fixed Amount</option>
                <option value="free_delivery">Free Delivery</option>
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Discount type cannot be changed
              </p>
            </div>

            {/* Discount Value */}
            {formData.discountType !== 'free_delivery' && (
              <div>
                <label htmlFor="edit-discountValue" className="block text-sm font-medium text-gray-700 mb-1">
                  Discount Value *
                </label>
                <div className="relative">
                  <input
                    id="edit-discountValue"
                    type="number"
                    min="0"
                    step={formData.discountType === 'percentage' ? '0.1' : '1'}
                    max={formData.discountType === 'percentage' ? '100' : undefined}
                    value={formData.discountValue || ''}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        discountValue: parseFloat(e.target.value),
                      }))
                    }
                    className={`w-full px-3 py-2 pr-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      errors.discountValue ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                    {formData.discountType === 'percentage' ? '%' : '₦'}
                  </span>
                </div>
                {errors.discountValue && (
                  <p className="mt-1 text-xs text-red-500">{errors.discountValue}</p>
                )}
              </div>
            )}

            {/* Max Discount Amount (for percentage) */}
            {formData.discountType === 'percentage' && (
              <div>
                <label
                  htmlFor="edit-maxDiscountAmount"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Max Discount Amount (Optional)
                </label>
                <div className="relative">
                  <input
                    id="edit-maxDiscountAmount"
                    type="number"
                    min="0"
                    step="1"
                    value={formData.maxDiscountAmount || ''}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        maxDiscountAmount: e.target.value ? parseFloat(e.target.value) : undefined,
                      }))
                    }
                    className={`w-full px-3 py-2 pr-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      errors.maxDiscountAmount ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="0"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                    ₦
                  </span>
                </div>
                {errors.maxDiscountAmount && (
                  <p className="mt-1 text-xs text-red-500">{errors.maxDiscountAmount}</p>
                )}
              </div>
            )}

            {/* Min Order Amount */}
            <div>
              <label htmlFor="edit-minOrderAmount" className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Order Amount (Optional)
              </label>
              <div className="relative">
                <input
                  id="edit-minOrderAmount"
                  type="number"
                  min="0"
                  step="1"
                  value={formData.minOrderAmount || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      minOrderAmount: e.target.value ? parseFloat(e.target.value) : undefined,
                    }))
                  }
                  className={`w-full px-3 py-2 pr-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    errors.minOrderAmount ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="0"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                  ₦
                </span>
              </div>
              {errors.minOrderAmount && (
                <p className="mt-1 text-xs text-red-500">{errors.minOrderAmount}</p>
              )}
            </div>

            {/* Usage Limits */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="edit-maxUsesTotal"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Max Total Uses (Optional)
                </label>
                <input
                  id="edit-maxUsesTotal"
                  type="number"
                  min="1"
                  value={formData.maxUsesTotal || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      maxUsesTotal: e.target.value ? parseInt(e.target.value) : undefined,
                    }))
                  }
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    errors.maxUsesTotal ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Unlimited"
                />
                {errors.maxUsesTotal && (
                  <p className="mt-1 text-xs text-red-500">{errors.maxUsesTotal}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="edit-maxUsesPerUser"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Max Uses Per User *
                </label>
                <input
                  id="edit-maxUsesPerUser"
                  type="number"
                  min="1"
                  value={formData.maxUsesPerUser || 1}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      maxUsesPerUser: parseInt(e.target.value),
                    }))
                  }
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    errors.maxUsesPerUser ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.maxUsesPerUser && (
                  <p className="mt-1 text-xs text-red-500">{errors.maxUsesPerUser}</p>
                )}
              </div>
            </div>

            {/* Validity Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="edit-validFrom" className="block text-sm font-medium text-gray-700 mb-1">
                  Valid From (Optional)
                </label>
                <input
                  id="edit-validFrom"
                  type="date"
                  value={formData.validFrom || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      validFrom: e.target.value || undefined,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label htmlFor="edit-validUntil" className="block text-sm font-medium text-gray-700 mb-1">
                  Valid Until (Optional)
                </label>
                <input
                  id="edit-validUntil"
                  type="date"
                  value={formData.validUntil || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      validUntil: e.target.value || undefined,
                    }))
                  }
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    errors.validUntil ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.validUntil && (
                  <p className="mt-1 text-xs text-red-500">{errors.validUntil}</p>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 mt-6 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Updating...' : 'Update Coupon'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
