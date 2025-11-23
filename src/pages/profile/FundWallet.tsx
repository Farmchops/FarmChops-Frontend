// src/pages/profile/FundWallet.tsx
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  Wallet,
  CreditCard,
  Shield,
  AlertCircle,
  CheckCircle,
  Loader2,
} from 'lucide-react';
import {
  useGetWalletBalanceQuery,
  useFundWalletMutation,
  useLazyVerifyWalletFundingQuery,
} from '@/redux/api/walletApi';

const PRESET_AMOUNTS = [1000, 2000, 5000, 10000, 20000, 50000];

const FundWallet = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Check if returning from payment
  const paymentReference = searchParams.get('reference');
  const paymentStatus = searchParams.get('status');

  const [amount, setAmount] = useState<number | ''>('');
  const [error, setError] = useState<string | null>(null);

  const { data: balanceData, isLoading: balanceLoading } = useGetWalletBalanceQuery();
  const [fundWallet, { isLoading: fundingLoading }] = useFundWalletMutation();
  const [verifyFunding, { data: verifyData, isLoading: verifyLoading }] =
    useLazyVerifyWalletFundingQuery();

  const currentBalance = balanceData?.data?.balance ?? 0;

  // Verify payment if returning from Paystack
  useState(() => {
    if (paymentReference) {
      verifyFunding(paymentReference);
    }
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setAmount(value ? parseInt(value, 10) : '');
    setError(null);
  };

  const handlePresetAmount = (presetAmount: number) => {
    setAmount(presetAmount);
    setError(null);
  };

  const handleFundWallet = async () => {
    if (!amount || amount < 100) {
      setError('Minimum amount is ₦100');
      return;
    }

    if (amount > 10000000) {
      setError('Maximum amount is ₦10,000,000');
      return;
    }

    setError(null);

    try {
      const response = await fundWallet({ amount }).unwrap();

      if (response.success && response.data?.authorizationUrl) {
        // Redirect to Paystack
        window.location.href = response.data.authorizationUrl;
      } else {
        setError('Failed to initialize payment. Please try again.');
      }
    } catch (err: unknown) {
      const errorMessage = err && typeof err === 'object' && 'data' in err
        ? (err as { data?: { message?: string } }).data?.message
        : 'Failed to fund wallet. Please try again.';
      setError(errorMessage || 'Failed to fund wallet. Please try again.');
    }
  };

  // Show verification result if returning from payment
  if (paymentReference) {
    return (
      <div className="py-6">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate('/profile/wallet')}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Payment Verification</h1>
        </div>

        <div className="max-w-md mx-auto">
          {verifyLoading ? (
            <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center">
              <Loader2 className="w-12 h-12 text-[#1D7B3C] animate-spin mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Verifying Payment
              </h3>
              <p className="text-gray-600">Please wait while we confirm your payment...</p>
            </div>
          ) : verifyData?.data?.status === 'completed' ? (
            <div className="bg-white border border-green-200 rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Payment Successful!
              </h3>
              <p className="text-gray-600 mb-4">
                {formatCurrency(verifyData.data.amount || 0)} has been added to your wallet.
              </p>
              <p className="text-2xl font-bold text-[#1D7B3C] mb-6">
                New Balance: {formatCurrency(verifyData.data.newBalance || 0)}
              </p>
              <button
                onClick={() => navigate('/profile/wallet')}
                className="w-full py-3 bg-[#1D7B3C] text-white rounded-xl font-medium hover:bg-green-700 transition"
              >
                Go to Wallet
              </button>
            </div>
          ) : verifyData?.data?.status === 'pending' ? (
            <div className="bg-white border border-yellow-200 rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Loader2 className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Payment Processing
              </h3>
              <p className="text-gray-600 mb-6">
                Your payment is still being processed. This may take a few moments.
              </p>
              <button
                onClick={() => verifyFunding(paymentReference)}
                className="w-full py-3 bg-yellow-600 text-white rounded-xl font-medium hover:bg-yellow-700 transition mb-3"
              >
                Check Again
              </button>
              <button
                onClick={() => navigate('/profile/wallet')}
                className="w-full py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition"
              >
                Go to Wallet
              </button>
            </div>
          ) : (
            <div className="bg-white border border-red-200 rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Payment Failed
              </h3>
              <p className="text-gray-600 mb-6">
                {verifyData?.message || 'We could not verify your payment. Please try again.'}
              </p>
              <button
                onClick={() => navigate('/profile/wallet/fund', { replace: true })}
                className="w-full py-3 bg-[#1D7B3C] text-white rounded-xl font-medium hover:bg-green-700 transition mb-3"
              >
                Try Again
              </button>
              <button
                onClick={() => navigate('/profile/wallet')}
                className="w-full py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition"
              >
                Go to Wallet
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/profile/wallet')}
          className="p-2 hover:bg-gray-100 rounded-full transition"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fund Wallet</h1>
          <p className="text-gray-600 text-sm mt-1">Add money to your FarmChops wallet</p>
        </div>
      </div>

      <div className="max-w-md mx-auto">
        {/* Current Balance */}
        <div className="bg-gradient-to-br from-[#1D7B3C] to-[#145a2b] rounded-xl p-4 text-white mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <p className="text-white/70 text-sm">Current Balance</p>
              <p className="text-xl font-bold">
                {balanceLoading ? '...' : formatCurrency(currentBalance)}
              </p>
            </div>
          </div>
        </div>

        {/* Amount Input */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Enter Amount
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg font-medium">
              ₦
            </span>
            <input
              type="text"
              value={amount}
              onChange={handleAmountChange}
              placeholder="0"
              className="w-full pl-10 pr-4 py-4 text-2xl font-bold border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1D7B3C] focus:border-transparent"
            />
          </div>
          {amount && (
            <p className="text-sm text-gray-500 mt-2">
              New balance will be: {formatCurrency(currentBalance + (typeof amount === 'number' ? amount : 0))}
            </p>
          )}

          {/* Preset Amounts */}
          <div className="mt-4">
            <p className="text-sm text-gray-600 mb-2">Quick select</p>
            <div className="grid grid-cols-3 gap-2">
              {PRESET_AMOUNTS.map((preset) => (
                <button
                  key={preset}
                  onClick={() => handlePresetAmount(preset)}
                  className={`py-2 px-3 rounded-lg text-sm font-medium transition ${
                    amount === preset
                      ? 'bg-[#1D7B3C] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {formatCurrency(preset)}
                </button>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}
        </div>

        {/* Payment Method */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
          <h3 className="font-medium text-gray-900 mb-3">Payment Method</h3>
          <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-[#1D7B3C]" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">Card / Bank Transfer</p>
              <p className="text-sm text-gray-600">Pay securely via Paystack</p>
            </div>
            <div className="w-4 h-4 bg-[#1D7B3C] rounded-full flex items-center justify-center">
              <CheckCircle className="w-3 h-3 text-white" />
            </div>
          </div>
        </div>

        {/* Fund Button */}
        <button
          onClick={handleFundWallet}
          disabled={!amount || amount < 100 || fundingLoading}
          className="w-full py-4 bg-[#1D7B3C] text-white rounded-xl font-medium hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {fundingLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Wallet className="w-5 h-5" />
              Fund Wallet {amount ? `with ${formatCurrency(typeof amount === 'number' ? amount : 0)}` : ''}
            </>
          )}
        </button>

        {/* Security Note */}
        <div className="mt-6 flex items-start gap-3 text-sm text-gray-600">
          <Shield className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
          <p>
            Your payment is secured by Paystack. We do not store your card details.
            All transactions are encrypted and protected.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FundWallet;
