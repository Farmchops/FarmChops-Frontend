// src/types/order.ts
import type { PaginationMeta } from "./api";

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type PaymentMethod = 'paystack' | 'pay_later';

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
}

// Status History
export interface StatusHistory {
    status: OrderStatus;
    timestamp: string;
    note: string;
    _id: string;
    id: string;
}

// Delivery Info
export interface DeliveryInfo {
    address: string;
    city: string;
    state?: string;
    phoneNumber: string;
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
    totalAmount: number;
    paymentMethod: PaymentMethod;
    paymentStatus: PaymentStatus;
    orderStatus: OrderStatus;
    paymentReference: string;
    paymentProvider: string;
    providerResponse: PaymentProviderResponse | null;
    deliveryInfo: DeliveryInfo;
    statusHistory: StatusHistory[];
    createdAt: string;
    updatedAt: string;
    orderNumber: string;
    totalItems: number;
    summary: OrderSummary;
    id: string;
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
        grandTotal: number;
    };
}

// Create Order Request
export interface CreateOrderRequest {
    deliveryInfo: DeliveryInfo;
    paymentMethod: PaymentMethod;
    deliveryFee: number;
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