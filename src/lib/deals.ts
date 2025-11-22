import type { ActiveDealPayload, Deal, DealMetrics } from "@/types/deals";
import type { ApiResponse } from "@/types/api";

export type ActiveDealApiShape =
    | ApiResponse<ActiveDealPayload>
    | (ActiveDealPayload & { activeDeal?: Deal | null })
    | undefined;

const resolveDealId = (deal: Deal): string | null => {
    const typed = deal as Deal & { id?: string; dealId?: string };
    return typed._id ?? typed.id ?? typed.dealId ?? null;
};

export const normalizeActiveDealPayload = (
    response: ActiveDealApiShape
): ActiveDealPayload => {
    if (!response) {
        return { deal: null, deals: [], metrics: undefined, metricsByDealId: undefined, userReservation: null };
    }

    const hasDataField = typeof response === "object" && response !== null && "data" in response;
    const payload = (
        hasDataField && response?.data ? response.data : response
    ) as ActiveDealPayload & {
        activeDeal?: Deal | null;
        deals?: Deal[];
        activeDeals?: Deal[];
        items?: Deal[];
        metricsByDealId?: Record<string, DealMetrics | undefined>;
    };

    const candidateDeals: Deal[] = [];

    const appendDeal = (deal: Deal | null | undefined) => {
        if (!deal) return;
        candidateDeals.push(deal);
    };

    if (Array.isArray(payload.deals)) {
        payload.deals.forEach(appendDeal);
    }

    if (Array.isArray(payload.activeDeals)) {
        payload.activeDeals.forEach(appendDeal);
    }

    if (Array.isArray(payload.items)) {
        payload.items.forEach(appendDeal);
    }

    appendDeal(payload.deal ?? null);
    appendDeal(payload.activeDeal ?? null);

    const seenIds = new Set<string>();
    const normalizedDeals = candidateDeals.filter((deal) => {
        const id = resolveDealId(deal);
        if (!id) return true;
        if (seenIds.has(id)) return false;
        seenIds.add(id);
        return true;
    });

    const primaryDeal = payload.deal ?? payload.activeDeal ?? normalizedDeals[0] ?? null;

    const metricsByDealId = payload.metricsByDealId ?? undefined;

    return {
        deal: primaryDeal ?? null,
        deals: normalizedDeals.length ? normalizedDeals : primaryDeal ? [primaryDeal] : [],
        metrics: payload.metrics,
        metricsByDealId,
        userReservation: payload.userReservation ?? null,
    };
};
