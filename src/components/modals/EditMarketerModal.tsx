import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useUpdateMarketerMutation } from '@/redux/api/marketersApi';
import type { Marketer, UpdateMarketerPayload } from '@/types/marketing';

interface EditMarketerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  marketer: Marketer;
}

export const EditMarketerModal: React.FC<EditMarketerModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  marketer,
}) => {
  const [updateMarketer, { isLoading }] = useUpdateMarketerMutation();

  const [formData, setFormData] = useState<UpdateMarketerPayload>({
    firstName: marketer.firstName,
    lastName: marketer.lastName,
    email: marketer.email,
    phone: marketer.phone,
    commissionRate: marketer.commissionRate,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string>('');

  // Update form data when marketer changes
  useEffect(() => {
    if (marketer) {
      setFormData({
        firstName: marketer.firstName,
        lastName: marketer.lastName,
        email: marketer.email,
        phone: marketer.phone,
        commissionRate: marketer.commissionRate,
      });
    }
  }, [marketer]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName?.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName?.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.phone?.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    if (formData.commissionRate !== undefined) {
      if (formData.commissionRate < 0 || formData.commissionRate > 100) {
        newErrors.commissionRate = 'Commission rate must be between 0 and 100';
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
      const result = await updateMarketer({
        marketerId: marketer._id,
        data: formData,
      }).unwrap();

      if (result.success) {
        onSuccess?.();
        handleClose();
      }
    } catch (error) {
      const err = error as { data?: { message?: string } };
      setServerError(err?.data?.message || 'Failed to update marketer');
    }
  };

  const handleClose = () => {
    setFormData({
      firstName: marketer.firstName,
      lastName: marketer.lastName,
      email: marketer.email,
      phone: marketer.phone,
      commissionRate: marketer.commissionRate,
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
            <h2 className="text-xl font-semibold text-gray-900">Edit Marketer</h2>
            <p className="text-sm text-gray-500 mt-1">
              Update marketer information
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
            {/* First Name */}
            <div>
              <label htmlFor="edit-firstName" className="block text-sm font-medium text-gray-700 mb-1">
                First Name *
              </label>
              <input
                id="edit-firstName"
                type="text"
                value={formData.firstName || ''}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, firstName: e.target.value }))
                }
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  errors.firstName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter first name"
              />
              {errors.firstName && (
                <p className="mt-1 text-xs text-red-500">{errors.firstName}</p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label htmlFor="edit-lastName" className="block text-sm font-medium text-gray-700 mb-1">
                Last Name *
              </label>
              <input
                id="edit-lastName"
                type="text"
                value={formData.lastName || ''}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, lastName: e.target.value }))
                }
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  errors.lastName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter last name"
              />
              {errors.lastName && (
                <p className="mt-1 text-xs text-red-500">{errors.lastName}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="edit-email" className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                id="edit-email"
                type="email"
                value={formData.email || ''}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="marketer@example.com"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-500">{errors.email}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="edit-phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number *
              </label>
              <input
                id="edit-phone"
                type="tel"
                value={formData.phone || ''}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, phone: e.target.value }))
                }
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  errors.phone ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="+234 801 234 5678"
              />
              {errors.phone && (
                <p className="mt-1 text-xs text-red-500">{errors.phone}</p>
              )}
            </div>

            {/* Marketing Code - Read Only */}
            <div>
              <label htmlFor="edit-code" className="block text-sm font-medium text-gray-700 mb-1">
                Marketing Code
              </label>
              <input
                id="edit-code"
                type="text"
                value={marketer.marketingCode}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed font-mono"
              />
              <p className="mt-1 text-xs text-gray-500">
                Marketing code cannot be changed
              </p>
            </div>

            {/* Commission Rate */}
            <div>
              <label htmlFor="edit-commissionRate" className="block text-sm font-medium text-gray-700 mb-1">
                Commission Rate (%)
              </label>
              <input
                id="edit-commissionRate"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={formData.commissionRate || 10}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    commissionRate: parseFloat(e.target.value),
                  }))
                }
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  errors.commissionRate ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.commissionRate && (
                <p className="mt-1 text-xs text-red-500">{errors.commissionRate}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Percentage of order value paid as commission
              </p>
            </div>

          </div>

          {/* Commission Info */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Commission is calculated on <strong>FIRST ORDER ONLY</strong> from each referred customer, regardless of time elapsed since signup.
            </p>
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
              {isLoading ? 'Updating...' : 'Update Marketer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
