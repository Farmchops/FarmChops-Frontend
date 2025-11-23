// src/components/Wallet/TransactionItem.tsx
import { ArrowDownLeft, ArrowUpRight, RotateCcw, Package, Clock, CheckCircle, XCircle } from 'lucide-react';
import type { WalletTransaction, TransactionType, TransactionStatus } from '@/types/wallet';

interface TransactionItemProps {
  transaction: WalletTransaction;
  showDate?: boolean;
}

const TransactionItem = ({ transaction, showDate = true }: TransactionItemProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-NG', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-NG', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTypeIcon = (type: TransactionType) => {
    switch (type) {
      case 'credit':
        return <ArrowDownLeft className="w-4 h-4 text-green-600" />;
      case 'debit':
        return <ArrowUpRight className="w-4 h-4 text-red-600" />;
      case 'refund':
        return <RotateCcw className="w-4 h-4 text-blue-600" />;
      default:
        return <Package className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTypeBackground = (type: TransactionType) => {
    switch (type) {
      case 'credit':
        return 'bg-green-100';
      case 'debit':
        return 'bg-red-100';
      case 'refund':
        return 'bg-blue-100';
      default:
        return 'bg-gray-100';
    }
  };

  const getStatusBadge = (status: TransactionStatus) => {
    switch (status) {
      case 'completed':
        return (
          <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
            <CheckCircle className="w-3 h-3" />
            Completed
          </span>
        );
      case 'pending':
        return (
          <span className="flex items-center gap-1 text-xs text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        );
      case 'failed':
        return (
          <span className="flex items-center gap-1 text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
            <XCircle className="w-3 h-3" />
            Failed
          </span>
        );
      default:
        return null;
    }
  };

  const getAmountColor = (type: TransactionType) => {
    switch (type) {
      case 'credit':
      case 'refund':
        return 'text-green-600';
      case 'debit':
        return 'text-red-600';
      default:
        return 'text-gray-900';
    }
  };

  const getAmountPrefix = (type: TransactionType) => {
    switch (type) {
      case 'credit':
      case 'refund':
        return '+';
      case 'debit':
        return '-';
      default:
        return '';
    }
  };

  return (
    <div className="flex items-center justify-between py-4 px-4 hover:bg-gray-50 rounded-lg transition">
      {/* Left: Icon + Details */}
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getTypeBackground(transaction.type)}`}>
          {getTypeIcon(transaction.type)}
        </div>
        <div>
          <p className="font-medium text-gray-900 text-sm">{transaction.description}</p>
          <div className="flex items-center gap-2 mt-1">
            {showDate && (
              <span className="text-xs text-gray-500">
                {formatDate(transaction.createdAt)} at {formatTime(transaction.createdAt)}
              </span>
            )}
            {transaction.order && (
              <span className="text-xs text-gray-400">
                • Order #{transaction.order.orderNumber}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right: Amount + Status */}
      <div className="text-right">
        <p className={`font-semibold ${getAmountColor(transaction.type)}`}>
          {getAmountPrefix(transaction.type)}{formatCurrency(transaction.amount)}
        </p>
        <div className="mt-1">
          {getStatusBadge(transaction.status)}
        </div>
      </div>
    </div>
  );
};

export default TransactionItem;
