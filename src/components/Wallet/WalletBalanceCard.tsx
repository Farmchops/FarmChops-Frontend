// src/components/Wallet/WalletBalanceCard.tsx
import { Wallet, Plus, ArrowUpRight, ArrowDownLeft, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface WalletBalanceCardProps {
  balance: number;
  currency?: string;
  isLoading?: boolean;
  onFundWallet?: () => void;
}

const WalletBalanceCard = ({
  balance,
  currency = 'NGN',
  isLoading = false,
  onFundWallet,
}: WalletBalanceCardProps) => {
  const navigate = useNavigate();
  const [showBalance, setShowBalance] = useState(true);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleFundWallet = () => {
    if (onFundWallet) {
      onFundWallet();
    } else {
      navigate('/profile/wallet/fund');
    }
  };

  return (
    <div className="bg-gradient-to-br from-[#1D7B3C] to-[#145a2b] rounded-2xl p-6 text-white shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <Wallet className="w-5 h-5" />
          </div>
          <span className="font-medium">Wallet Balance</span>
        </div>
        <button
          onClick={() => setShowBalance(!showBalance)}
          className="p-2 hover:bg-white/10 rounded-full transition"
        >
          {showBalance ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
        </button>
      </div>

      {/* Balance */}
      <div className="mb-6">
        {isLoading ? (
          <div className="h-10 bg-white/20 rounded animate-pulse w-40"></div>
        ) : (
          <h2 className="text-3xl md:text-4xl font-bold">
            {showBalance ? formatCurrency(balance) : '****'}
          </h2>
        )}
        <p className="text-white/70 text-sm mt-1">Available Balance</p>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={handleFundWallet}
          className="flex-1 flex items-center justify-center gap-2 bg-white text-[#1D7B3C] py-3 rounded-xl font-medium hover:bg-green-50 transition"
        >
          <Plus className="w-4 h-4" />
          Fund Wallet
        </button>
        <button
          onClick={() => navigate('/profile/wallet/transactions')}
          className="flex items-center justify-center gap-2 bg-white/20 py-3 px-4 rounded-xl font-medium hover:bg-white/30 transition"
        >
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>

      {/* Quick Stats */}
      <div className="flex gap-4 mt-6 pt-4 border-t border-white/20">
        <div className="flex items-center gap-2 text-sm">
          <div className="w-8 h-8 bg-green-400/30 rounded-full flex items-center justify-center">
            <ArrowDownLeft className="w-4 h-4 text-green-300" />
          </div>
          <span className="text-white/70">Income</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="w-8 h-8 bg-red-400/30 rounded-full flex items-center justify-center">
            <ArrowUpRight className="w-4 h-4 text-red-300" />
          </div>
          <span className="text-white/70">Expenses</span>
        </div>
      </div>
    </div>
  );
};

export default WalletBalanceCard;
