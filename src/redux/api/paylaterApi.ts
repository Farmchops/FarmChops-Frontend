// src/redux/api/paylaterApi.ts
import { createApi } from '@reduxjs/toolkit/query/react';
import { createAuthBaseQuery, createAdminAuthBaseQuery } from './baseQuery';

// ==================== TYPES ====================

// Application Types
export interface PayLaterApplicationRequest {
    email: string;
    firstName: string;
    lastName: string;
    gender: 'male' | 'female';
    phoneNumber: string;
    bvn: string;
    nin: string;
}

export interface PayLaterApplication {
    _id: string;
    userId: string;
    email: string;
    firstName: string;
    lastName: string;
    gender: 'male' | 'female';
    phoneNumber: string;
    bvn: string;
    nin: string;
    status: 'pending' | 'approved' | 'rejected';
    creditLimit: number | null;
    reviewedBy: string | null;
    reviewedAt: string | null;
    rejectionReason: string | null;
    createdAt: string;
    updatedAt: string;
}

// Account Types
export interface ActiveLoan {
    orderId: string;
    amount: number;
    dueDate: string;
    repaymentStatus: 'pending' | 'paid' | 'overdue';
}

export interface PayLaterAccount {
    creditLimit: number;
    availableCredit: number;
    hasActiveLoan: boolean;
    activeLoan: ActiveLoan | null;
}

// Status Response
export interface PayLaterStatusResponse {
    success: boolean;
    data: {
        hasApplication: boolean;
        status: 'pending' | 'approved' | 'rejected' | null;
        application?: {
            applicationId: string;
            submittedAt: string;
        };
        account: PayLaterAccount | null;
    };
}

// Product Types
export interface PayLaterProduct {
    _id: string;
    name: string;
    slug: string;
    images: string[];
    category: {
        _id: string;
        name: string;
    };
    pricing: {
        regularPrice: number;
        paylaterPrice: number;
        markup: number;
        unit: string;
    };
    inventory: {
        availableStock: number;
        unit: string;
    };
    status: 'in_stock' | 'out_of_stock';
}

export interface PayLaterProductsResponse {
    success: boolean;
    data: {
        products: PayLaterProduct[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
        paylaterInfo: {
            markupPercentage: number;
            availableCredit: number;
        };
    };
}

// Cart Types
export interface PayLaterCartItem {
    productId: string;
    name: string;
    image: string;
    quantity: number;
    unit: string;
    regularPrice: number;
    paylaterPrice: number;
}

export interface PayLaterCart {
    items: PayLaterCartItem[];
    totalItems: number;
    subtotal: number;
    estimatedDelivery: number;
    totalAmount: number;
}

export interface PayLaterCartResponse {
    success: boolean;
    data: {
        cart: PayLaterCart;
        creditInfo: {
            availableCredit: number;
            canCheckout: boolean;
        };
    };
}

// Order Types
export interface PayLaterOrder {
    _id: string;
    totalAmount: number;
    orderStatus: 'processing' | 'shipped' | 'delivered' | 'cancelled';
    repaymentStatus: 'pending' | 'paid' | 'overdue';
    dueDate: string;
    createdAt: string;
    repaidAt: string | null;
}

export interface DeliveryAddress {
    street: string;
    city: string;
    state: string;
    phone: string;
}

// Admin Types
export interface AdminApplication extends PayLaterApplication {
    user: {
        _id: string;
        email: string;
    };
}

export interface AdminPayLaterUser {
    _id: string;
    user: {
        _id: string;
        email: string;
        firstName: string;
        lastName: string;
    };
    creditLimit: number;
    availableCredit: number;
    hasActiveLoan: boolean;
    activeLoan: {
        orderId: string;
        amount: number;
        dueDate: string;
        repaymentStatus: 'pending' | 'paid' | 'overdue';
        isOverdue: boolean;
    } | null;
    totalOrders: number;
    totalRepaid: number;
}

// ==================== API ====================

// Dynamic base query that chooses based on endpoint
const userBaseQuery = createAuthBaseQuery("https://api.farmchops.com/api/");
const adminBaseQuery = createAdminAuthBaseQuery("https://api.farmchops.com/api/");

const baseQuery: typeof userBaseQuery = async (args, api, extraOptions) => {
    // Check if this is an admin endpoint
    const url = typeof args === 'string' ? args : args.url;
    const isAdminEndpoint = url?.startsWith('/admin') || url?.startsWith('admin');

    if (isAdminEndpoint) {
        return adminBaseQuery(args, api, extraOptions);
    }
    return userBaseQuery(args, api, extraOptions);
};

export const paylaterApi = createApi({
    reducerPath: 'paylaterApi',
    baseQuery,
    tagTypes: ['PayLaterStatus', 'PayLaterCart', 'PayLaterProducts', 'PayLaterOrders', 'AdminApplications', 'AdminUsers'],
    endpoints: (builder) => ({
        // ==================== USER ENDPOINTS ====================

        // Submit PayLater Application
        submitApplication: builder.mutation<
            { success: boolean; message: string; data: { applicationId: string; status: string; submittedAt: string } },
            PayLaterApplicationRequest
        >({
            query: (data) => ({
                url: '/paylater/apply',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['PayLaterStatus'],
        }),

        // Get PayLater Status
        getPayLaterStatus: builder.query<PayLaterStatusResponse, void>({
            query: () => '/paylater/status',
            providesTags: ['PayLaterStatus'],
        }),

        // Get Products with PayLater Pricing
        getPayLaterProducts: builder.query<
            PayLaterProductsResponse,
            { page?: number; limit?: number; category?: string; search?: string }
        >({
            query: (params) => ({
                url: '/paylater/products',
                params,
            }),
            providesTags: ['PayLaterProducts'],
        }),

        // Get PayLater Cart
        getPayLaterCart: builder.query<PayLaterCartResponse, void>({
            query: () => '/paylater/cart',
            providesTags: ['PayLaterCart'],
        }),

        // Add to PayLater Cart
        addToPayLaterCart: builder.mutation<
            { success: boolean; message: string; data: { cart: PayLaterCart } },
            { productId: string; quantity: number }
        >({
            query: (data) => ({
                url: '/paylater/cart/add',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['PayLaterCart'],
        }),

        // Update PayLater Cart Item
        updatePayLaterCartItem: builder.mutation<
            { success: boolean; data: { cart: PayLaterCart } },
            { productId: string; quantity: number }
        >({
            query: (data) => ({
                url: '/paylater/cart/update',
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['PayLaterCart'],
        }),

        // Remove from PayLater Cart
        removeFromPayLaterCart: builder.mutation<
            { success: boolean; message: string; data: { cart: PayLaterCart } },
            string
        >({
            query: (productId) => ({
                url: `/paylater/cart/remove/${productId}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['PayLaterCart'],
        }),

        // Clear PayLater Cart
        clearPayLaterCart: builder.mutation<{ success: boolean; message: string }, void>({
            query: () => ({
                url: '/paylater/cart/clear',
                method: 'DELETE',
            }),
            invalidatesTags: ['PayLaterCart'],
        }),

        // PayLater Checkout
        payLaterCheckout: builder.mutation<
            {
                success: boolean;
                message: string;
                data: {
                    order: {
                        orderId: string;
                        totalAmount: number;
                        dueDate: string;
                        orderStatus: string;
                    };
                    account: {
                        previousCredit: number;
                        amountUsed: number;
                        remainingCredit: number;
                        hasActiveLoan: boolean;
                    };
                };
            },
            { deliveryAddress: DeliveryAddress }
        >({
            query: (data) => ({
                url: '/paylater/checkout',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['PayLaterStatus', 'PayLaterCart', 'PayLaterOrders'],
        }),

        // Get PayLater Order History
        getPayLaterOrders: builder.query<
            { success: boolean; data: { orders: PayLaterOrder[] } },
            void
        >({
            query: () => '/paylater/orders',
            providesTags: ['PayLaterOrders'],
        }),

        // ==================== ADMIN ENDPOINTS ====================

        // Get All Applications
        getAdminApplications: builder.query<
            {
                success: boolean;
                data: {
                    applications: AdminApplication[];
                    pagination: { page: number; limit: number; total: number; pages: number };
                    stats: { pending: number; approved: number; rejected: number };
                };
            },
            { status?: string; page?: number; limit?: number }
        >({
            query: (params) => ({
                url: '/admin/paylater/applications',
                params,
            }),
            providesTags: ['AdminApplications'],
        }),

        // Get Single Application
        getAdminApplication: builder.query<
            { success: boolean; data: { application: AdminApplication } },
            string
        >({
            query: (id) => `/admin/paylater/applications/${id}`,
            providesTags: (_result, _error, id) => [{ type: 'AdminApplications', id }],
        }),

        // Approve/Reject Application
        reviewApplication: builder.mutation<
            { success: boolean; message: string; data: { application: PayLaterApplication } },
            { id: string; action: 'approve' | 'reject'; creditLimit?: number; rejectionReason?: string }
        >({
            query: ({ id, ...data }) => ({
                url: `/admin/paylater/applications/${id}/review`,
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['AdminApplications', 'AdminUsers'],
        }),

        // Get All PayLater Users
        getAdminPayLaterUsers: builder.query<
            {
                success: boolean;
                data: {
                    users: AdminPayLaterUser[];
                    pagination: { page: number; limit: number; total: number; pages: number };
                    stats: {
                        totalUsers: number;
                        usersWithActiveLoan: number;
                        totalOutstanding: number;
                        overdueLoans: number;
                    };
                };
            },
            { hasActiveLoan?: string; page?: number; limit?: number }
        >({
            query: (params) => ({
                url: '/admin/paylater/users',
                params,
            }),
            providesTags: ['AdminUsers'],
        }),

        // Get User PayLater Details
        getAdminUserDetails: builder.query<
            {
                success: boolean;
                data: {
                    account: AdminPayLaterUser;
                    application: PayLaterApplication;
                    orders: PayLaterOrder[];
                    stats: {
                        totalOrders: number;
                        totalBorrowed: number;
                        totalRepaid: number;
                        currentOutstanding: number;
                    };
                };
            },
            string
        >({
            query: (userId) => `/admin/paylater/users/${userId}`,
            providesTags: (_result, _error, userId) => [{ type: 'AdminUsers', id: userId }],
        }),

        // Update User Credit Limit
        updateUserCreditLimit: builder.mutation<
            { success: boolean; message: string; data: { previousLimit: number; newLimit: number } },
            { userId: string; creditLimit: number }
        >({
            query: ({ userId, creditLimit }) => ({
                url: `/admin/paylater/users/${userId}/credit-limit`,
                method: 'PUT',
                body: { creditLimit },
            }),
            invalidatesTags: ['AdminUsers'],
        }),

        // Mark Loan as Repaid
        markLoanRepaid: builder.mutation<
            {
                success: boolean;
                message: string;
                data: {
                    order: PayLaterOrder;
                    account: { hasActiveLoan: boolean; availableCredit: number };
                };
            },
            { orderId: string; repaidAmount: number; notes?: string }
        >({
            query: ({ orderId, ...data }) => ({
                url: `/admin/paylater/orders/${orderId}/repaid`,
                method: 'PATCH',
                body: data,
            }),
            invalidatesTags: ['AdminUsers', 'PayLaterOrders'],
        }),

        // Get PayLater Settings
        getPayLaterSettings: builder.query<
            {
                success: boolean;
                data: {
                    markupPercentage: number;
                    defaultRepaymentDays: number;
                    minCreditLimit: number;
                    maxCreditLimit: number;
                };
            },
            void
        >({
            query: () => '/admin/paylater/settings',
        }),

        // Update PayLater Settings
        updatePayLaterSettings: builder.mutation<
            { success: boolean; message: string },
            { markupPercentage?: number; defaultRepaymentDays?: number }
        >({
            query: (data) => ({
                url: '/admin/paylater/settings',
                method: 'PUT',
                body: data,
            }),
        }),

        // Get All PayLater Orders (Admin)
        getAdminPayLaterOrders: builder.query<
            {
                success: boolean;
                data: {
                    orders: PayLaterOrder[];
                    pagination?: { page: number; limit: number; total: number; pages: number };
                };
            },
            { page?: number; limit?: number; status?: string } | undefined
        >({
            query: (params) => ({
                url: '/admin/paylater/orders',
                params,
            }),
            providesTags: ['PayLaterOrders'],
        }),
    }),
});

export const {
    // User hooks
    useSubmitApplicationMutation,
    useGetPayLaterStatusQuery,
    useGetPayLaterProductsQuery,
    useGetPayLaterCartQuery,
    useAddToPayLaterCartMutation,
    useUpdatePayLaterCartItemMutation,
    useRemoveFromPayLaterCartMutation,
    useClearPayLaterCartMutation,
    usePayLaterCheckoutMutation,
    useGetPayLaterOrdersQuery,
    // Admin hooks
    useGetAdminApplicationsQuery,
    useGetAdminApplicationQuery,
    useReviewApplicationMutation,
    useGetAdminPayLaterUsersQuery,
    useGetAdminUserDetailsQuery,
    useUpdateUserCreditLimitMutation,
    useMarkLoanRepaidMutation,
    useGetPayLaterSettingsQuery,
    useUpdatePayLaterSettingsMutation,
    useGetAdminPayLaterOrdersQuery,
} = paylaterApi;
