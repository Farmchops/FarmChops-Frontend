import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Flame, Sparkles } from "lucide-react";
import { useGetActiveDealQuery } from "@/redux/api/dealsApi";
import { normalizeActiveDealPayload } from "@/lib/deals";


const quickOptions = [
    { label: "Bulk Buying", breakpoint: "sm" as const, alwaysVisible: false },
    { label: "Pay Later", breakpoint: "sm" as const, alwaysVisible: false },
    { label: "Group Sharing", breakpoint: "sm" as const, alwaysVisible: false },
    { label: "Become a vendor", breakpoint: "md" as const, alwaysVisible: false },
] as const;

export const DealBanner = () => {
    const { data, isLoading, error } = useGetActiveDealQuery();
    const payload = useMemo(() => normalizeActiveDealPayload(data), [data]);
    const activeDeals = payload.deals && payload.deals.length
        ? payload.deals
        : payload.deal
            ? [payload.deal]
            : [];
    const hasActiveDeal = activeDeals.length > 0;

    if (isLoading) {
        return (
            <div className="flex w-full items-center justify-center gap-2 bg-[#133F1F] px-4 py-2 text-xs text-white">
                <Sparkles className="h-4 w-4 animate-pulse" />
                <span>Loading deal…</span>
            </div>
        );
    }

    if (error || !hasActiveDeal) {
        return (
            <div className="flex w-full items-center justify-end gap-6 bg-[#1D7B3C] px-4 py-2 text-xs text-white">
                <Link to="/deals" className="hidden sm:inline font-medium tracking-wide text-white transition hover:text-emerald-200">
                    Deal of the Day
                </Link>
                {quickOptions.map((option) => {
                    const linkMap: Record<string, string> = {
                        "Bulk Buying": "/bulk-buying",
                        "Group Sharing": "/group-sharing",
                        "Become a vendor": "/become-vendor"
                    };
                    const link = linkMap[option.label];

                    return link ? (
                        <Link
                            key={option.label}
                            to={link}
                            className={`${option.alwaysVisible ? "" : "hidden"} ${option.breakpoint === "sm" ? "sm:inline" : "md:inline"} cursor-pointer transition hover:text-emerald-200`}
                        >
                            {option.label}
                        </Link>
                    ) : (
                        <span
                            key={option.label}
                            className={`${option.alwaysVisible ? "" : "hidden"} ${option.breakpoint === "sm" ? "sm:inline" : "md:inline"}`}
                        >
                            {option.label}
                        </span>
                    );
                })}
            </div>
        );
    }

    return (
        <div className="flex w-full flex-col gap-2 bg-[#133F1F] px-4 py-2 text-white sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-emerald-200">
                <Flame className="h-4 w-4" />
                Deal of the Day
            </div>
            <div className="flex flex-1 flex-col gap-2 text-xs sm:flex-row sm:items-center sm:justify-end sm:gap-4 sm:text-sm">
                <span className="text-emerald-100 sm:text-emerald-50">
                    Limited-time offers available!
                </span>
                <Link
                    to="/deals"
                    className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-[#133F1F] transition hover:bg-emerald-100"
                >
                    Browse deals
                    <Sparkles className="h-3.5 w-3.5" />
                </Link>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-[10px] font-medium text-emerald-100 sm:gap-3 sm:text-xs">
                {quickOptions.map((option) => {
                    const linkMap: Record<string, string> = {
                        "Bulk Buying": "/bulk-buying",
                        "Group Sharing": "/group-sharing",
                        "Become a vendor": "/become-vendor"
                    };
                    const link = linkMap[option.label];

                    return link ? (
                        <Link
                            key={option.label}
                            to={link}
                            className={`${option.alwaysVisible ? "" : "hidden"} ${option.breakpoint === "sm" ? "sm:inline" : "md:inline"} cursor-pointer transition hover:text-white`}
                        >
                            {option.label}
                        </Link>
                    ) : (
                        <span
                            key={option.label}
                            className={`${option.alwaysVisible ? "" : "hidden"} ${option.breakpoint === "sm" ? "sm:inline" : "md:inline"}`}
                        >
                            {option.label}
                        </span>
                    );
                })}
            </div>
        </div>
    );
};

export default DealBanner;
