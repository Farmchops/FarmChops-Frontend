import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Flame, Sparkles, Timer, ExternalLink } from "lucide-react";
import { useGetActiveDealQuery, useGetUpcomingDealQuery } from "@/redux/api/dealsApi";
import { normalizeActiveDealPayload } from "@/lib/deals";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import type { Deal, DealMetrics } from "@/types/deals";

const formatDate = (iso?: string) => {
    if (!iso) return "-";
    const date = new Date(iso);
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

    const featuredDeal = activeDeals[0] ?? null;
    const additionalDeals = activeDeals.slice(1);

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

    if (error || !featuredDeal) {
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

    const featuredMetrics = resolveMetricsForDeal(featuredDeal);
    const featuredRemainingUnits = computeRemainingUnits(featuredDeal, featuredMetrics);
    const featuredSoldOut = featuredMetrics?.soldOut ?? (featuredRemainingUnits !== null && featuredRemainingUnits <= 0);
    const featuredProductSummary = featuredDeal.product as { slug?: string; id?: string; pricing?: { retailPrice?: number; salePrice?: number } } | undefined;
    const featuredProductLink = featuredProductSummary?.slug
        ? `/products/${featuredProductSummary.slug}`
        : `/products/${featuredProductSummary?.id ?? featuredDeal.productId}`;
    const featuredOriginalPrice = featuredProductSummary?.pricing?.retailPrice ?? featuredProductSummary?.pricing?.salePrice ?? null;

    return (
        <section className="mx-auto max-w-5xl space-y-10">
            <header className="flex flex-col gap-2 rounded-3xl border border-emerald-100 bg-emerald-50/80 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2 text-sm font-medium text-emerald-800">
                    <Flame className="h-5 w-5" />
                    Today's featured offer
                </div>
                <div className="flex flex-wrap items-center gap-3 text-sm font-medium text-emerald-800">
                    {additionalDeals.length > 0 ? (
                        <span className="rounded-full bg-white/60 px-3 py-1 text-xs uppercase tracking-wide text-emerald-700">
                            +{additionalDeals.length} more deal{additionalDeals.length > 1 ? "s" : ""} live
                        </span>
                    ) : null}
                    {featuredRemainingUnits !== null ? (
                        <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1 text-sm font-medium text-emerald-700 shadow-sm">
                            {featuredSoldOut ? "Sold out" : `${featuredRemainingUnits} left`}
                            <Sparkles className="h-4 w-4" />
                        </span>
                    ) : null}
                </div>
            </header>

            <article className="grid gap-6 rounded-3xl border border-emerald-100 bg-white/90 p-6 shadow-sm sm:grid-cols-[1fr_minmax(220px,280px)]">
                <div className="space-y-4">
                    <h1 className="text-2xl font-semibold text-emerald-900">{featuredDeal.title || featuredDeal.product?.name || "Deal of the Day"}</h1>
                    {featuredDeal.promoCopy ? (
                        <p className="text-sm leading-relaxed text-gray-700">{featuredDeal.promoCopy}</p>
                    ) : null}
                    <dl className="grid gap-3 text-sm text-gray-700 sm:grid-cols-2">
                        <div>
                            <dt className="font-medium text-emerald-800">Deal price</dt>
                            <dd>{formatCurrency(featuredDeal.dealPrice)}</dd>
                        </div>
                        {typeof featuredOriginalPrice === "number" && featuredOriginalPrice > featuredDeal.dealPrice ? (
                            <div>
                                <dt className="font-medium text-emerald-800">Original price</dt>
                                <dd className="font-medium text-gray-500 line-through">{formatCurrency(featuredOriginalPrice)}</dd>
                            </div>
                        ) : null}
                        {typeof featuredDeal.discountPercentage === "number" ? (
                            <div>
                                <dt className="font-medium text-emerald-800">Discount</dt>
                                <dd>{featuredDeal.discountPercentage}% off</dd>
                            </div>
                        ) : null}
                        <div>
                            <dt className="font-medium text-emerald-800">Runs from</dt>
                            <dd>{formatDate(featuredDeal.startAt)}</dd>
                        </div>
                        <div>
                            <dt className="font-medium text-emerald-800">Ends</dt>
                            <dd>{formatDate(featuredDeal.endAt)}</dd>
                        </div>
                    </dl>
                    <div className="flex flex-wrap items-center gap-3">
                        <Link
                            to={featuredProductLink}
                            className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-2 text-white shadow-sm transition hover:bg-emerald-700"
                        >
                            View product
                            <ExternalLink className="h-4 w-4" />
                        </Link>
                        <Link
                            to="/products"
                            className="inline-flex items-center gap-2 rounded-full border border-emerald-600 px-5 py-2 text-emerald-700 transition hover:bg-emerald-50"
                        >
                            Browse catalogue
                        </Link>
                    </div>
                </div>
                <aside className="space-y-4 rounded-2xl bg-emerald-50/70 p-4 text-sm text-emerald-900">
                    <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Quick facts</p>
                    <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2"><Timer className="h-4 w-4" /> Updated in real-time--check back often.</li>
                        {typeof featuredDeal.perUserLimit === "number" ? <li>Limit of {featuredDeal.perUserLimit} per customer.</li> : null}
                        <li>Available stock: {featuredDeal.maxUnits} units.</li>
                        {featuredDeal.description ? <li>{featuredDeal.description}</li> : null}
                    </ul>
                </aside>
            </article>

            {additionalDeals.length > 0 ? (
                <section className="space-y-4">
                    <h2 className="text-lg font-semibold text-emerald-900">More deals running now</h2>
                    <div className="grid gap-4 sm:grid-cols-2">
                        {additionalDeals.map((deal) => {
                            const metrics = resolveMetricsForDeal(deal);
                            const remaining = computeRemainingUnits(deal, metrics);
                            const soldOut = metrics?.soldOut ?? (remaining !== null && remaining <= 0);
                            const summary = deal.product as { slug?: string; id?: string; pricing?: { retailPrice?: number; salePrice?: number } } | undefined;
                            const link = summary?.slug ? `/products/${summary.slug}` : `/products/${summary?.id ?? deal.productId}`;
                            const key = getDealId(deal) ?? `${deal.productId}-${deal.startAt}`;
                            const originalPrice = summary?.pricing?.retailPrice ?? summary?.pricing?.salePrice ?? null;

                            return (
                                <article key={key} className="space-y-3 rounded-2xl border border-emerald-100 bg-white/80 p-4 shadow-sm">
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <h3 className="text-lg font-semibold text-emerald-900">{deal.title || deal.product?.name || "Flash deal"}</h3>
                                            {deal.promoCopy ? <p className="mt-1 text-sm text-gray-600">{deal.promoCopy}</p> : null}
                                        </div>
                                        {remaining !== null ? (
                                            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700">
                                                {soldOut ? "Sold out" : `${remaining} left`}
                                            </span>
                                        ) : null}
                                    </div>
                                    <dl className="grid gap-2 text-xs text-gray-600">
                                        <div className="flex items-center justify-between">
                                            <dt className="font-medium text-emerald-800">Deal price</dt>
                                            <dd className="text-sm text-gray-800">{formatCurrency(deal.dealPrice)}</dd>
                                        </div>
                                        {typeof originalPrice === "number" && originalPrice > deal.dealPrice ? (
                                            <div className="flex items-center justify-between">
                                                <dt className="font-medium text-emerald-800">Original</dt>
                                                <dd className="text-sm font-medium text-gray-500 line-through">{formatCurrency(originalPrice)}</dd>
                                            </div>
                                        ) : null}
                                        {typeof deal.discountPercentage === "number" ? (
                                            <div className="flex items-center justify-between">
                                                <dt className="font-medium text-emerald-800">Discount</dt>
                                                <dd className="text-sm text-gray-800">{deal.discountPercentage}% off</dd>
                                            </div>
                                        ) : null}
                                        <div className="flex items-center justify-between">
                                            <dt className="font-medium text-emerald-800">Runs</dt>
                                            <dd>
                                                {formatDate(deal.startAt)} to {formatDate(deal.endAt)}
                                            </dd>
                                        </div>
                                    </dl>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <Link
                                            to={link}
                                            className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700"
                                        >
                                            View product
                                            <ExternalLink className="h-3.5 w-3.5" />
                                        </Link>
                                        <span className="text-xs text-emerald-700">
                                            {deal.perUserLimit ? `Limit ${deal.perUserLimit} per customer` : "While stocks last"}
                                        </span>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                </section>
            ) : null}
        </section>
    );
};

export default DealOfTheDayPage;
