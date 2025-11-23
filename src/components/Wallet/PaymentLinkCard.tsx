// src/components/Wallet/PaymentLinkCard.tsx
import { useState } from 'react';
import {
  Link2,
  Copy,
  Check,
  Share2,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  MoreVertical,
  Trash2,
  ExternalLink
} from 'lucide-react';
import type { MyPaymentLink, PaymentLinkStatus } from '@/types/wallet';

interface PaymentLinkCardProps {
  link: MyPaymentLink;
  onCancel?: (code: string) => void;
  isCompact?: boolean;
}

const PaymentLinkCard = ({ link, onCancel, isCompact = false }: PaymentLinkCardProps) => {
  const [copied, setCopied] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

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

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry.getTime() - now.getTime();

    if (diff <= 0) return 'Expired';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days}d ${hours}h left`;
    if (hours > 0) return `${hours}h left`;

    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${minutes}m left`;
  };

  const getStatusConfig = (status: PaymentLinkStatus) => {
    switch (status) {
      case 'active':
        return {
          icon: <Clock className="w-4 h-4" />,
          text: 'Active',
          bgColor: 'bg-blue-50',
          textColor: 'text-blue-600',
          borderColor: 'border-blue-200',
        };
      case 'paid':
        return {
          icon: <CheckCircle className="w-4 h-4" />,
          text: 'Paid',
          bgColor: 'bg-green-50',
          textColor: 'text-green-600',
          borderColor: 'border-green-200',
        };
      case 'expired':
        return {
          icon: <AlertCircle className="w-4 h-4" />,
          text: 'Expired',
          bgColor: 'bg-yellow-50',
          textColor: 'text-yellow-600',
          borderColor: 'border-yellow-200',
        };
      case 'cancelled':
        return {
          icon: <XCircle className="w-4 h-4" />,
          text: 'Cancelled',
          bgColor: 'bg-red-50',
          textColor: 'text-red-600',
          borderColor: 'border-red-200',
        };
      default:
        return {
          icon: <Clock className="w-4 h-4" />,
          text: status,
          bgColor: 'bg-gray-50',
          textColor: 'text-gray-600',
          borderColor: 'border-gray-200',
        };
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(link.shareableUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Payment Request',
          text: `${link.description} - ${formatCurrency(link.amount)}`,
          url: link.shareableUrl,
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

  const handleCancel = () => {
    setShowMenu(false);
    if (onCancel) {
      onCancel(link.code);
    }
  };

  const statusConfig = getStatusConfig(link.status);

  if (isCompact) {
    return (
      <div className="flex items-center justify-between py-3 px-4 bg-white border border-gray-100 rounded-lg hover:shadow-sm transition">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${statusConfig.bgColor}`}>
            <Link2 className={`w-4 h-4 ${statusConfig.textColor}`} />
          </div>
          <div>
            <p className="font-medium text-gray-900 text-sm truncate max-w-[200px]">
              {link.description}
            </p>
            <p className="text-xs text-gray-500">
              {link.recipientName ? `To: ${link.recipientName}` : link.code}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-semibold text-gray-900">{formatCurrency(link.amount)}</p>
          <span className={`text-xs ${statusConfig.textColor}`}>{statusConfig.text}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white border rounded-xl p-5 ${statusConfig.borderColor} hover:shadow-md transition`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${statusConfig.bgColor}`}>
            <Link2 className={`w-5 h-5 ${statusConfig.textColor}`} />
          </div>
          <div>
            <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${statusConfig.bgColor} ${statusConfig.textColor}`}>
              {statusConfig.icon}
              {statusConfig.text}
            </span>
          </div>
        </div>

        {link.status === 'active' && (
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-gray-100 rounded-full transition"
            >
              <MoreVertical className="w-4 h-4 text-gray-500" />
            </button>
            {showMenu && (
              <div className="absolute right-0 mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <button
                  onClick={handleCancel}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
                >
                  <Trash2 className="w-4 h-4" />
                  Cancel Link
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Amount & Description */}
      <div className="mb-4">
        <h3 className="text-2xl font-bold text-gray-900">{formatCurrency(link.amount)}</h3>
        <p className="text-gray-600 mt-1 line-clamp-2">{link.description}</p>
      </div>

      {/* Details */}
      <div className="space-y-2 mb-4 text-sm">
        {link.recipientName && (
          <div className="flex justify-between text-gray-600">
            <span>Recipient:</span>
            <span className="font-medium text-gray-900">{link.recipientName}</span>
          </div>
        )}
        <div className="flex justify-between text-gray-600">
          <span>Created:</span>
          <span className="font-medium text-gray-900">{formatDate(link.createdAt)}</span>
        </div>
        {link.status === 'active' && (
          <div className="flex justify-between text-gray-600">
            <span>Expires:</span>
            <span className="font-medium text-orange-600">{getTimeRemaining(link.expiresAt)}</span>
          </div>
        )}
        {link.paidBy && (
          <div className="flex justify-between text-gray-600">
            <span>Paid by:</span>
            <span className="font-medium text-green-600">{link.paidBy.name}</span>
          </div>
        )}
        {link.paidAt && (
          <div className="flex justify-between text-gray-600">
            <span>Paid on:</span>
            <span className="font-medium text-gray-900">{formatDate(link.paidAt)}</span>
          </div>
        )}
        {link.order && (
          <div className="flex justify-between text-gray-600">
            <span>Order:</span>
            <span className="font-medium text-gray-900">#{link.order.orderNumber}</span>
          </div>
        )}
      </div>

      {/* Link Code */}
      <div className="bg-gray-50 rounded-lg p-3 mb-4">
        <div className="flex items-center justify-between">
          <code className="text-sm font-mono text-gray-700">{link.code}</code>
          <a
            href={link.shareableUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#1D7B3C] hover:underline text-sm flex items-center gap-1"
          >
            <ExternalLink className="w-3 h-3" />
            View
          </a>
        </div>
      </div>

      {/* Actions */}
      {link.status === 'active' && (
        <div className="flex gap-2">
          <button
            onClick={handleCopyLink}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
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
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#1D7B3C] text-white rounded-lg text-sm font-medium hover:bg-green-700 transition"
          >
            <Share2 className="w-4 h-4" />
            Share
          </button>
        </div>
      )}
    </div>
  );
};

export default PaymentLinkCard;
