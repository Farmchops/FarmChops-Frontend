import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Flame, Timer, Sparkles } from "lucide-react";
import { useGetActiveDealQuery } from "@/redux/api/dealsApi";
import type { ActiveDealPayload, Deal } from "@/types/deals";
import type { ApiResponse } from "@/types/api";

const extractActiveDeal = (
    response: ApiResponse<ActiveDealPayload> | ActiveDealPayload | undefined
): ActiveDealPayload => {
    if (!response) {
        return { deal: null, metrics: undefined, userReservation: null };
    }

    if ((response as ApiResponse<ActiveDealPayload>).data) {
        return (response as ApiResponse<ActiveDealPayload>).data ?? { deal: null };
    }

    return response as ActiveDealPayload;
};

const formatCountdown = (seconds: number | null): string => {
    if (seconds === null || seconds < 0) {
        return "";
    }
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
        return `${hours}h ${minutes.toString().padStart(2, "0")}m`;
    }
    return `${minutes.toString().padStart(2, "0")}m ${secs.toString().padStart(2, "0")}s`;
};

const getDealTitle = (deal: Deal | null | undefined) => {
    if (!deal) return null;
    return deal.title || deal.headline || deal.promoCopy || deal.product?.name || "Deal of the Day";
};

const getProductLink = (deal: Deal | null | undefined) => {
    if (!deal) return "/products";
    const slug = (deal.product as unknown as { slug?: string })?.slug;
    if (slug) {
        return `/products/${slug}`;
    }
    return `/products/${deal.productId}`;
};

export const DealBanner = () => {
    const { data, isLoading, error } = useGetActiveDealQuery();
    const payload = useMemo(() => extractActiveDeal(data), [data]);
    const activeDeal = payload.deal;
    const metrics = payload.metrics ?? activeDeal?.metrics;
    const [countdown, setCountdown] = useState<number | null>(metrics?.countdownSeconds ?? null);

    useEffect(() => {
        if (typeof metrics?.countdownSeconds === "number") {
            setCountdown(metrics.countdownSeconds);
        } else {
            setCountdown(null);
        }
    }, [metrics?.countdownSeconds, activeDeal?._id]);

    useEffect(() => {
        if (countdown === null || countdown <= 0) {
            return;
        }

        const timer = window.setInterval(() => {
            setCountdown((previous) => {
                if (previous === null) return previous;
                return previous > 0 ? previous - 1 : 0;
            });
        }, 1000);

        return () => window.clearInterval(timer);
    }, [countdown]);

    const title = getDealTitle(activeDeal);
    const computedRemaining =
        metrics?.remainingUnits ??
        (typeof activeDeal?.maxUnits === "number" && typeof activeDeal?.soldUnits === "number"
            ? Math.max(activeDeal.maxUnits - activeDeal.soldUnits, 0)
            : null);
    const remainingUnits = computedRemaining ?? null;
    const soldOut = metrics?.soldOut ?? (remainingUnits !== null && remainingUnits <= 0);
    const countdownLabel = formatCountdown(countdown);

    if (isLoading) {
        return (
            <div className="flex w-full items-center justify-center gap-2 bg-[#133F1F] px-4 py-2 text-xs text-white">
                <Sparkles className="h-4 w-4 animate-pulse" />
                <span>Loading deal…</span>
            </div>
        );
    }

    if (error || !activeDeal) {
        return (
            <div className="flex w-full items-center justify-end gap-6 bg-[#1D7B3C] px-4 py-2 text-xs text-white">
                <span>Deal of the Day</span>
                <span className="hidden sm:inline">Bulk Buying</span>
                <span className="hidden sm:inline">Pay Later</span>
                <span className="hidden md:inline">Become a vendor</span>
            </div>
        );
    }

    return (
        <div className="flex w-full flex-col gap-2 bg-[#133F1F] px-4 py-2 text-white sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-emerald-200">
                <Flame className="h-4 w-4" />
                Deal of the Day
            </div>
            <div className="flex flex-1 flex-col gap-1 text-sm sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3">
                    <span className="font-medium text-white">{title}</span>
                    {typeof activeDeal.dealPrice === "number" ? (
                        <span className="text-xs text-emerald-200">
                            Now ₦{activeDeal.dealPrice.toLocaleString()} {activeDeal.discountPercentage ? `· ${activeDeal.discountPercentage}% off` : ""}
                        </span>
                    ) : null}
                    {typeof remainingUnits === "number" ? (
                        <span className="text-xs text-emerald-100">{soldOut ? "Sold out" : `${remainingUnits} left`}</span>
                    ) : null}
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    {countdownLabel ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white">
                            <Timer className="h-3.5 w-3.5" />
                            {countdownLabel}
                        </span>
                    ) : null}
                    {soldOut ? (
                        <span className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-xs font-semibold text-white">
                            Sold out
                            <Sparkles className="h-3.5 w-3.5" />
                        </span>
                    ) : (
                        <Link
                            to={getProductLink(activeDeal)}
                            className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-[#133F1F] transition hover:bg-emerald-100"
                        >
                            Claim deal
                            <Sparkles className="h-3.5 w-3.5" />
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DealBanner;
