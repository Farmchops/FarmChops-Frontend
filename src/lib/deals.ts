import type { ActiveDealPayload, Deal } from "@/types/deals";
import type { ApiResponse } from "@/types/api";

export type ActiveDealApiShape =
    | ApiResponse<ActiveDealPayload>
    | (ActiveDealPayload & { activeDeal?: Deal | null })
    | undefined;

export const normalizeActiveDealPayload = (
    response: ActiveDealApiShape
): ActiveDealPayload => {
    if (!response) {
        return { deal: null, metrics: undefined, userReservation: null };
    }

    const hasDataField = typeof response === "object" && response !== null && "data" in response;
    const payload = (
        hasDataField && response?.data ? response.data : response
    ) as ActiveDealPayload & { activeDeal?: Deal | null };

    if (payload.activeDeal && !payload.deal) {
        return {
            deal: payload.activeDeal,
            metrics: payload.metrics,
            userReservation: payload.userReservation ?? null,
        };
    }

    return {
        deal: payload.deal ?? null,
        metrics: payload.metrics,
        userReservation: payload.userReservation ?? null,
    };
};
