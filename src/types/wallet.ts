// src/types/wallet.ts

// ==================== WALLET TYPES ====================

export interface WalletUser {
  firstName: string;
  lastName: string;
  email: string;
}

export interface WalletBalance {
  balance: number;
  currency: string;
  user: WalletUser;
}

export type TransactionType = 'credit' | 'debit' | 'refund';
export type TransactionStatus = 'pending' | 'completed' | 'failed';

export interface TransactionOrder {
  id: string;
  orderNumber: string;
  amount: number;
}

export interface WalletTransaction {
  id: string;
  type: TransactionType;
  amount: number;
  description: string;
  reference: string;
  balanceBefore: number;
  balanceAfter: number;
  status: TransactionStatus;
  order: TransactionOrder | null;
  createdAt: string;
}

export interface WalletTransactionPagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export interface WalletTransactionsResponse {
  transactions: WalletTransaction[];
  pagination: WalletTransactionPagination;
}

export interface WalletTransactionsParams {
  page?: number;
  limit?: number;
  type?: TransactionType;
  status?: TransactionStatus;
  startDate?: string;
  endDate?: string;
}

export interface FundWalletRequest {
  amount: number;
}

export interface FundWalletResponse {
  reference: string;
  authorizationUrl: string;
  accessCode: string;
  amount: number;
  transactionId: string;
}

export interface VerifyFundingResponse {
  status: 'completed' | 'pending' | 'failed';
  amount?: number;
  reference: string;
  newBalance?: number;
  message?: string;
}

export interface DebitWalletRequest {
  amount: number;
  orderId?: string;
  description?: string;
}

export interface DebitWalletResponse {
  transactionId: string;
  reference: string;
  amount: number;
  newBalance: number;
}

export interface InsufficientBalanceError {
  currentBalance: number;
  requiredAmount: number;
}

// ==================== PAYMENT LINK TYPES ====================

export type PaymentLinkStatus = 'active' | 'paid' | 'expired' | 'cancelled';

export interface PaymentLinkOrder {
  id: string;
  orderNumber: string;
  itemCount?: number;
}

export interface PaymentLink {
  id: string;
  code: string;
  amount: number;
  description: string;
  recipientName?: string;
  recipientPhone?: string;
  status: PaymentLinkStatus;
  expiresAt: string;
  shareableUrl: string;
  createdAt: string;
}

export interface PaymentLinkDetails {
  code: string;
  amount: number;
  description: string;
  recipientName?: string;
  status: PaymentLinkStatus;
  expiresAt: string;
  isExpired: boolean;
  isPaid: boolean;
  createdBy: string;
  order: {
    orderNumber: string;
    itemCount: number;
  } | null;
}

export interface PaymentLinkPaidBy {
  name: string;
  email: string;
  phone?: string;
}

export interface MyPaymentLink {
  id: string;
  code: string;
  amount: number;
  description: string;
  recipientName?: string;
  status: PaymentLinkStatus;
  expiresAt: string;
  paidBy: PaymentLinkPaidBy | null;
  paidAt: string | null;
  shareableUrl: string;
  order: {
    id: string;
    orderNumber: string;
  } | null;
  createdAt: string;
}

export interface CreatePaymentLinkRequest {
  amount: number;
  description: string;
  orderId?: string;
  recipientName?: string;
  recipientPhone?: string;
  expiresInDays?: number;
}

export interface CreatePaymentLinkResponse {
  id: string;
  code: string;
  amount: number;
  description: string;
  recipientName?: string;
  expiresAt: string;
  status: PaymentLinkStatus;
  shareableUrl: string;
  createdAt: string;
}

export interface PayViaLinkRequest {
  payerName: string;
  payerEmail: string;
  payerPhone?: string;
}

export interface PayViaLinkResponse {
  reference: string;
  authorizationUrl: string;
  accessCode: string;
  amount: number;
}

export interface VerifyLinkPaymentResponse {
  status: 'paid' | 'pending';
  paidAt?: string;
  amount?: number;
  message: string;
}

export interface MyPaymentLinksParams {
  page?: number;
  limit?: number;
  status?: PaymentLinkStatus;
}

export interface MyPaymentLinksResponse {
  links: MyPaymentLink[];
  pagination: WalletTransactionPagination;
}

export interface CancelPaymentLinkResponse {
  code: string;
  status: 'cancelled';
}
