import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { useCreateCouponMutation } from '@/redux/api/couponsApi';
import type { CreateCouponPayload } from '@/types/marketing';

interface CreateCouponModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const CreateCouponModal: React.FC<CreateCouponModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [createCoupon, { isLoading }] = useCreateCouponMutation();

  const [formData, setFormData] = useState<CreateCouponPayload>({
    code: '',
    description: '',
    discountType: 'percentage',
    discountValue: 10,
    maxDiscountAmount: undefined,
    minOrderAmount: undefined,
    maxUsesTotal: undefined,
    maxUsesPerUser: 1,
    validFrom: undefined,
    validUntil: undefined,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    let processedValue: any = value;

    // Convert to number for numeric fields
    if (['discountValue', 'maxDiscountAmount', 'minOrderAmount', 'maxUsesTotal', 'maxUsesPerUser'].includes(name)) {
      processedValue = value === '' ? undefined : Number(value);
    }

    // Convert to uppercase for code
    if (name === 'code') {
      processedValue = value.toUpperCase();
    }

    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    setServerError('');
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.code.trim()) {
      newErrors.code = 'Coupon code is required';
    } else if (formData.code.length < 6 || formData.code.length > 12) {
      newErrors.code = 'Code must be 6-12 characters';
    } else if (!/^[A-Z0-9]+$/.test(formData.code)) {
      newErrors.code = 'Code must contain only letters and numbers';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.discountValue || formData.discountValue <= 0) {
      newErrors.discountValue = 'Discount value is required';
    } else if (formData.discountType === 'percentage' && formData.discountValue > 100) {
      newErrors.discountValue = 'Percentage cannot exceed 100%';
    }

    if (formData.maxUsesPerUser && formData.maxUsesPerUser < 1) {
      newErrors.maxUsesPerUser = 'Must be at least 1';
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
    if (!validate()) return;

    try {
      // Convert Naira to Kobo for amounts
      const payload: CreateCouponPayload = {
        ...formData,
        code: formData.code.trim().toUpperCase(),
        discountValue: formData.discountType === 'percentage'
          ? formData.discountValue
          : (formData.discountValue || 0) * 100, // Convert to kobo
        maxDiscountAmount: formData.maxDiscountAmount
          ? formData.maxDiscountAmount * 100
          : undefined,
        minOrderAmount: formData.minOrderAmount
          ? formData.minOrderAmount * 100
          : undefined,
      };

      const result = await createCoupon(payload).unwrap();

      if (result.success) {
        onSuccess?.();
        handleClose();
      }
    } catch (error: any) {
      setServerError(error?.data?.message || 'Failed to create coupon. Please try again.');
    }
  };

  const handleClose = () => {
    setFormData({
      code: '',
      description: '',
      discountType: 'percentage',
      discountValue: 10,
      maxDiscountAmount: undefined,
      minOrderAmount: undefined,
      maxUsesTotal: undefined,
      maxUsesPerUser: 1,
      validFrom: undefined,
      validUntil: undefined,
    });
    setErrors({});
    setServerError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Create New Coupon</h2>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {serverError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
              {serverError}
            </div>
          )}

          {/* Coupon Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Coupon Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="code"
              value={formData.code}
              onChange={handleChange}
              disabled={isLoading}
              maxLength={12}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-green-600 disabled:bg-gray-100 uppercase font-mono"
              placeholder="e.g., SAVE20"
            />
            <p className="text-xs text-gray-500 mt-1">6-12 characters, uppercase letters and numbers only</p>
            {errors.code && (
              <p className="text-xs text-red-500 mt-1">{errors.code}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              disabled={isLoading}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-green-600 disabled:bg-gray-100 resize-none"
              placeholder="e.g., 20% off for new year promo"
            />
            {errors.description && (
              <p className="text-xs text-red-500 mt-1">{errors.description}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Discount Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Discount Type <span className="text-red-500">*</span>
              </label>
              <select
                name="discountType"
                value={formData.discountType}
                onChange={handleChange}
                disabled={isLoading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-green-600 disabled:bg-gray-100"
              >
                <option value="percentage">Percentage Discount</option>
                <option value="fixed_amount">Fixed Amount</option>
                <option value="free_delivery">Free Delivery</option>
              </select>
            </div>

            {/* Discount Value */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {formData.discountType === 'percentage' ? 'Percentage (%)' :
                 formData.discountType === 'fixed_amount' ? 'Amount (₦)' :
                 'Value'} <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="discountValue"
                value={formData.discountValue || ''}
                onChange={handleChange}
                disabled={isLoading || formData.discountType === 'free_delivery'}
                min="0"
                max={formData.discountType === 'percentage' ? 100 : undefined}
                step={formData.discountType === 'percentage' ? '1' : '100'}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-green-600 disabled:bg-gray-100"
                placeholder={formData.discountType === 'percentage' ? 'e.g., 20' : 'e.g., 5000'}
              />
              {errors.discountValue && (
                <p className="text-xs text-red-500 mt-1">{errors.discountValue}</p>
              )}
            </div>
          </div>

          {/* Max Discount Amount (only for percentage) */}
          {formData.discountType === 'percentage' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Discount Amount (₦) <span className="text-gray-400">(Optional)</span>
              </label>
              <input
                type="number"
                name="maxDiscountAmount"
                value={formData.maxDiscountAmount || ''}
                onChange={handleChange}
                disabled={isLoading}
                min="0"
                step="100"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-green-600 disabled:bg-gray-100"
                placeholder="e.g., 5000"
              />
              <p className="text-xs text-gray-500 mt-1">Cap the maximum discount even if percentage is higher</p>
            </div>
          )}

          {/* Min Order Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Minimum Order Amount (₦) <span className="text-gray-400">(Optional)</span>
            </label>
            <input
              type="number"
              name="minOrderAmount"
              value={formData.minOrderAmount || ''}
              onChange={handleChange}
              disabled={isLoading}
              min="0"
              step="100"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-green-600 disabled:bg-gray-100"
              placeholder="e.g., 10000"
            />
            <p className="text-xs text-gray-500 mt-1">Order must be at least this amount to use coupon</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Max Uses Total */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Usage Limit <span className="text-gray-400">(Optional)</span>
              </label>
              <input
                type="number"
                name="maxUsesTotal"
                value={formData.maxUsesTotal || ''}
                onChange={handleChange}
                disabled={isLoading}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-green-600 disabled:bg-gray-100"
                placeholder="e.g., 100"
              />
              <p className="text-xs text-gray-500 mt-1">Leave empty for unlimited</p>
            </div>

            {/* Max Uses Per User */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Uses Per User
              </label>
              <input
                type="number"
                name="maxUsesPerUser"
                value={formData.maxUsesPerUser || 1}
                onChange={handleChange}
                disabled={isLoading}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-green-600 disabled:bg-gray-100"
              />
              {errors.maxUsesPerUser && (
                <p className="text-xs text-red-500 mt-1">{errors.maxUsesPerUser}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Valid From */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Valid From <span className="text-gray-400">(Optional)</span>
              </label>
              <input
                type="datetime-local"
                name="validFrom"
                value={formData.validFrom || ''}
                onChange={handleChange}
                disabled={isLoading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-green-600 disabled:bg-gray-100"
              />
            </div>

            {/* Valid Until */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Valid Until <span className="text-gray-400">(Optional)</span>
              </label>
              <input
                type="datetime-local"
                name="validUntil"
                value={formData.validUntil || ''}
                onChange={handleChange}
                disabled={isLoading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-green-600 disabled:bg-gray-100"
              />
              {errors.validUntil && (
                <p className="text-xs text-red-500 mt-1">{errors.validUntil}</p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <span>Create Coupon</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
