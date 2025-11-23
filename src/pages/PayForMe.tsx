// src/pages/PayForMe.tsx
import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import {
  Link2,
  User,
  Mail,
  Phone,
  AlertCircle,
  Loader2,
  CheckCircle,
  Clock,
  XCircle,
  ShoppingBag,
} from 'lucide-react';
import {
  useGetPaymentLinkDetailsQuery,
  usePayViaPaymentLinkMutation,
  useLazyVerifyPaymentLinkPaymentQuery,
} from '@/redux/api/walletApi';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const PayForMe = () => {
  const { code } = useParams<{ code: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Check if returning from payment
  const paymentReference = searchParams.get('reference');

  const { data, isLoading, error: fetchError } = useGetPaymentLinkDetailsQuery(code || '', {
    skip: !code,
  });

  const [payViaLink, { isLoading: paying }] = usePayViaPaymentLinkMutation();
  const [verifyPayment, { data: verifyData, isLoading: verifying }] =
    useLazyVerifyPaymentLinkPaymentQuery();

  const [formData, setFormData] = useState({
    payerName: '',
    payerEmail: '',
    payerPhone: '',
  });
  const [formError, setFormError] = useState<string | null>(null);

  const linkDetails = data?.data;

  // Verify payment if returning from Paystack
  useEffect(() => {
    if (paymentReference && code) {
      verifyPayment({ code, reference: paymentReference });
    }
  }, [paymentReference, code, verifyPayment]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-NG', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.payerName.trim()) {
      setFormError('Please enter your name');
      return;
    }

    if (!formData.payerEmail.trim() || !formData.payerEmail.includes('@')) {
      setFormError('Please enter a valid email');
      return;
    }

    setFormError(null);

    try {
      const response = await payViaLink({
        code: code!,
        data: {
          payerName: formData.payerName.trim(),
          payerEmail: formData.payerEmail.trim(),
          payerPhone: formData.payerPhone.trim() || undefined,
        },
      }).unwrap();

      if (response.success && response.data?.authorizationUrl) {
        window.location.href = response.data.authorizationUrl;
      } else {
        setFormError('Failed to initialize payment');
      }
    } catch (err: unknown) {
      const errorMessage = err && typeof err === 'object' && 'data' in err
        ? (err as { data?: { message?: string } }).data?.message
        : 'Failed to process payment';
      setFormError(errorMessage || 'Failed to process payment');
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-[#1D7B3C] animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading payment details...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Error state
  if (fetchError || !linkDetails) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white border border-red-200 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Payment Link Not Found
            </h2>
            <p className="text-gray-600 mb-6">
              This payment link may have expired, been cancelled, or doesn't exist.
            </p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-[#1D7B3C] text-white rounded-xl font-medium hover:bg-green-700 transition"
            >
              Go to Homepage
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Payment verification state
  if (paymentReference) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            {verifying ? (
              <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center">
                <Loader2 className="w-12 h-12 text-[#1D7B3C] animate-spin mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Verifying Payment
                </h3>
                <p className="text-gray-600">Please wait while we confirm your payment...</p>
              </div>
            ) : verifyData?.data?.status === 'paid' ? (
              <div className="bg-white border border-green-200 rounded-2xl p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Payment Successful!
                </h3>
                <p className="text-gray-600 mb-2">
                  Thank you for your payment of {formatCurrency(linkDetails.amount)}
                </p>
                <p className="text-sm text-gray-500 mb-6">
                  {linkDetails.createdBy} has been notified and the funds have been added to their wallet.
                </p>
                <button
                  onClick={() => navigate('/')}
                  className="px-6 py-3 bg-[#1D7B3C] text-white rounded-xl font-medium hover:bg-green-700 transition"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              <div className="bg-white border border-yellow-200 rounded-2xl p-8 text-center">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-yellow-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Payment Processing
                </h3>
                <p className="text-gray-600 mb-6">
                  {verifyData?.data?.message || 'Your payment is being processed...'}
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => verifyPayment({ code: code!, reference: paymentReference })}
                    className="flex-1 py-3 bg-[#1D7B3C] text-white rounded-xl font-medium hover:bg-green-700 transition"
                  >
                    Check Again
                  </button>
                  <button
                    onClick={() => navigate('/')}
                    className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition"
                  >
                    Go Home
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Link already paid or unavailable
  if (linkDetails.isPaid || linkDetails.isExpired || linkDetails.status === 'cancelled') {
    const getStatusContent = () => {
      if (linkDetails.isPaid) {
        return {
          icon: <CheckCircle className="w-8 h-8 text-green-600" />,
          bgColor: 'bg-green-100',
          borderColor: 'border-green-200',
          title: 'Already Paid',
          message: 'This payment link has already been used.',
        };
      }
      if (linkDetails.isExpired) {
        return {
          icon: <Clock className="w-8 h-8 text-yellow-600" />,
          bgColor: 'bg-yellow-100',
          borderColor: 'border-yellow-200',
          title: 'Link Expired',
          message: 'This payment link has expired.',
        };
      }
      return {
        icon: <XCircle className="w-8 h-8 text-red-600" />,
        bgColor: 'bg-red-100',
        borderColor: 'border-red-200',
        title: 'Link Cancelled',
        message: 'This payment link has been cancelled.',
      };
    };

    const status = getStatusContent();

    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className={`max-w-md w-full bg-white border ${status.borderColor} rounded-2xl p-8 text-center`}>
            <div className={`w-16 h-16 ${status.bgColor} rounded-full flex items-center justify-center mx-auto mb-4`}>
              {status.icon}
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {status.title}
            </h2>
            <p className="text-gray-600 mb-6">{status.message}</p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-[#1D7B3C] text-white rounded-xl font-medium hover:bg-green-700 transition"
            >
              Go to Homepage
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Active payment link - show payment form
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="flex-1 py-8 px-4">
        <div className="max-w-lg mx-auto">
          {/* Payment Request Card */}
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden mb-6">
            {/* Header */}
            <div className="bg-gradient-to-br from-[#1D7B3C] to-[#145a2b] p-6 text-white">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Link2 className="w-5 h-5" />
                </div>
                <span className="font-medium">Payment Request</span>
              </div>
              <h2 className="text-3xl font-bold mb-2">
                {formatCurrency(linkDetails.amount)}
              </h2>
              <p className="text-white/80">
                Requested by {linkDetails.createdBy}
              </p>
            </div>

            {/* Details */}
            <div className="p-6">
              <div className="mb-4">
                <p className="text-gray-600 text-sm mb-1">Description</p>
                <p className="text-gray-900 font-medium">{linkDetails.description}</p>
              </div>

              {linkDetails.recipientName && (
                <div className="mb-4">
                  <p className="text-gray-600 text-sm mb-1">Intended Recipient</p>
                  <p className="text-gray-900 font-medium">{linkDetails.recipientName}</p>
                </div>
              )}

              {linkDetails.order && (
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg mb-4">
                  <ShoppingBag className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">
                      Order #{linkDetails.order.orderNumber}
                    </p>
                    <p className="text-xs text-blue-700">
                      {linkDetails.order.itemCount} items
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Clock className="w-4 h-4" />
                <span>Expires on {formatDate(linkDetails.expiresAt)}</span>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Your Details</h3>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Name *
                  </label>
                  <div className="relative">
                    <User className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={formData.payerName}
                      onChange={(e) => setFormData({ ...formData, payerName: e.target.value })}
                      placeholder="Enter your full name"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1D7B3C] focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Email *
                  </label>
                  <div className="relative">
                    <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={formData.payerEmail}
                      onChange={(e) => setFormData({ ...formData, payerEmail: e.target.value })}
                      placeholder="your@email.com"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1D7B3C] focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Phone (Optional)
                  </label>
                  <div className="relative">
                    <Phone className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      value={formData.payerPhone}
                      onChange={(e) => setFormData({ ...formData, payerPhone: e.target.value })}
                      placeholder="+234..."
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1D7B3C] focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Error */}
              {formError && (
                <div className="mt-4 flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-xl">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm">{formError}</span>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={paying}
                className="w-full mt-6 py-4 bg-[#1D7B3C] text-white rounded-xl font-medium hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {paying ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Pay {formatCurrency(linkDetails.amount)}
                  </>
                )}
              </button>
            </form>

            <p className="text-xs text-gray-500 text-center mt-4">
              Secure payment powered by Paystack
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PayForMe;
