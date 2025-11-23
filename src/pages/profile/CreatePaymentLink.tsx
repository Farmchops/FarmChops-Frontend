// src/pages/profile/CreatePaymentLink.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Link2,
  Copy,
  Check,
  Share2,
  AlertCircle,
  Loader2,
  CheckCircle,
} from 'lucide-react';
import { useCreatePaymentLinkMutation } from '@/redux/api/walletApi';
import type { CreatePaymentLinkResponse } from '@/types/wallet';

const PRESET_AMOUNTS = [1000, 2000, 5000, 10000, 20000, 50000];

const CreatePaymentLink = () => {
  const navigate = useNavigate();
  const [createLink, { isLoading }] = useCreatePaymentLinkMutation();

  const [formData, setFormData] = useState({
    amount: '' as number | '',
    description: '',
    recipientName: '',
    recipientPhone: '',
    expiresInDays: 7,
  });
  const [error, setError] = useState<string | null>(null);
  const [createdLink, setCreatedLink] = useState<CreatePaymentLinkResponse | null>(null);
  const [copied, setCopied] = useState(false);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleAmountChange = (value: string) => {
    const numValue = value.replace(/[^0-9]/g, '');
    setFormData({ ...formData, amount: numValue ? parseInt(numValue, 10) : '' });
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.amount || formData.amount < 100) {
      setError('Minimum amount is ₦100');
      return;
    }

    if (!formData.description.trim()) {
      setError('Please add a description');
      return;
    }

    setError(null);

    try {
      const response = await createLink({
        amount: formData.amount,
        description: formData.description.trim(),
        recipientName: formData.recipientName.trim() || undefined,
        recipientPhone: formData.recipientPhone.trim() || undefined,
        expiresInDays: formData.expiresInDays,
      }).unwrap();

      if (response.success && response.data) {
        setCreatedLink(response.data);
      } else {
        setError('Failed to create payment link');
      }
    } catch (err: unknown) {
      const errorMessage = err && typeof err === 'object' && 'data' in err
        ? (err as { data?: { message?: string } }).data?.message
        : 'Failed to create payment link';
      setError(errorMessage || 'Failed to create payment link');
    }
  };

  const handleCopyLink = async () => {
    if (!createdLink) return;
    try {
      await navigator.clipboard.writeText(createdLink.shareableUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleShare = async () => {
    if (!createdLink) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Payment Request',
          text: `${createdLink.description} - ${formatCurrency(createdLink.amount)}`,
          url: createdLink.shareableUrl,
        });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          handleCopyLink();
        }
      }
    } else {
      handleCopyLink();
    }
  };

  // Success State
  if (createdLink) {
    return (
      <div className="py-6">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate('/profile/payment-links')}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Payment Link Created</h1>
        </div>

        <div className="max-w-md mx-auto">
          <div className="bg-white border border-green-200 rounded-2xl p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Link Created Successfully!
            </h3>
            <p className="text-gray-600 mb-4">
              Share this link with anyone you want to pay for you
            </p>

            {/* Link Details */}
            <div className="bg-gray-50 rounded-xl p-4 mb-4 text-left">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-semibold text-[#1D7B3C]">
                    {formatCurrency(createdLink.amount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Code:</span>
                  <span className="font-mono text-gray-900">{createdLink.code}</span>
                </div>
                {createdLink.recipientName && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">For:</span>
                    <span className="text-gray-900">{createdLink.recipientName}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Shareable URL */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-6">
              <p className="text-sm text-green-800 font-mono break-all">
                {createdLink.shareableUrl}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleCopyLink}
                className="flex-1 flex items-center justify-center gap-2 py-3 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-green-600" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy Link
                  </>
                )}
              </button>
              <button
                onClick={handleShare}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#1D7B3C] text-white rounded-xl font-medium hover:bg-green-700 transition"
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>
            </div>
          </div>

          {/* Create Another */}
          <div className="mt-6 flex gap-3">
            <button
              onClick={() => {
                setCreatedLink(null);
                setFormData({
                  amount: '',
                  description: '',
                  recipientName: '',
                  recipientPhone: '',
                  expiresInDays: 7,
                });
              }}
              className="flex-1 py-3 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition"
            >
              Create Another
            </button>
            <button
              onClick={() => navigate('/profile/payment-links')}
              className="flex-1 py-3 border border-[#1D7B3C] text-[#1D7B3C] rounded-xl font-medium hover:bg-green-50 transition"
            >
              View All Links
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/profile/payment-links')}
          className="p-2 hover:bg-gray-100 rounded-full transition"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create Payment Link</h1>
          <p className="text-gray-600 text-sm mt-1">
            Create a link to share with someone who wants to pay for you
          </p>
        </div>
      </div>

      <div className="max-w-md mx-auto">
        <form onSubmit={handleSubmit}>
          {/* Amount */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount *
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg font-medium">
                ₦
              </span>
              <input
                type="text"
                value={formData.amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                placeholder="0"
                className="w-full pl-10 pr-4 py-4 text-2xl font-bold border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1D7B3C] focus:border-transparent"
              />
            </div>

            {/* Preset Amounts */}
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-2">Quick select</p>
              <div className="grid grid-cols-3 gap-2">
                {PRESET_AMOUNTS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setFormData({ ...formData, amount: preset })}
                    className={`py-2 px-3 rounded-lg text-sm font-medium transition ${
                      formData.amount === preset
                        ? 'bg-[#1D7B3C] text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {formatCurrency(preset)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="e.g., Help me pay for groceries"
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1D7B3C] focus:border-transparent resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              This will be shown to the person paying
            </p>
          </div>

          {/* Recipient Details (Optional) */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-4">
            <h3 className="font-medium text-gray-900 mb-4">
              Recipient Details (Optional)
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recipient Name
                </label>
                <input
                  type="text"
                  value={formData.recipientName}
                  onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
                  placeholder="e.g., Mom, Dad, Friend"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1D7B3C] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recipient Phone
                </label>
                <input
                  type="tel"
                  value={formData.recipientPhone}
                  onChange={(e) => setFormData({ ...formData, recipientPhone: e.target.value })}
                  placeholder="+234..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1D7B3C] focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Expiry */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Link Expires In
            </label>
            <select
              value={formData.expiresInDays}
              onChange={(e) => setFormData({ ...formData, expiresInDays: parseInt(e.target.value) })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1D7B3C] focus:border-transparent"
            >
              <option value={1}>1 Day</option>
              <option value={3}>3 Days</option>
              <option value={7}>7 Days</option>
              <option value={14}>14 Days</option>
              <option value={30}>30 Days</option>
            </select>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-xl">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !formData.amount || !formData.description}
            className="w-full py-4 bg-[#1D7B3C] text-white rounded-xl font-medium hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Creating Link...
              </>
            ) : (
              <>
                <Link2 className="w-5 h-5" />
                Create Payment Link
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreatePaymentLink;
