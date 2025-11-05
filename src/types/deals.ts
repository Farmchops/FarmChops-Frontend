export type DealStatus =
    | "draft"
    | "scheduled"
    | "active"
    | "paused"
    | "cancelled"
    | "completed"
    | "expired";

export interface DealProductSummary {
    id: string;
    name: string;
    images?: string[];
    pricing?: {
        retailPrice?: number;
        salePrice?: number;
        currency?: string;
    };
}

export interface DealMetrics {
    remainingUnits?: number;
    perUserRemaining?: number;
    countdownSeconds?: number;
    soldOut?: boolean;
    soldUnits?: number;
    reservedUnits?: number;
}

export interface Deal {
    _id: string;
    productId: string;
    product?: DealProductSummary;
    dealPrice: number;
    discountPercentage?: number;
    maxUnits: number;
    perUserLimit?: number | null;
    startAt: string;
    endAt: string;
    status: DealStatus;
    promoCopy?: string;
    title?: string;
    headline?: string;
    shortDescription?: string;
    description?: string;
    heroImage?: string;
    soldUnits?: number;
    reservedUnits?: number;
    metrics?: DealMetrics;
    isFeatured?: boolean;
    createdAt?: string;
    updatedAt?: string;
    publishedAt?: string | null;
    pausedAt?: string | null;
    cancelledAt?: string | null;
}

export interface DealReservationSummary {
    reservationId: string;
    expiresAt: string;
    remainingSeconds: number;
    unitsReserved: number;
    perUserRemaining?: number;
}

export interface ActiveDealPayload {
    deal: Deal | null;
    metrics?: DealMetrics;
    userReservation?: DealReservationSummary | null;
}

export interface UpcomingDealPayload {
    deal: Deal | null;
    countdownSeconds?: number;
}

export interface AdminDealsListResponse {
    deals: Deal[];
    pagination?: {
        page: number;
        pageSize: number;
        total: number;
    };
}
