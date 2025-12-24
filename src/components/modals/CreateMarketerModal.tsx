import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { useCreateMarketerMutation } from '@/redux/api/marketersApi';
import type { CreateMarketerPayload } from '@/types/marketing';

interface CreateMarketerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const CreateMarketerModal: React.FC<CreateMarketerModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [createMarketer, { isLoading }] = useCreateMarketerMutation();

  const [formData, setFormData] = useState<CreateMarketerPayload>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    marketingCode: '',
    commissionRate: 10,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'commissionRate'
        ? Number(value)
        : name === 'marketingCode'
        ? value.toUpperCase()
        : value
    }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    setServerError('');
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';

    if (formData.marketingCode && (formData.marketingCode.length < 6 || formData.marketingCode.length > 12)) {
      newErrors.marketingCode = 'Code must be 6-12 characters';
    }

    if (formData.commissionRate !== undefined && (formData.commissionRate < 0 || formData.commissionRate > 100)) {
      newErrors.commissionRate = 'Commission rate must be between 0 and 100';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const payload = {
        ...formData,
        marketingCode: formData.marketingCode?.trim() || undefined,
      };

      const result = await createMarketer(payload).unwrap();

      if (result.success) {
        onSuccess?.();
        handleClose();
      }
    } catch (error) {
      const err = error as { data?: { message?: string } };
      setServerError(err?.data?.message || 'Failed to create marketer. Please try again.');
    }
  };

  const handleClose = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      marketingCode: '',
      commissionRate: 10,
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
          <h2 className="text-xl font-semibold text-gray-900">Add New Marketer</h2>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* First Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                disabled={isLoading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-green-600 disabled:bg-gray-100"
                placeholder="Enter first name"
              />
              {errors.firstName && (
                <p className="text-xs text-red-500 mt-1">{errors.firstName}</p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                disabled={isLoading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-green-600 disabled:bg-gray-100"
                placeholder="Enter last name"
              />
              {errors.lastName && (
                <p className="text-xs text-red-500 mt-1">{errors.lastName}</p>
              )}
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={isLoading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-green-600 disabled:bg-gray-100"
              placeholder="marketer@example.com"
            />
            {errors.email && (
              <p className="text-xs text-red-500 mt-1">{errors.email}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              disabled={isLoading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-green-600 disabled:bg-gray-100"
              placeholder="08012345678"
            />
            {errors.phone && (
              <p className="text-xs text-red-500 mt-1">{errors.phone}</p>
            )}
          </div>

          {/* Marketing Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Marketing Code <span className="text-gray-400">(Optional - auto-generated if empty)</span>
            </label>
            <input
              type="text"
              name="marketingCode"
              value={formData.marketingCode}
              onChange={handleChange}
              disabled={isLoading}
              maxLength={12}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-green-600 disabled:bg-gray-100 uppercase font-mono"
              placeholder="e.g., JUDE2025"
            />
            <p className="text-xs text-gray-500 mt-1">6-12 characters, uppercase letters and numbers</p>
            {errors.marketingCode && (
              <p className="text-xs text-red-500 mt-1">{errors.marketingCode}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Commission Rate */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Commission Rate (%)
              </label>
              <input
                type="number"
                name="commissionRate"
                value={formData.commissionRate}
                onChange={handleChange}
                disabled={isLoading}
                min="0"
                max="100"
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-green-600 disabled:bg-gray-100"
              />
              {errors.commissionRate && (
                <p className="text-xs text-red-500 mt-1">{errors.commissionRate}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Commission is calculated on FIRST ORDER ONLY from each referred customer
              </p>
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
                <span>Create Marketer</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
