import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Flame, Timer, Sparkles } from "lucide-react";
import { useGetActiveDealQuery } from "@/redux/api/dealsApi";
import { normalizeActiveDealPayload } from "@/lib/deals";
import type { Deal } from "@/types/deals";

const formatCountdown = (seconds: number | null): string => {
    if (seconds === null || seconds < 0) {
        return "";
    }

    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    const parts: string[] = [];
    if (days > 0) {
        parts.push(`${days}d`);
    }
    parts.push(`${hours.toString().padStart(2, "0")}h`);
    parts.push(`${minutes.toString().padStart(2, "0")}m`);
    if (days === 0) {
        parts.push(`${secs.toString().padStart(2, "0")}s`);
    }

    return parts.join(" ");
};

const getDealTitle = (deal: Deal | null | undefined) => {
    if (!deal) return null;
    return deal.title || deal.headline || deal.promoCopy || deal.product?.name || "Deal of the Day";
};

const getProductLink = (deal: Deal | null | undefined) => {
    if (!deal) return "/products";
    const slug = (deal.product as unknown as { slug?: string })?.slug;
    const basePath = slug ? `/products/${slug}` : `/products/${deal.productId}`;
    const search = new URLSearchParams({ deal: deal._id }).toString();
    return `${basePath}?${search}`;
};

const quickOptions = [
    { label: "Bulk Buying", breakpoint: "sm" as const, alwaysVisible: true },
    { label: "Pay Later", breakpoint: "sm" as const, alwaysVisible: true },
    { label: "Group Sharing", breakpoint: "sm" as const, alwaysVisible: true },
    { label: "Become a vendor", breakpoint: "md" as const, alwaysVisible: false },
] as const;

export const DealBanner = () => {
    const { data, isLoading, error } = useGetActiveDealQuery();
    const payload = useMemo(() => normalizeActiveDealPayload(data), [data]);
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
                <Link to="/deals" className="font-medium tracking-wide text-white transition hover:text-emerald-200">
                    Deal of the Day
                </Link>
                {quickOptions.map((option) => (
                    <span
                        key={option.label}
                        className={`${option.alwaysVisible ? "" : "hidden"} ${option.breakpoint === "sm" ? "sm:inline" : "md:inline"}`}
                    >
                        {option.label}
                    </span>
                ))}
            </div>
        );
    }

    return (
        <div className="flex w-full flex-col gap-2 bg-[#133F1F] px-4 py-2 text-white sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <Link to="/deals" className="flex items-center gap-2 text-xs font-medium tracking-wide text-emerald-200 hover:text-emerald-100">
                <Flame className="h-4 w-4" />
                Deal of the Day
            </Link>
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
                        <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-white sm:text-sm">
                            <Timer className="h-4 w-4" />
                            <span>Ends in</span>
                            <span className="font-mono text-sm text-white sm:text-base">{countdownLabel}</span>
                        </div>
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
                    <div className="flex flex-wrap items-center gap-2 text-[10px] font-medium text-emerald-100 sm:gap-3 sm:text-xs">
                        {quickOptions.map((option) => (
                            <span
                                key={option.label}
                                className={`${option.alwaysVisible ? "" : "hidden"} ${option.breakpoint === "sm" ? "sm:inline" : "md:inline"} cursor-pointer transition hover:text-white`}
                            >
                                {option.label}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DealBanner;
