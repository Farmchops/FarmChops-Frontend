import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Flame, Sparkles, Timer, ExternalLink } from "lucide-react";
import { useGetActiveDealQuery, useGetUpcomingDealQuery } from "@/redux/api/dealsApi";
import { normalizeActiveDealPayload } from "@/lib/deals";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import type { Deal } from "@/types/deals";

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

const DealOfTheDayPage = () => {
    const { data, isLoading, error, refetch, isFetching } = useGetActiveDealQuery();
    const { data: upcomingData } = useGetUpcomingDealQuery();
    const payload = useMemo(() => normalizeActiveDealPayload(data), [data]);
    const activeDeal = payload.deal;
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

    if (error || !activeDeal) {
        return (
            <section className="mx-auto max-w-4xl space-y-6 rounded-3xl border border-emerald-100 bg-emerald-50/60 p-10 text-center">
                <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-emerald-700 shadow-sm">
                    <Flame className="h-4 w-4" />
                    Deal of the Day
                </div>
                <h1 className="text-3xl font-semibold text-emerald-900">No flash offer running right now</h1>
                <p className="mx-auto max-w-2xl text-sm text-emerald-800">
                    We refresh our Deal of the Day frequently. Be the first to know when the next offer drops—keep an eye on this page or explore our catalogue for everyday savings.
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
                        {isFetching ? "Checking…" : "Check again"}
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

    const remainingUnits = payload.metrics?.remainingUnits ?? activeDeal.metrics?.remainingUnits ?? null;
    const soldOut = payload.metrics?.soldOut ?? activeDeal.metrics?.soldOut ?? false;
    const productSummary = activeDeal.product as { slug?: string; id?: string } | undefined;
    const productLink = productSummary?.slug
        ? `/products/${productSummary.slug}`
        : `/products/${productSummary?.id ?? activeDeal.productId}`;

    return (
        <section className="mx-auto max-w-5xl space-y-8">
            <header className="flex flex-col gap-2 rounded-3xl border border-emerald-100 bg-emerald-50/80 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2 text-sm font-medium text-emerald-800">
                    <Flame className="h-5 w-5" />
                    Today’s featured offer
                </div>
                {remainingUnits !== null ? (
                    <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1 text-sm font-medium text-emerald-700 shadow-sm">
                        {soldOut ? "Sold out" : `${remainingUnits} left`}
                        <Sparkles className="h-4 w-4" />
                    </span>
                ) : null}
            </header>

            <article className="grid gap-6 rounded-3xl border border-emerald-100 bg-white/90 p-6 shadow-sm sm:grid-cols-[1fr_minmax(220px,280px)]">
                <div className="space-y-4">
                    <h1 className="text-2xl font-semibold text-emerald-900">{activeDeal.title || activeDeal.product?.name || "Deal of the Day"}</h1>
                    {activeDeal.promoCopy ? (
                        <p className="text-sm leading-relaxed text-gray-700">{activeDeal.promoCopy}</p>
                    ) : null}
                    <dl className="grid gap-3 text-sm text-gray-700 sm:grid-cols-2">
                        <div>
                            <dt className="font-medium text-emerald-800">Deal price</dt>
                            <dd>{formatCurrency(activeDeal.dealPrice)}</dd>
                        </div>
                        {typeof activeDeal.discountPercentage === "number" ? (
                            <div>
                                <dt className="font-medium text-emerald-800">Discount</dt>
                                <dd>{activeDeal.discountPercentage}% off</dd>
                            </div>
                        ) : null}
                        <div>
                            <dt className="font-medium text-emerald-800">Runs from</dt>
                            <dd>{formatDate(activeDeal.startAt)}</dd>
                        </div>
                        <div>
                            <dt className="font-medium text-emerald-800">Ends</dt>
                            <dd>{formatDate(activeDeal.endAt)}</dd>
                        </div>
                    </dl>
                    <div className="flex flex-wrap items-center gap-3">
                        <Link
                            to={productLink}
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
                        <li className="flex items-center gap-2"><Timer className="h-4 w-4" /> Updated in real-time—check back often.</li>
                        {typeof activeDeal.perUserLimit === "number" ? (
                            <li>Limit of {activeDeal.perUserLimit} per customer.</li>
                        ) : null}
                        <li>Available stock: {activeDeal.maxUnits} units.</li>
                        {activeDeal.description ? <li>{activeDeal.description}</li> : null}
                    </ul>
                </aside>
            </article>
        </section>
    );
};

export default DealOfTheDayPage;
