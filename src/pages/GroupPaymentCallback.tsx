// src/pages/GroupPaymentCallback.tsx
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useVerifyPaymentQuery } from '@/redux/api/groupOrdersApi';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { CheckCircle, XCircle } from 'lucide-react';

const GroupPaymentCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const reference = searchParams.get('reference');

  const { data, error, isLoading } = useVerifyPaymentQuery(reference || '', {
    skip: !reference,
  });

  useEffect(() => {
    if (data?.success) {
      // Backend returns groupId directly in data, not nested in data.group
      const groupId = (data.data as any)?.groupId || data.data?.group?.groupId;

      if (groupId) {
        console.log('[GroupPaymentCallback] Redirecting to group:', groupId);
        // Payment verified successfully, redirect to group page after a short delay
        const timer = setTimeout(() => {
          navigate(`/group/${groupId}`, { replace: true });
        }, 2000);
        return () => clearTimeout(timer);
      } else {
        console.error('[GroupPaymentCallback] No groupId found in response:', data);
      }
    } else if (data && !data.success) {
      console.error('[GroupPaymentCallback] Payment verification failed:', data);
    }
  }, [data, navigate]);

  if (!reference) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white rounded-3xl shadow-sm p-8 max-w-md w-full text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Invalid Payment Reference</h2>
          <p className="text-gray-600 mb-6">
            No payment reference found. Please try again.
          </p>
          <button
            type="button"
            onClick={() => navigate('/group-sharing')}
            className="w-full bg-[#1D7B3C] text-white px-6 py-3 rounded-full hover:bg-[#166430] transition-colors"
          >
            Browse Groups
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="text-gray-600 mt-4 text-lg">Verifying your payment...</p>
        </div>
      </div>
    );
  }

  if (error || !data?.success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white rounded-3xl shadow-sm p-8 max-w-md w-full text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Verification Failed</h2>
          <p className="text-gray-600 mb-6">
            We couldn't verify your payment. Please contact support if you were charged.
          </p>
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => navigate('/group-sharing')}
              className="w-full bg-[#1D7B3C] text-white px-6 py-3 rounded-full hover:bg-[#166430] transition-colors"
            >
              Browse Groups
            </button>
            <button
              type="button"
              onClick={() => navigate('/profile/orders')}
              className="w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-full hover:bg-gray-200 transition-colors"
            >
              View My Orders
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-3xl shadow-sm p-8 max-w-md w-full text-center">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
        <p className="text-gray-600 mb-6">
          Your payment has been verified. Redirecting you to your group...
        </p>
        <div className="animate-pulse text-sm text-gray-500">
          Please wait...
        </div>
      </div>
    </div>
  );
};

export default GroupPaymentCallback;
