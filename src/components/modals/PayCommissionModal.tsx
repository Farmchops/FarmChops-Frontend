import React, { useState } from 'react';
import { X, DollarSign } from 'lucide-react';
import { usePayCommissionMutation } from '@/redux/api/marketersApi';
import type { Marketer, PayCommissionPayload } from '@/types/marketing';

interface PayCommissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  marketer: Marketer;
}

export const PayCommissionModal: React.FC<PayCommissionModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  marketer,
}) => {
  const [payCommission, { isLoading }] = usePayCommissionMutation();

  const [formData, setFormData] = useState<PayCommissionPayload>({
    marketerId: marketer._id,
    amount: marketer.unpaidCommission, // in kobo
    periodStart: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    periodEnd: new Date().toISOString().split('T')[0],
    paymentMethod: 'bank_transfer',
    paymentReference: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string>('');

  // Convert kobo to naira for display
  const amountInNaira = (formData.amount || 0) / 100;

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    if (formData.amount && formData.amount > marketer.unpaidCommission) {
      newErrors.amount = 'Amount cannot exceed unpaid commission';
    }

    if (!formData.periodStart) {
      newErrors.periodStart = 'Period start date is required';
    }

    if (!formData.periodEnd) {
      newErrors.periodEnd = 'Period end date is required';
    }

    if (formData.periodStart && formData.periodEnd) {
      const start = new Date(formData.periodStart);
      const end = new Date(formData.periodEnd);
      if (start >= end) {
        newErrors.periodEnd = 'End date must be after start date';
      }
    }

    if (!formData.paymentMethod) {
      newErrors.paymentMethod = 'Payment method is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');

    if (!validate()) return;

    try {
      const result = await payCommission(formData).unwrap();

      if (result.success) {
        onSuccess?.();
        handleClose();
      }
    } catch (error: any) {
      setServerError(error?.data?.message || 'Failed to record commission payment');
    }
  };

  const handleClose = () => {
    setFormData({
      marketerId: marketer._id,
      amount: marketer.unpaidCommission,
      periodStart: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      periodEnd: new Date().toISOString().split('T')[0],
      paymentMethod: 'bank_transfer',
      paymentReference: '',
      notes: '',
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
            <h2 className="text-xl font-semibold text-gray-900">Pay Commission</h2>
            <p className="text-sm text-gray-500 mt-1">
              Record commission payment for {marketer.firstName} {marketer.lastName}
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

          {/* Unpaid Commission Info */}
          <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-center gap-3">
              <DollarSign className="w-8 h-8 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Total Unpaid Commission</p>
                <p className="text-2xl font-semibold text-gray-900">
                  ₦{(marketer.unpaidCommission / 100).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {/* Amount */}
            <div>
              <label htmlFor="pay-amount" className="block text-sm font-medium text-gray-700 mb-1">
                Payment Amount (₦) *
              </label>
              <div className="relative">
                <input
                  id="pay-amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={amountInNaira}
                  onChange={(e) => {
                    const nairaValue = parseFloat(e.target.value) || 0;
                    setFormData((prev) => ({
                      ...prev,
                      amount: Math.round(nairaValue * 100), // Convert Naira to Kobo
                    }));
                  }}
                  className={`w-full px-3 py-2 pr-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    errors.amount ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="0.00"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                  ₦
                </span>
              </div>
              {errors.amount && (
                <p className="mt-1 text-xs text-red-500">{errors.amount}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Max: ₦{(marketer.unpaidCommission / 100).toLocaleString()}
              </p>
            </div>

            {/* Period */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="pay-periodStart" className="block text-sm font-medium text-gray-700 mb-1">
                  Period Start *
                </label>
                <input
                  id="pay-periodStart"
                  type="date"
                  value={formData.periodStart}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, periodStart: e.target.value }))
                  }
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    errors.periodStart ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.periodStart && (
                  <p className="mt-1 text-xs text-red-500">{errors.periodStart}</p>
                )}
              </div>

              <div>
                <label htmlFor="pay-periodEnd" className="block text-sm font-medium text-gray-700 mb-1">
                  Period End *
                </label>
                <input
                  id="pay-periodEnd"
                  type="date"
                  value={formData.periodEnd}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, periodEnd: e.target.value }))
                  }
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    errors.periodEnd ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.periodEnd && (
                  <p className="mt-1 text-xs text-red-500">{errors.periodEnd}</p>
                )}
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <label htmlFor="pay-method" className="block text-sm font-medium text-gray-700 mb-1">
                Payment Method *
              </label>
              <select
                id="pay-method"
                value={formData.paymentMethod}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    paymentMethod: e.target.value as PayCommissionPayload['paymentMethod'],
                  }))
                }
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  errors.paymentMethod ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="bank_transfer">Bank Transfer</option>
                <option value="cash">Cash</option>
                <option value="check">Check</option>
                <option value="mobile_money">Mobile Money</option>
                <option value="other">Other</option>
              </select>
              {errors.paymentMethod && (
                <p className="mt-1 text-xs text-red-500">{errors.paymentMethod}</p>
              )}
            </div>

            {/* Payment Reference */}
            <div>
              <label htmlFor="pay-reference" className="block text-sm font-medium text-gray-700 mb-1">
                Payment Reference (Optional)
              </label>
              <input
                id="pay-reference"
                type="text"
                value={formData.paymentReference || ''}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, paymentReference: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Transaction ID, check number, etc."
              />
              <p className="mt-1 text-xs text-gray-500">
                Optional reference for tracking this payment
              </p>
            </div>

            {/* Notes */}
            <div>
              <label htmlFor="pay-notes" className="block text-sm font-medium text-gray-700 mb-1">
                Notes (Optional)
              </label>
              <textarea
                id="pay-notes"
                value={formData.notes || ''}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, notes: e.target.value }))
                }
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Additional notes about this payment..."
              />
            </div>
          </div>

          {/* Summary */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="font-medium text-gray-900 mb-2">Payment Summary</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Marketer:</span>
                <span className="font-medium">
                  {marketer.firstName} {marketer.lastName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Marketing Code:</span>
                <span className="font-mono font-medium">{marketer.marketingCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Period:</span>
                <span className="font-medium">
                  {formData.periodStart} to {formData.periodEnd}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-300 mt-2">
                <span className="text-gray-900 font-medium">Payment Amount:</span>
                <span className="text-lg font-semibold text-green-600">
                  ₦{amountInNaira.toLocaleString()}
                </span>
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
              {isLoading ? 'Recording Payment...' : 'Record Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
