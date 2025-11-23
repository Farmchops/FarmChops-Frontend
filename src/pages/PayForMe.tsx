// src/pages/PayForMe.tsx
import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import {
  Link2,
  AlertCircle,
  Loader2,
  CheckCircle,
  Clock,
  XCircle,
  ShoppingBag,
  CreditCard,
} from 'lucide-react';
import {
  useGetPaymentLinkDetailsQuery,
  usePayViaPaymentLinkMutation,
  useLazyVerifyPaymentLinkPaymentQuery,
} from '@/redux/api/walletApi';

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

  const [error, setError] = useState<string | null>(null);

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

  // Handle Pay Now - No form needed, Paystack collects payer details
  const handlePayNow = async () => {
    setError(null);

    try {
      const response = await payViaLink({
        code: code!,
        data: {}, // No payer details needed - Paystack will collect them
      }).unwrap();

      if (response.success && response.data?.authorizationUrl) {
        window.location.href = response.data.authorizationUrl;
      } else {
        setError('Failed to initialize payment');
      }
    } catch (err: unknown) {
      const errorMessage = err && typeof err === 'object' && 'data' in err
        ? (err as { data?: { message?: string } }).data?.message
        : 'Failed to process payment';
      setError(errorMessage || 'Failed to process payment');
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#1D7B3C] animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading payment details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (fetchError || !linkDetails) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
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
            type="button"
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-[#1D7B3C] text-white rounded-xl font-medium hover:bg-green-700 transition"
          >
            Go to Homepage
          </button>
        </div>
      </div>
    );
  }

  // Payment verification state
  if (paymentReference) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
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
                type="button"
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
                  type="button"
                  onClick={() => verifyPayment({ code: code!, reference: paymentReference })}
                  className="flex-1 py-3 bg-[#1D7B3C] text-white rounded-xl font-medium hover:bg-green-700 transition"
                >
                  Check Again
                </button>
                <button
                  type="button"
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
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className={`max-w-md w-full bg-white border ${status.borderColor} rounded-2xl p-8 text-center`}>
          <div className={`w-16 h-16 ${status.bgColor} rounded-full flex items-center justify-center mx-auto mb-4`}>
            {status.icon}
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {status.title}
          </h2>
          <p className="text-gray-600 mb-6">{status.message}</p>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-[#1D7B3C] text-white rounded-xl font-medium hover:bg-green-700 transition"
          >
            Go to Homepage
          </button>
        </div>
      </div>
    );
  }

  // Active payment link - show payment card with Pay Now button (like Chowdeck)
  return (
    <div className="py-8 px-4 flex items-center justify-center">
        <div className="max-w-md w-full">
          {/* Payment Request Card */}
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-lg">
            {/* Header */}
            <div className="bg-gradient-to-br from-[#1D7B3C] to-[#145a2b] p-6 text-white text-center">
              <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Link2 className="w-7 h-7" />
              </div>
              <p className="text-white/80 text-sm mb-2">Payment Request from</p>
              <p className="text-xl font-semibold mb-4">{linkDetails.createdBy}</p>
              <h2 className="text-4xl font-bold">
                {formatCurrency(linkDetails.amount)}
              </h2>
            </div>

            {/* Details */}
            <div className="p-6">
              {/* Description */}
              <div className="mb-4 pb-4 border-b border-gray-100">
                <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">For</p>
                <p className="text-gray-900 font-medium">{linkDetails.description}</p>
              </div>

              {/* Recipient Name */}
              {linkDetails.recipientName && (
                <div className="mb-4 pb-4 border-b border-gray-100">
                  <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Requested For</p>
                  <p className="text-gray-900 font-medium">{linkDetails.recipientName}</p>
                </div>
              )}

              {/* Order Info */}
              {linkDetails.order && (
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl mb-4">
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

              {/* Expiry */}
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-6">
                <Clock className="w-4 h-4" />
                <span>Expires {formatDate(linkDetails.expiresAt)}</span>
              </div>

              {/* Error */}
              {error && (
                <div className="mb-4 flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-xl">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              {/* Pay Now Button */}
              <button
                type="button"
                onClick={handlePayNow}
                disabled={paying}
                className="w-full py-4 bg-[#1D7B3C] text-white rounded-xl font-semibold text-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {paying ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    Pay {formatCurrency(linkDetails.amount)}
                  </>
                )}
              </button>

              <p className="text-xs text-gray-400 text-center mt-4">
                Secure payment powered by Paystack
              </p>
            </div>
          </div>
        </div>
    </div>
  );
};

export default PayForMe;
