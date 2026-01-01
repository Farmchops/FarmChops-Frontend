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

const isRenderableDeal = (deal: Deal | null | undefined): deal is Deal => {
    if (!deal) return false;
    if (typeof deal.dealPrice !== "number" || Number.isNaN(deal.dealPrice)) {
        return false;
    }
    return Boolean(deal.productId || deal.product?.id);
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
    const { data, isLoading, error, refetch, isFetching } = useGetActiveDealQuery(undefined, {
        pollingInterval: 10000,
        refetchOnFocus: true,
        refetchOnReconnect: true,
    });
    const { data: upcomingData } = useGetUpcomingDealQuery();
    const payload = useMemo(() => normalizeActiveDealPayload(data), [data]);

    const rawActiveDeals = useMemo(() => {
        if (payload.deals && payload.deals.length) {
            return payload.deals;
        }
        return payload.deal ? [payload.deal] : [];
    }, [payload.deals, payload.deal]);

    const activeDeals = useMemo(() => rawActiveDeals.filter(isRenderableDeal), [rawActiveDeals]);

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
            <section className="mx-auto max-w-3xl space-y-5 py-12 text-center">
                <h1 className="text-2xl font-medium text-gray-900">No active deals</h1>
                <p className="text-sm text-gray-600">
                    Check back soon for new deals
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                    <Link to="/products" className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700">
                        Browse products
                    </Link>
                    <button
                        type="button"
                        onClick={() => refetch()}
                        className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                        disabled={isFetching}
                    >
                        {isFetching ? "Checking..." : "Refresh"}
                    </button>
                </div>
                {upcoming ? (
                    <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-5 text-left">
                        <p className="text-xs font-medium uppercase text-gray-500">Coming soon</p>
                        <h2 className="mt-2 text-lg font-medium text-gray-900">{upcoming.title || upcoming.product?.name || "Upcoming deal"}</h2>
                        <p className="mt-1 text-sm text-gray-600">Starts {formatDate(upcoming.startAt)}</p>
                        {upcoming.promoCopy ? <p className="mt-2 text-sm text-gray-600">{upcoming.promoCopy}</p> : null}
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
                    const link = summary?.slug ? `/products/${summary.slug}` : `/products/${summary?.id ?? deal.productId}`;
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
                                        <dt className="text-xs font-semibold uppercase tracking-wide text-emerald-800">Limited quantity</dt>
                                        <dd className="text-base text-gray-800">{soldOut ? "Sold out" : remaining !== null ? `${remaining} units left` : "While stocks last"}</dd>
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
                            <div className="flex flex-col gap-2">
                                <Link
                                    to={link}
                                    className={`inline-flex w-full items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${soldOut ? "pointer-events-none bg-gray-200 text-gray-500" : "bg-emerald-600 text-white hover:bg-emerald-700"}`}
                                >
                                    {soldOut ? "Sold out" : "Claim deal"}
                                    <ExternalLink className="h-4 w-4" />
                                </Link>
                                <span className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                                    {soldOut ? "Deal exhausted" : "While stocks last"}
                                </span>
                            </div>
                        </article>
                    );
                })}
            </div>
        </section>
    );
};

export default DealOfTheDayPage;
