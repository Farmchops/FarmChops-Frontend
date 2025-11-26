// src/pages/profile/Wallet.tsx
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Plus,
  History,
  TrendingUp,
  TrendingDown,
  RefreshCw,
} from 'lucide-react';
import { useGetWalletBalanceQuery, useGetWalletTransactionsQuery } from '@/redux/api/walletApi';
import { WalletBalanceCard, TransactionItem } from '@/components/Wallet';

const Wallet = () => {
  const navigate = useNavigate();

  const { data: balanceData, isLoading: balanceLoading, refetch: refetchBalance } = useGetWalletBalanceQuery();
  const { data: transactionsData, isLoading: transactionsLoading } = useGetWalletTransactionsQuery({
    page: 1,
    limit: 5,
  });

  const balance = balanceData?.data?.balance ?? 0;
  const transactions = transactionsData?.data?.transactions ?? [];

  // Calculate quick stats from recent transactions
  const recentCredits = transactions
    .filter((t) => t.type === 'credit' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const recentDebits = transactions
    .filter((t) => t.type === 'debit' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Wallet</h1>
          <p className="text-gray-600 text-sm mt-1">Manage your wallet and transactions</p>
        </div>
        <button
          onClick={() => refetchBalance()}
          className="p-2 hover:bg-gray-100 rounded-full transition"
          title="Refresh"
        >
          <RefreshCw className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Balance Card */}
      <WalletBalanceCard
        balance={balance}
        isLoading={balanceLoading}
        onFundWallet={() => navigate('/profile/wallet/fund')}
      />

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3 mt-6">
        <button
          onClick={() => navigate('/profile/wallet/fund')}
          className="flex flex-col items-center gap-2 p-4 bg-green-50 rounded-xl hover:bg-green-100 transition"
        >
          <div className="w-10 h-10 bg-[#1D7B3C] rounded-full flex items-center justify-center">
            <Plus className="w-5 h-5 text-white" />
          </div>
          <span className="text-sm font-medium text-gray-700">Fund Wallet</span>
        </button>

        <button
          onClick={() => navigate('/profile/wallet/transactions')}
          className="flex flex-col items-center gap-2 p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition"
        >
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
            <History className="w-5 h-5 text-white" />
          </div>
          <span className="text-sm font-medium text-gray-700">History</span>
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4 mt-6">
        <div className="bg-green-50 border border-green-100 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Recent Income</p>
              <p className="text-lg font-bold text-green-600">{formatCurrency(recentCredits)}</p>
            </div>
          </div>
        </div>

        <div className="bg-red-50 border border-red-100 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Recent Expenses</p>
              <p className="text-lg font-bold text-red-600">{formatCurrency(recentDebits)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
          <button
            onClick={() => navigate('/profile/wallet/transactions')}
            className="flex items-center gap-1 text-sm text-[#1D7B3C] hover:underline"
          >
            View All
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl divide-y divide-gray-100">
          {transactionsLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1D7B3C] mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading transactions...</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="p-8 text-center">
              <History className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No transactions yet</p>
              <button
                onClick={() => navigate('/profile/wallet/fund')}
                className="mt-4 text-sm text-[#1D7B3C] hover:underline"
              >
                Fund your wallet to get started
              </button>
            </div>
          ) : (
            transactions.map((transaction) => (
              <TransactionItem key={transaction.id} transaction={transaction} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Wallet;
