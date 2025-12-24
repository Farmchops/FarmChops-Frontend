// Marketing & Discount System Types

// Marketer Types
export interface Marketer {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  marketingCode: string;
  status: 'active' | 'inactive' | 'suspended';
  commissionRate: number;
  // NOTE: attributionWindowDays REMOVED - Commission is now FIRST ORDER ONLY

  // Stats
  totalSignups: number;
  totalOrders: number;
  totalRevenue: number;  // in kobo
  totalCommission: number;  // in kobo

  // Commission payment tracking
  lastPaidAt?: Date;
  lastPaidAmount?: number;  // in kobo
  unpaidCommission: number;  // in kobo

  // Admin tracking
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;

  // Optional user account link
  userId?: string;
}

export interface CreateMarketerPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  marketingCode?: string;  // Optional, auto-generated if not provided
  commissionRate?: number;  // Default: 10
  // NOTE: attributionWindowDays REMOVED - Commission is FIRST ORDER ONLY
}

export interface UpdateMarketerPayload {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  status?: 'active' | 'inactive' | 'suspended';
  commissionRate?: number;
}

// Coupon Types
export interface Coupon {
  _id: string;
  code: string;
  description: string;

  // Discount configuration
  discountType: 'percentage' | 'fixed_amount' | 'free_delivery';
  discountValue: number;  // Percentage or amount in kobo
  maxDiscountAmount?: number;  // Max discount in kobo (for percentage types)

  // Usage rules
  minOrderAmount?: number;  // Minimum order in kobo
  maxUsesTotal?: number;  // Total times this code can be used (null = unlimited)
  maxUsesPerUser: number;  // Times per user (default: 1)
  currentUses: number;  // Current total usage count

  // Validity
  validFrom?: Date;
  validUntil?: Date;
  status: 'active' | 'inactive' | 'expired';

  // Tracking
  createdBy?: string;
  usedBy: string[];  // Array of user IDs

  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCouponPayload {
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed_amount' | 'free_delivery';
  discountValue: number;
  maxDiscountAmount?: number;
  minOrderAmount?: number;
  maxUsesTotal?: number;
  maxUsesPerUser?: number;
  validFrom?: string;  // ISO date string
  validUntil?: string;  // ISO date string
}

export interface UpdateCouponPayload {
  code?: string;
  description?: string;
  discountType?: 'percentage' | 'fixed_amount' | 'free_delivery';
  discountValue?: number;
  maxDiscountAmount?: number;
  minOrderAmount?: number;
  maxUsesTotal?: number;
  maxUsesPerUser?: number;
  validFrom?: string;
  validUntil?: string;
  status?: 'active' | 'inactive' | 'expired';
}

// Discount Types
export interface DiscountCalculation {
  type: 'first_time' | 'coupon' | 'marketer_promo';
  code?: string;
  description: string;
  amount: number;  // in kobo
  applied: boolean;
}

export interface OrderDiscountResponse {
  subtotal: number;  // in kobo
  discounts: DiscountCalculation[];
  bestDiscount?: DiscountCalculation;
  totalDiscount: number;  // in kobo
  finalSubtotal: number;  // in kobo
}

// Referral Code Validation
export interface ReferralCodeValidation {
  isValid: boolean;
  marketerName?: string;
  message?: string;
}

// Coupon Validation
export interface CouponValidation {
  isValid: boolean;
  coupon?: {
    code: string;
    discountType: string;
    discountValue: number;
    maxDiscountAmount?: number;
  };
  calculatedDiscount?: number;  // in kobo
  finalAmount?: number;  // in kobo
  message?: string;
}

// Marketing Reports
export interface MarketerReportMetrics {
  newSignups: number;
  totalOrders: number;
  totalRevenue: number;  // in kobo
  totalCommission: number;  // in kobo
  averageOrderValue: number;  // in kobo
  conversionRate: number;  // percentage
  unpaidCommission: number;  // in kobo
}

export interface TopProduct {
  productName: string;
  orderCount: number;
  revenue: number;  // in kobo
}

export interface MarketerReport {
  marketer: {
    _id: string;
    firstName: string;
    lastName: string;
    marketingCode: string;
  };
  period: {
    startDate: string;
    endDate: string;
  };
  metrics: MarketerReportMetrics;
  topProducts: TopProduct[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  recentOrders: any[];  // Define based on your Order type
}

export interface AllMarketersReportSummary {
  totalMarketers: number;
  activeMarketers: number;
  totalSignups: number;
  totalOrders: number;
  totalRevenue: number;  // in kobo
  totalCommission: number;  // in kobo
  totalUnpaidCommission: number;  // in kobo
}

export interface MarketerSummary {
  marketerId: string;
  name: string;
  code: string;
  signups: number;
  orders: number;
  revenue: number;  // in kobo
  commission: number;  // in kobo
  unpaidCommission: number;  // in kobo
}

export interface AllMarketersReport {
  period: {
    startDate: string;
    endDate: string;
  };
  summary: AllMarketersReportSummary;
  marketers: MarketerSummary[];
}

// Commission Payment
export interface CommissionPayment {
  _id: string;
  marketer: string;  // Marketer ID

  // Payment period
  periodStart: Date;
  periodEnd: Date;

  // Payment details
  totalOrders: number;
  totalRevenue: number;  // in kobo
  commissionRate: number;
  commissionAmount: number;  // in kobo

  // Payment tracking
  status: 'pending' | 'paid' | 'cancelled';
  paidAt?: Date;
  paidBy?: string;  // Admin ID
  paymentMethod?: 'bank_transfer' | 'cash' | 'wallet';
  paymentReference?: string;

  // Order references
  orders: string[];  // Array of Order IDs

  notes?: string;

  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCommissionPaymentPayload {
  periodStart: string;  // ISO date string
  periodEnd: string;  // ISO date string
  commissionAmount: number;  // in kobo
  paymentMethod: 'bank_transfer' | 'cash' | 'wallet';
  paymentReference: string;
  notes?: string;
}

// Coupon Usage Report
export interface CouponUsageMetrics {
  totalUses: number;
  totalDiscount: number;  // in kobo
  totalRevenue: number;  // in kobo
  averageDiscount: number;  // in kobo
  uniqueUsers: number;
}

export interface CouponUsageReport {
  coupon: {
    code: string;
    discountType: string;
    discountValue: number;
  };
  metrics: CouponUsageMetrics;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  recentUses: any[];  // Define based on your needs
}

// Pagination
export interface PaginationParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  sortBy?: string;
  order?: 'asc' | 'desc';
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  pages: number;
}
