/* eslint-disable @typescript-eslint/no-explicit-any */
// src/types/order.ts
import type { PaginationMeta } from "./api";

export type StageOwnerRole = 'operations' | 'processing' | 'packaging' | 'logistics' | 'rider' | 'support' | 'supervisor' | 'customer_support' | 'finance';

export type OrderStatus =
    | 'pending_payment'
    | 'ready_for_processing'
    | 'processing'
    | 'packed'
    | 'ready_for_dispatch'
    | 'awaiting_pickup'
    | 'en_route'
    | 'delivered'
    | 'completed'
    | 'cancelled'
    | 'failed_delivery';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type PaymentMethod = 'paystack' | 'pay_later' | 'wallet';

// Order Item
export interface OrderItem {
    product: {
        _id: string;
        name: string;
        images: string[];
        isLowStock: boolean;
        bulkSavings: any;
        id: string;
    };
    productName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    deal?: {
        _id: string;
        title: string;
        discountPercentage: number;
    };
}

// Status History
export interface StatusHistoryActor {
    id: string;
    name: string;
    role: StageOwnerRole | string;
}

export interface StatusHistory {
    status: OrderStatus;
    timestamp: string;
    note?: string;
    updatedBy?: StatusHistoryActor;
    role?: StageOwnerRole | string;
    metadata?: Record<string, unknown> | null;
    _id?: string;
    id?: string;
}

// Delivery Info
export interface DeliveryInfo {
    address: string;
    city: string;
    state?: string;
    phoneNumber: string;
    country?: string;
    postalCode?: string;
}

// Delivery Details (from checkout response)
export interface DeliveryDetails {
    address: string;
    distanceKm: number;
    durationSeconds: number;
    distanceText: string;
    durationText: string;
    fee: number;
}

// Customer Info
export interface CustomerInfo {
    name: string;
    phone: string;
}

// Payment Authorization
export interface PaymentAuthorization {
    authorization_code: string;
    bin: string;
    last4: string;
    exp_month: string;
    exp_year: string;
    channel: string;
    card_type: string;
    bank: string;
    country_code: string;
    brand: string;
    reusable: boolean;
    signature: string;
    account_name: string | null;
}

// Payment Provider Response (Paystack)
export interface PaymentProviderResponse {
    id: number;
    domain: string;
    status: string;
    reference: string;
    amount: number;
    gateway_response: string;
    paid_at: string;
    created_at: string;
    channel: string;
    currency: string;
    fees: number;
    authorization: PaymentAuthorization;
    customer: {
        id: number;
        email: string;
        customer_code: string;
    };
    paidAt?: string;
    createdAt?: string;
    requested_amount: number;
    transaction_date: string;
}

// Order Summary
export interface OrderSummary {
    totalItems: number;
    ItemCount: number;
    totalAmountInNaira: number;
    status: OrderStatus;
    paymentStatus: PaymentStatus;
}

// Full Order
export interface Order {
    _id: string;
    user: string | {
        _id: string;
        email: string;
        firstName: string;
        lastName: string;
        id: string;
    };
    items: OrderItem[];
    subtotal: number;
    deliveryFee: number;
    tax?: number; // 7.5% tax (optional for backward compatibility with old orders)
    totalAmount: number;
    paymentMethod: PaymentMethod;
    paymentStatus: PaymentStatus;
    orderStatus: OrderStatus;
    currentStageOwnerRole?: StageOwnerRole | string;
    paymentReference: string;
    paymentProvider: string;
    providerResponse: PaymentProviderResponse | null;
    deliveryInfo: DeliveryInfo;
    statusHistory: StatusHistory[];
    blockers?: Array<{ code: string; message: string; severity?: 'info' | 'warning' | 'critical'; data?: Record<string, unknown> }>;
    assignedRider?: {
        id: string;
        name: string;
        phone?: string;
    } | null;
    handoverCodeIssuedAt?: string | null;
    handoverCodeMasked?: string | null;
    handoverCodeActive?: boolean;
    handoverCodeExpiresAt?: string | null;
    handoverVerifiedAt?: string | null;
    createdAt: string;
    updatedAt: string;
    orderNumber: string;
    totalItems: number;
    summary: OrderSummary;
    id: string;
    notes?: string; // buyer note from checkout
    payLaterInfo?: {
        isPaid: boolean;
        repaymentTransaction: any[];
    };
    groupOrder?: {
        isGroupOrder: boolean;
        participants: any[];
    };
}


// Checkout Request
export interface CheckoutRequest {
    name: string;
    phone: string;
    address: string;
    notes?: string;
    country?: string;
    postalCode?: string;
}

// Checkout Response
export interface CheckoutResponse {
    cart: {
        items: Array<{
            productId: string;
            name: string;
            image: string;
            price: number;
            quantity: number;
            unit: string;
            priceType: 'retail' | 'bulk';
            minQuantity: number;
        }>;
        totalItems: number;
        totalAmount: number;
        lastUpdated: string;
    };
    customerInfo: CustomerInfo;
    delivery: DeliveryDetails;
    notes?: string;
    totals: {
        subtotal: number;
        deliveryFee: number;
        tax: number; // 7.5% tax on subtotal
        grandTotal: number;
    };
}

// Create Order Request
export interface CreateOrderRequest {
    deliveryInfo: DeliveryInfo;
    paymentMethod: PaymentMethod;
    deliveryFee: number;
    notes?: string; // pass buyer's note so backend can persist it
    couponCode?: string; // optional coupon code for discount
    items: Array<{
        productId: string;
        name: string;
        image: string;
        price: number;
        quantity: number;
        unit: string;
        priceType: 'retail' | 'bulk';
        minQuantity?: number;
        dealId?: string;
        tierName?: string;
        multiplier?: number;
    }>;
}


// Create Order Response
export interface CreateOrderResponse {
    order: Order;
    payment?: {
        authorizationUrl: string;
        accessCode: string;
        reference: string;
    };
}

// Payment Verification Response
export interface PaymentVerificationResponse {
    order: Order;
    paymentData: PaymentProviderResponse;
}

// Order List Response
export interface OrderListResponse {
    orders: Order[];
    pagination: PaginationMeta & {
        totalOrders: number;
        ordersPerPage: number;
    };
}