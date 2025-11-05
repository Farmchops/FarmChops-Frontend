import { useEffect, useMemo, useState } from "react";
import { Plus, Pause, Play, XCircle, Pencil, Loader2, AlertCircle, Image as ImageIcon, Star, Trash2 } from "lucide-react";
import { useGetAdminDealsQuery, useCreateDealMutation, useUpdateDealMutation, useUpdateDealStatusMutation, useDeleteDealMutation } from "@/redux/api/dealsApi";
import { AlertModal } from "@/components/AlertModal";
import { useGetProductsQuery } from "@/redux/api/productApi";
import type { Deal, DealStatus } from "@/types/deals";
import type { Product } from "@/types/product";
import { LoadingSpinner } from "@/components/LoadingSpinner";

interface DealFormValues {
    productId: string;
    dealPrice: string;
    discountPercentage: string;
    maxUnits: string;
    perUserLimit: string;
    startAt: string;
    endAt: string;
    promoCopy: string;
    headline: string;
    title: string;
    description: string;
    heroImage: string;
    isFeatured: boolean;
}

interface DealFormModalProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (values: DealFormValues, dealId?: string) => Promise<void>;
    products: Array<{ value: string; label: string; image?: string }>;
    initialDeal?: Deal | null;
    isSubmitting: boolean;
    error?: string | null;
}

const emptyFormValues: DealFormValues = {
    productId: "",
    dealPrice: "",
    discountPercentage: "",
    maxUnits: "",
    perUserLimit: "",
    startAt: "",
    endAt: "",
    promoCopy: "",
    headline: "",
    title: "",
    description: "",
    heroImage: "",
    isFeatured: false,
};

const parseNumberField = (value: string): number | undefined => {
    if (!value.trim()) {
        return undefined;
    }
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
};

const formatDateTime = (iso?: string | null) => {
    if (!iso) return "-";
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) {
        return "-";
    }
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
};

const getStatusBadgeClass = (status: DealStatus) => {
    switch (status) {
        case "active":
            return "bg-green-100 text-green-700";
        case "scheduled":
            return "bg-sky-100 text-sky-700";
        case "paused":
            return "bg-amber-100 text-amber-700";
        case "cancelled":
            return "bg-rose-100 text-rose-700";
        case "completed":
        case "expired":
            return "bg-gray-100 text-gray-600";
        default:
            return "bg-slate-100 text-slate-600";
    }
};

const formatScheduleLabel = (start?: string | null, end?: string | null) => {
    const hasStart = Boolean(start);
    const hasEnd = Boolean(end);

    if (hasStart && hasEnd) {
        return `Runs ${formatDateTime(start)} – ${formatDateTime(end)}`;
    }

    if (hasStart) {
        return `Starts ${formatDateTime(start)}`;
    }

    if (hasEnd) {
        return `Ends ${formatDateTime(end)}`;
    }

    return "No schedule restrictions";
};

const DealFormModal = ({ open, onClose, onSubmit, products, initialDeal, isSubmitting, error }: DealFormModalProps) => {
    const [values, setValues] = useState<DealFormValues>(emptyFormValues);

    const [localError, setLocalError] = useState<string | null>(null);

    useEffect(() => {
        if (open) {
            if (initialDeal) {
                setValues({
                    productId: initialDeal.productId ?? initialDeal.product?.id ?? "",
                    dealPrice: initialDeal.dealPrice?.toString() ?? "",
                    discountPercentage: initialDeal.discountPercentage?.toString() ?? "",
                    maxUnits: initialDeal.maxUnits?.toString() ?? "",
                    perUserLimit: initialDeal.perUserLimit?.toString() ?? "",
                    startAt: initialDeal.startAt ? initialDeal.startAt.slice(0, 16) : "",
                    endAt: initialDeal.endAt ? initialDeal.endAt.slice(0, 16) : "",
                    promoCopy: initialDeal.promoCopy ?? "",
                    headline: initialDeal.headline ?? "",
                    title: initialDeal.title ?? "",
                    description: initialDeal.description ?? initialDeal.shortDescription ?? initialDeal.promoCopy ?? "",
                    heroImage: initialDeal.heroImage ?? "",
                    isFeatured: Boolean((initialDeal as { isFeatured?: boolean }).isFeatured),
                });
            } else {
                setValues(emptyFormValues);
            }
            setLocalError(null);
        }
    }, [open, initialDeal]);

    if (!open) {
        return null;
    }

    const resetAndClose = () => {
        setValues(emptyFormValues);
        setLocalError(null);
        onClose();
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!values.productId) {
            setLocalError("Select a product for this deal.");
            return;
        }

        if (!values.dealPrice && !values.discountPercentage) {
            setLocalError("Provide either a deal price or discount percentage.");
            return;
        }

        if (!values.maxUnits) {
            setLocalError("Enter the allocation for this deal.");
            return;
        }

        if (Number(values.maxUnits) <= 0) {
            setLocalError("Allocation must be a positive number.");
            return;
        }

        const hasStart = Boolean(values.startAt);
        const hasEnd = Boolean(values.endAt);
        const startDate = hasStart ? new Date(values.startAt) : null;
        const endDate = hasEnd ? new Date(values.endAt) : null;

        if (startDate && Number.isNaN(startDate.getTime())) {
            setLocalError("Start time is invalid.");
            return;
        }

        if (endDate && Number.isNaN(endDate.getTime())) {
            setLocalError("End time is invalid.");
            return;
        }

        if (startDate && endDate && startDate >= endDate) {
            setLocalError("End time must be after the start time.");
            return;
        }

        setLocalError(null);

        await onSubmit(values, initialDeal?._id);
    };

    const handleChange = (field: keyof DealFormValues) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const target = event.target;
        const next = target instanceof HTMLInputElement && target.type === "checkbox" ? target.checked : target.value;
        setValues((prev) => ({ ...prev, [field]: next as never }));
    };

    return (
        <div className="fixed inset-0 z-[1050] flex items-center justify-center bg-black/40 p-4">
            <div className="flex w-full max-w-2xl max-h-[90vh] flex-col overflow-hidden rounded-3xl bg-white shadow-xl">
                <div className="flex items-center justify-between border-b px-6 py-4">
                    <div>
                        <p className="text-xs uppercase tracking-wide text-gray-500">{initialDeal ? "Edit Deal" : "New Deal"}</p>
                        <h2 className="text-lg font-semibold">Deal of the Day configuration</h2>
                    </div>
                    <button type="button" onClick={resetAndClose} className="rounded-full p-2 hover:bg-gray-100" aria-label="Close deal form">
                        <XCircle className="h-5 w-5" />
                    </button>
                </div>

                <form id="deal-form" onSubmit={handleSubmit} className="grid gap-4 px-6 py-5 text-sm overflow-y-auto flex-1">
                    <div className="grid gap-2">
                        <label className="text-xs font-semibold uppercase tracking-wide text-gray-600">Product</label>
                        <select
                            value={values.productId}
                            onChange={handleChange("productId")}
                            className="rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1D7B3C]/40"
                        >
                            <option value="">Select product…</option>
                            {products.map((product) => (
                                <option key={product.value} value={product.value}>
                                    {product.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="grid gap-2">
                            <label className="text-xs font-semibold uppercase tracking-wide text-gray-600">Deal Price</label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={values.dealPrice}
                                onChange={handleChange("dealPrice")}
                                className="rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1D7B3C]/40"
                                placeholder="e.g. 4999"
                            />
                        </div>
                        <div className="grid gap-2">
                            <label className="text-xs font-semibold uppercase tracking-wide text-gray-600">Discount % (optional)</label>
                            <input
                                type="number"
                                step="0.1"
                                min="0"
                                value={values.discountPercentage}
                                onChange={handleChange("discountPercentage")}
                                className="rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1D7B3C]/40"
                                placeholder="e.g. 30"
                            />
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="grid gap-2">
                            <label className="text-xs font-semibold uppercase tracking-wide text-gray-600">Allocation (max units)</label>
                            <input
                                type="number"
                                min="1"
                                value={values.maxUnits}
                                onChange={handleChange("maxUnits")}
                                className="rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1D7B3C]/40"
                                placeholder="Total units available"
                            />
                        </div>
                        <div className="grid gap-2">
                            <label className="text-xs font-semibold uppercase tracking-wide text-gray-600">Per user limit</label>
                            <input
                                type="number"
                                min="1"
                                value={values.perUserLimit}
                                onChange={handleChange("perUserLimit")}
                                className="rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1D7B3C]/40"
                                placeholder="Optional"
                            />
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="grid gap-2">
                            <label className="text-xs font-semibold uppercase tracking-wide text-gray-600">Start time (optional)</label>
                            <input
                                type="datetime-local"
                                value={values.startAt}
                                onChange={handleChange("startAt")}
                                className="rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1D7B3C]/40"
                            />
                        </div>
                        <div className="grid gap-2">
                            <label className="text-xs font-semibold uppercase tracking-wide text-gray-600">End time (optional)</label>
                            <input
                                type="datetime-local"
                                value={values.endAt}
                                onChange={handleChange("endAt")}
                                className="rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1D7B3C]/40"
                            />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <label className="text-xs font-semibold uppercase tracking-wide text-gray-600">Title</label>
                        <input
                            type="text"
                            value={values.title}
                            onChange={handleChange("title")}
                            className="rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1D7B3C]/40"
                            placeholder="Catchy title shown on banners"
                        />
                    </div>

                    <div className="grid gap-2">
                        <label className="text-xs font-semibold uppercase tracking-wide text-gray-600">Headline</label>
                        <input
                            type="text"
                            value={values.headline}
                            onChange={handleChange("headline")}
                            className="rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1D7B3C]/40"
                            placeholder="Short teaser copy"
                        />
                    </div>

                    <div className="grid gap-2">
                        <label className="text-xs font-semibold uppercase tracking-wide text-gray-600">Promo copy</label>
                        <textarea
                            value={values.promoCopy}
                            onChange={handleChange("promoCopy")}
                            rows={3}
                            className="rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1D7B3C]/40"
                            placeholder="Longer description that appears in the modal"
                        />
                    </div>

                    <div className="grid gap-2">
                        <label className="text-xs font-semibold uppercase tracking-wide text-gray-600">Long description (optional)</label>
                        <textarea
                            value={values.description}
                            onChange={handleChange("description")}
                            rows={3}
                            className="rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1D7B3C]/40"
                            placeholder="Additional copy for landing sections"
                        />
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                        <div className="grid gap-2">
                            <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-600">
                                <ImageIcon className="h-3.5 w-3.5" />
                                Hero image URL (optional)
                            </label>
                            <input
                                type="url"
                                value={values.heroImage}
                                onChange={handleChange("heroImage")}
                                className="rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1D7B3C]/40"
                                placeholder="https://..."
                            />
                            {values.heroImage ? (
                                <div className="rounded-lg border border-gray-200 bg-gray-50 p-2">
                                    <img
                                        src={values.heroImage}
                                        alt="Hero preview"
                                        className="h-32 w-full rounded-md object-cover"
                                        onError={(event) => {
                                            event.currentTarget.style.display = "none";
                                        }}
                                    />
                                    <p className="mt-1 text-xs text-gray-500">Preview shown on customer banner.</p>
                                </div>
                            ) : null}
                        </div>
                        <label className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
                            <input
                                type="checkbox"
                                checked={values.isFeatured}
                                onChange={handleChange("isFeatured")}
                                className="h-4 w-4 rounded border-gray-300 text-[#1D7B3C] focus:ring-[#1D7B3C]"
                            />
                            <span className="inline-flex items-center gap-1 font-medium">
                                <Star className="h-4 w-4 text-[#1D7B3C]" />
                                Feature this deal
                            </span>
                        </label>
                    </div>

                    {(localError || error) && (
                        <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
                            <AlertCircle className="h-4 w-4" />
                            <span>{localError || error}</span>
                        </div>
                    )}
                </form>

                <div className="flex justify-end gap-3 border-t bg-gray-50 px-6 py-4">
                    <button
                        type="button"
                        onClick={resetAndClose}
                        className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-white"
                        disabled={isSubmitting}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        form="deal-form"
                        className="inline-flex items-center gap-2 rounded-lg bg-[#1D7B3C] px-4 py-2 text-sm font-medium text-white hover:bg-green-800 disabled:opacity-70"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Saving…
                            </>
                        ) : initialDeal ? (
                            "Update deal"
                        ) : (
                            "Create deal"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

const DealsPage = () => {
    const [statusFilter, setStatusFilter] = useState<DealsListQueryParams["status"]>('all');
    const filters = useMemo<DealsListQueryParams>(() => ({
        page: 1,
        limit: 20,
        status: statusFilter === 'all' ? undefined : statusFilter,
    }), [statusFilter]);
    const [formOpen, setFormOpen] = useState(false);
    const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
    const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
    const [formError, setFormError] = useState<string | null>(null);

    const { data, isLoading, isFetching, refetch } = useGetAdminDealsQuery(filters, {
        pollingInterval: 10000,
        refetchOnFocus: true,
        refetchOnReconnect: true,
    });
    const { data: productsData } = useGetProductsQuery({ page: 1, limit: 100 });

    const [createDeal, { isLoading: isCreating }] = useCreateDealMutation();
    const [updateDeal, { isLoading: isUpdating }] = useUpdateDealMutation();
    const [deleteDeal, { isLoading: isDeleting }] = useDeleteDealMutation();
    const [updateDealStatus, { isLoading: isUpdatingStatus }] = useUpdateDealStatusMutation();
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [confirmingDeal, setConfirmingDeal] = useState<Deal | null>(null);

    const products = useMemo(() => {
        const productList = productsData?.data?.products ?? [];
        return Array.isArray(productList)
            ? productList.map((product: Product) => ({
                value: product._id ?? product.id,
                label: product.name,
                image: Array.isArray(product.images) ? product.images[0] : undefined,
            }))
            : [];
    }, [productsData]);

    const deals = useMemo(() => {
        if (!data?.data) {
            if (Array.isArray((data as unknown as { deals?: Deal[] })?.deals)) {
                return (data as unknown as { deals: Deal[] }).deals;
            }
            return [] as Deal[];
        }

        const payload = data.data;
        if (Array.isArray((payload as unknown as Deal[]))) {
            return payload as unknown as Deal[];
        }

        if (Array.isArray((payload as { deals?: Deal[] }).deals)) {
            return payload.deals ?? [];
        }

        return [] as Deal[];
    }, [data]);

    const categorizedDeals = useMemo(() => {
        const active = deals.filter((deal) => deal.status === "active");
        const upcoming = deals.filter((deal) => deal.status === "scheduled" || deal.status === "draft");
        const past = deals.filter((deal) => ["completed", "cancelled", "expired"].includes(deal.status));
        const paused = deals.filter((deal) => deal.status === "paused");
        return { active, upcoming, paused, past };
    }, [deals]);

    const closeForm = () => {
        setFormOpen(false);
        setEditingDeal(null);
        setFormError(null);
    };

    const handleCreateOrUpdate = async (values: DealFormValues, dealId?: string) => {
        const dealPrice = values.dealPrice.trim() ? Number(values.dealPrice) : undefined;
        if (dealPrice !== undefined && !Number.isFinite(dealPrice)) {
            setFormError("Deal price must be a valid number.");
            setFeedback({ type: "error", message: "Deal price must be a valid number." });
            return;
        }
        const maxUnits = Number(values.maxUnits);
        if (!Number.isFinite(maxUnits) || maxUnits <= 0) {
            setFormError("Allocation must be a positive number.");
            setFeedback({ type: "error", message: "Allocation must be a positive number." });
            return;
        }
        const discountPercentage = parseNumberField(values.discountPercentage);
        const perUserLimit = parseNumberField(values.perUserLimit);

        const startInput = values.startAt.trim();
        const endInput = values.endAt.trim();
        const isEditing = Boolean(dealId);
        const activeEditingDeal = isEditing && editingDeal?._id === dealId ? editingDeal : null;
        const startAt = startInput
            ? new Date(startInput).toISOString()
            : isEditing && activeEditingDeal?.startAt
                ? null
                : undefined;
        const endAt = endInput
            ? new Date(endInput).toISOString()
            : isEditing && activeEditingDeal?.endAt
                ? null
                : undefined;

        const payload = {
            productId: values.productId,
            dealPrice,
            discountPercentage,
            maxUnits,
            perUserLimit,
            ...(typeof startAt !== "undefined" ? { startAt } : {}),
            ...(typeof endAt !== "undefined" ? { endAt } : {}),
            promoCopy: values.promoCopy?.trim() || undefined,
            headline: values.headline?.trim() || undefined,
            title: values.title?.trim() || undefined,
            description: values.description?.trim() || undefined,
            heroImage: values.heroImage?.trim() || undefined,
            isFeatured: values.isFeatured,
        };

        try {
            setFormError(null);
            if (dealId) {
                await updateDeal({ id: dealId, ...payload }).unwrap();
                setFeedback({ type: "success", message: "Deal updated successfully." });
            } else {
                await createDeal(payload).unwrap();
                setFeedback({ type: "success", message: "Deal created successfully." });
            }
            closeForm();
            refetch();
        } catch (mutationError) {
            const message = (mutationError as { data?: { message?: string; error?: string } })?.data?.message
                ?? (mutationError as { data?: { error?: string } })?.data?.error
                ?? "Unable to save the deal.";
            setFormError(message);
            setFeedback({ type: "error", message });
        }
    };

    const handleStatusChange = async (deal: Deal, action: 'pause' | 'resume' | 'cancel' | 'activate') => {
        try {
            await updateDealStatus({ id: deal._id, action }).unwrap();
            setFormError(null);
            setFeedback({ type: "success", message: `Deal ${action === 'cancel' ? 'cancelled' : action + 'd'} successfully.` });
            refetch();
        } catch (mutationError) {
            const message = (mutationError as { data?: { message?: string; error?: string } })?.data?.message
                ?? (mutationError as { data?: { error?: string } })?.data?.error
                ?? "Unable to update deal status.";
            setFeedback({ type: "error", message });
        }
    };

    const confirmDelete = (deal: Deal) => {
        setConfirmingDeal(deal);
    };

    const handleConfirmDelete = async () => {
        const dealId = confirmingDeal?._id;
        if (!dealId) {
            setConfirmingDeal(null);
            return;
        }

        try {
            setDeletingId(dealId);
            await deleteDeal(dealId).unwrap();
            setFeedback({ type: "success", message: "Deal removed." });
            refetch();
        } catch (mutationError) {
            const message = (mutationError as { data?: { message?: string; error?: string } })?.data?.message
                ?? (mutationError as { data?: { error?: string } })?.data?.error
                ?? "Unable to delete the deal.";
            setFeedback({ type: "error", message });
        } finally {
            setDeletingId(null);
            setConfirmingDeal(null);
        }
    };

    const openCreateModal = () => {
        setEditingDeal(null);
        setFeedback(null);
        setFormError(null);
        setFormOpen(true);
    };

    const openEditModal = (deal: Deal) => {
        setEditingDeal(deal);
        setFeedback(null);
        setFormError(null);
        setFormOpen(true);
    };

    const isSubmitting = isCreating || isUpdating;

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Deal of the Day</h1>
                    <p className="text-sm text-gray-600">Schedule and monitor limited-time promotions.</p>
                </div>
                <button
                    type="button"
                    onClick={openCreateModal}
                    className="inline-flex items-center gap-2 rounded-lg bg-[#1D7B3C] px-4 py-2 text-sm font-medium text-white hover:bg-green-800 self-start"
                >
                    <Plus className="h-4 w-4" />
                    New deal
                </button>
            </div>

            {feedback ? (
                <div
                    className={`rounded-xl border px-4 py-3 text-sm ${
                        feedback.type === "success"
                            ? "border-green-200 bg-green-50 text-green-800"
                            : "border-red-200 bg-red-50 text-red-700"
                    }`}
                >
                    {feedback.message}
                </div>
            ) : null}

            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                    <p className="text-xs font-medium uppercase text-gray-500">Active deals</p>
                    <p className="mt-2 text-2xl font-semibold text-gray-900">{categorizedDeals.active.length}</p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                    <p className="text-xs font-medium uppercase text-gray-500">Upcoming</p>
                    <p className="mt-2 text-2xl font-semibold text-gray-900">{categorizedDeals.upcoming.length}</p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                    <p className="text-xs font-medium uppercase text-gray-500">Paused</p>
                    <p className="mt-2 text-2xl font-semibold text-gray-900">{categorizedDeals.paused.length}</p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                    <p className="text-xs font-medium uppercase text-gray-500">Completed / cancelled</p>
                    <p className="mt-2 text-2xl font-semibold text-gray-900">{categorizedDeals.past.length}</p>
                </div>
            </section>

            <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-gray-200 bg-white p-3 text-sm text-gray-600">
                <span className="font-medium text-gray-800">Filter:</span>
                {([
                    { label: 'All', value: 'all' },
                    { label: 'Active', value: 'active' },
                    { label: 'Upcoming', value: 'scheduled' },
                    { label: 'Paused', value: 'paused' },
                    { label: 'Completed', value: 'completed' },
                    { label: 'Cancelled', value: 'cancelled' },
                ] as const).map((filter) => (
                    <button
                        key={filter.value}
                        type="button"
                        onClick={() => setStatusFilter(filter.value)}
                        className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                            statusFilter === filter.value
                                ? 'border-[#1D7B3C] bg-[#1D7B3C]/10 text-[#1D7B3C]'
                                : 'border-transparent bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        {filter.label}
                    </button>
                ))}
            </div>

            {isLoading ? (
                <div className="flex justify-center py-16">
                    <LoadingSpinner size="lg" />
                </div>
            ) : (
                <div className="space-y-6">
                    {([{"label":"Active now","key":"active"},{"label":"Paused","key":"paused"},{"label":"Upcoming","key":"upcoming"},{"label":"Completed & archived","key":"past"}] as const).map((section) => {
                        const items = categorizedDeals[section.key];
                        if (!items.length) {
                            return (
                                <div key={section.key} className="rounded-3xl border border-dashed border-gray-200 bg-white p-8 text-sm text-gray-500">
                                    <p className="font-medium text-gray-800">{section.label}</p>
                                    <p className="mt-2 text-sm text-gray-500">No deals in this state yet.</p>
                                </div>
                            );
                        }

                        return (
                            <div key={section.key} className="rounded-3xl border border-gray-200 bg-white">
                                <div className="flex items-center justify-between border-b px-6 py-4">
                                    <h2 className="text-base font-semibold text-gray-900">{section.label}</h2>
                                    {isFetching ? (
                                        <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                                    ) : null}
                                </div>
                                <ul className="divide-y divide-gray-100">
                                    {items.map((deal) => {
                                        const remaining =
                                            deal.metrics?.remainingUnits ??
                                            (typeof deal.maxUnits === "number" && typeof deal.soldUnits === "number"
                                                ? Math.max(deal.maxUnits - deal.soldUnits, 0)
                                                : undefined);
                                        const sold = deal.metrics?.soldUnits ?? deal.soldUnits;
                                        const isDeletingThisDeal = isDeleting && deletingId === deal._id;
                                        return (
                                            <li key={deal._id} className="grid gap-4 px-6 py-5 sm:grid-cols-[1.5fr,1fr,1fr,auto] sm:items-center">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-3">
                                                        <p className="text-base font-medium text-gray-900">{deal.title || deal.headline || deal.promoCopy || deal.product?.name}</p>
                                                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeClass(deal.status)}`}>
                                                            {deal.status.replace(/_/g, ' ')}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-gray-600">{deal.product?.name}</p>
                                                    <p className="text-xs text-gray-500">{formatScheduleLabel(deal.startAt, deal.endAt)}</p>
                                                </div>
                                                <div className="text-sm text-gray-700">
                                                    <p className="font-semibold text-gray-900">₦{deal.dealPrice?.toLocaleString()}</p>
                                                    {deal.discountPercentage ? (
                                                        <p className="text-xs text-gray-500">{deal.discountPercentage}% off base price</p>
                                                    ) : null}
                                                </div>
                                                <div className="text-sm text-gray-700">
                                                    <p>Remaining: <span className="font-medium">{remaining ?? '—'}</span></p>
                                                    {typeof sold === 'number' ? (
                                                        <p className="text-xs text-gray-500">Claimed: {sold}</p>
                                                    ) : null}
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => openEditModal(deal)}
                                                        className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                                                    >
                                                        <Pencil className="h-3.5 w-3.5" />
                                                        Edit
                                                    </button>
                                                    {deal.status === 'active' ? (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleStatusChange(deal, 'pause')}
                                                            className="inline-flex items-center gap-1 rounded-lg border border-amber-300 px-3 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-50"
                                                            disabled={isUpdatingStatus}
                                                        >
                                                            <Pause className="h-3.5 w-3.5" />
                                                            Pause
                                                        </button>
                                                    ) : null}
                                                    {deal.status === 'paused' ? (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleStatusChange(deal, 'resume')}
                                                            className="inline-flex items-center gap-1 rounded-lg border border-green-300 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-50"
                                                            disabled={isUpdatingStatus}
                                                        >
                                                            <Play className="h-3.5 w-3.5" />
                                                            Resume
                                                        </button>
                                                    ) : null}
                                                    {deal.status === 'scheduled' ? (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleStatusChange(deal, 'activate')}
                                                            className="inline-flex items-center gap-1 rounded-lg border border-green-300 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-50"
                                                            disabled={isUpdatingStatus}
                                                        >
                                                            <Play className="h-3.5 w-3.5" />
                                                            Activate now
                                                        </button>
                                                    ) : null}
                                                    {['active', 'scheduled', 'paused'].includes(deal.status) ? (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleStatusChange(deal, 'cancel')}
                                                            className="inline-flex items-center gap-1 rounded-lg border border-rose-300 px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-50"
                                                            disabled={isUpdatingStatus}
                                                        >
                                                            <XCircle className="h-3.5 w-3.5" />
                                                            Cancel
                                                        </button>
                                                    ) : null}
                                                    <button
                                                        type="button"
                                                        onClick={() => confirmDelete(deal)}
                                                        className="inline-flex items-center gap-1 rounded-lg border border-rose-400 px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-50"
                                                        disabled={isDeleting}
                                                    >
                                                        {isDeletingThisDeal ? (
                                                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                        ) : (
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        )}
                                                        {isDeletingThisDeal ? "Removing" : "Delete"}
                                                    </button>
                                                </div>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        );
                    })}
                </div>
            )}

            <DealFormModal
                open={formOpen}
                onClose={closeForm}
                onSubmit={handleCreateOrUpdate}
                products={products}
                initialDeal={editingDeal}
                isSubmitting={isSubmitting}
                error={formError}
            />
            <AlertModal
                isOpen={Boolean(confirmingDeal)}
                onClose={() => setConfirmingDeal(null)}
                type="confirm"
                title="Delete deal"
                message="Delete this deal permanently? This cannot be undone."
                onConfirm={handleConfirmDelete}
            />
        </div>
    );
};

interface DealsListQueryParams {
    status?: DealStatus | 'all';
    productId?: string;
    page?: number;
    limit?: number;
    search?: string;
}

export default DealsPage;
