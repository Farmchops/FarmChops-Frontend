import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Flame, Sparkles, ExternalLink } from "lucide-react";
import { useGetActiveDealQuery, useGetUpcomingDealQuery } from "@/redux/api/dealsApi";
import { normalizeActiveDealPayload } from "@/lib/deals";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import type { Deal, DealMetrics } from "@/types/deals";

const formatDate = (iso?: string | null) => {
    if (!iso) return "-";
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) {
        return "-";
    }
    return date.toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
    });
};

const formatCurrency = (value?: number) => {
    if (typeof value !== "number") return "-";
    return new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
        minimumFractionDigits: 0,
    }).format(value);
};

const getDealId = (deal: Deal | null | undefined): string | null => {
    if (!deal) return null;
    const reference = deal as Deal & { id?: string };
    return reference._id ?? reference.id ?? null;
};

const computeRemainingUnits = (deal: Deal, metrics?: DealMetrics): number | null => {
    if (metrics && typeof metrics.remainingUnits === "number") {
        return Math.max(metrics.remainingUnits, 0);
    }

    if (typeof deal.maxUnits === "number") {
        const sold = metrics?.soldUnits ?? deal.soldUnits ?? 0;
        const reserved = metrics?.reservedUnits ?? deal.reservedUnits ?? 0;
        const remaining = deal.maxUnits - sold - reserved;
        return Number.isFinite(remaining) ? Math.max(remaining, 0) : null;
    }

    return null;
};

const DealOfTheDayPage = () => {
    const { data, isLoading, error, refetch, isFetching } = useGetActiveDealQuery();
    const { data: upcomingData } = useGetUpcomingDealQuery();
    const payload = useMemo(() => normalizeActiveDealPayload(data), [data]);

    const activeDeals = useMemo(() => {
        if (payload.deals && payload.deals.length) {
            return payload.deals;
        }
        return payload.deal ? [payload.deal] : [];
    }, [payload.deals, payload.deal]);

    const resolveMetricsForDeal = (deal: Deal | null | undefined): DealMetrics | undefined => {
        if (!deal) return undefined;
        const dealId = getDealId(deal);
        if (dealId && payload.metricsByDealId && payload.metricsByDealId[dealId]) {
            return payload.metricsByDealId[dealId] ?? undefined;
        }
        if (payload.deal && getDealId(payload.deal) === dealId && payload.metrics) {
            return payload.metrics;
        }
        return deal.metrics;
    };

    const upcoming = useMemo(() => {
        const raw = (upcomingData?.data ?? upcomingData) as unknown;
        if (raw && typeof raw === "object" && "deal" in raw) {
            return (raw as { deal: Deal | null }).deal ?? null;
        }
        return null;
    }, [upcomingData]);

    if (isLoading) {
        return (
            <div className="flex min-h-[320px] items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (error || activeDeals.length === 0) {
        return (
            <section className="mx-auto max-w-4xl space-y-6 rounded-3xl border border-emerald-100 bg-emerald-50/60 p-10 text-center">
                <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-emerald-700 shadow-sm">
                    <Flame className="h-4 w-4" />
                    Deal of the Day
                </div>
                <h1 className="text-3xl font-semibold text-emerald-900">No flash offer running right now</h1>
                <p className="mx-auto max-w-2xl text-sm text-emerald-800">
                    We refresh our Deal of the Day frequently. Be the first to know when the next offer drops--keep an eye on this page or explore our catalogue for everyday savings.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-4 text-sm font-medium text-emerald-900">
                    <Link to="/products" className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-2 text-white shadow-sm transition hover:bg-emerald-700">
                        Browse products
                        <ExternalLink className="h-4 w-4" />
                    </Link>
                    <button
                        type="button"
                        onClick={() => refetch()}
                        className="inline-flex items-center gap-2 rounded-full border border-emerald-500 px-5 py-2 text-emerald-700 transition hover:bg-emerald-500/10"
                        disabled={isFetching}
                    >
                        {isFetching ? "Checking..." : "Check again"}
                    </button>
                </div>
                {upcoming ? (
                    <div className="rounded-2xl border border-emerald-200 bg-white/60 p-6 text-left">
                        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">Next up</p>
                        <h2 className="mt-2 text-xl font-semibold text-emerald-900">{upcoming.title || upcoming.product?.name || "Upcoming deal"}</h2>
                        <p className="mt-1 text-sm text-emerald-700">Starts {formatDate(upcoming.startAt)}</p>
                        <p className="mt-3 text-sm text-emerald-700">{upcoming.promoCopy || "We will reveal the full details soon."}</p>
                    </div>
                ) : null}
            </section>
        );
    }

    return (
        <section className="mx-auto max-w-5xl space-y-8">
            <header className="flex flex-col gap-3 rounded-3xl border border-emerald-100 bg-emerald-50/80 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2 text-base font-semibold text-emerald-900">
                    <Flame className="h-5 w-5" />
                    Deal of the Day
                </div>
                <div className="flex items-center gap-2 text-sm font-medium text-emerald-800">
                    <Sparkles className="h-4 w-4" />
                    {activeDeals.length > 1 ? `${activeDeals.length} limited-time deals live` : "Limited-time offer running now"}
                </div>
            </header>

            <div className={`grid gap-5 ${activeDeals.length > 1 ? "md:grid-cols-2" : ""}`}>
                {activeDeals.map((deal, index) => {
                    const metrics = resolveMetricsForDeal(deal);
                    const remaining = computeRemainingUnits(deal, metrics);
                    const soldOut = metrics?.soldOut ?? (remaining !== null && remaining <= 0);
                    const summary = deal.product as {
                        slug?: string;
                        id?: string;
                        pricing?: { retailPrice?: number };
                    } | undefined;
                    const key = getDealId(deal) ?? `${deal.productId}-${deal.startAt}`;
                    const originalPrice = summary?.pricing?.retailPrice ?? null;
                    const highlight = index === 0;

                    return (
                        <article
                            key={key}
                            className={`flex h-full flex-col justify-between gap-4 rounded-2xl border p-5 shadow-sm transition hover:shadow-md ${highlight ? "border-emerald-200 bg-emerald-50/90" : "border-emerald-100 bg-white/90"}`}
                        >
                            <div className="space-y-3">
                                <div className="flex items-start justify-between gap-2">
                                    <div>
                                        <h2 className="text-lg font-semibold text-emerald-900">
                                            {deal.title || deal.product?.name || "Limited-time deal"}
                                        </h2>
                                        {deal.promoCopy ? <p className="mt-1 text-sm text-gray-600">{deal.promoCopy}</p> : null}
                                    </div>
                                    {remaining !== null ? (
                                        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-800">
                                            {soldOut ? "Sold out" : `${remaining} left`}
                                        </span>
                                    ) : null}
                                </div>
                                <dl className="grid gap-3 text-sm text-gray-600">
                                    <div className="space-y-1">
                                        <dt className="text-xs font-semibold uppercase tracking-wide text-emerald-800">Deal price</dt>
                                        <dd className="text-base text-gray-800">{formatCurrency(deal.dealPrice)}</dd>
                                    </div>
                                    {typeof originalPrice === "number" && originalPrice > deal.dealPrice ? (
                                        <div className="space-y-1">
                                            <dt className="text-xs font-semibold uppercase tracking-wide text-emerald-800">Retail price</dt>
                                            <dd className="text-sm font-medium text-gray-500 line-through">{formatCurrency(originalPrice)}</dd>
                                        </div>
                                    ) : null}
                                    {typeof deal.discountPercentage === "number" ? (
                                        <div className="space-y-1">
                                            <dt className="text-xs font-semibold uppercase tracking-wide text-emerald-800">Discount</dt>
                                            <dd className="text-base text-gray-800">{deal.discountPercentage}% off</dd>
                                        </div>
                                    ) : null}
                                    <div className="space-y-1">
                                        <dt className="text-xs font-semibold uppercase tracking-wide text-emerald-800">Runs</dt>
                                        <dd className="text-base text-gray-800">{formatDate(deal.startAt)} to {formatDate(deal.endAt)}</dd>
                                    </div>
                                    {typeof deal.perUserLimit === "number" ? (
                                        <div className="space-y-1">
                                            <dt className="text-xs font-semibold uppercase tracking-wide text-emerald-800">Per customer limit</dt>
                                            <dd className="text-base text-gray-800">{deal.perUserLimit}</dd>
                                        </div>
                                    ) : null}
                                    {typeof deal.maxUnits === "number" ? (
                                        <div className="space-y-1">
                                            <dt className="text-xs font-semibold uppercase tracking-wide text-emerald-800">Total stock</dt>
                                            <dd className="text-base text-gray-800">{deal.maxUnits} units</dd>
                                        </div>
                                    ) : null}
                                </dl>
                                {deal.description ? (
                                    <p className="text-sm text-gray-600">{deal.description}</p>
                                ) : null}
                            </div>
                            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide text-emerald-700">
                                <ExternalLink className="h-3.5 w-3.5" />
                                <span>{soldOut ? "Deal exhausted" : "While stocks last"}</span>
                            </div>
                        </article>
                    );
                })}
            </div>
        </section>
    );
};

export default DealOfTheDayPage;
