import { useEffect, useMemo, useState } from "react";
import {
    AlertTriangle,
    CheckCircle2,
    Clock,
    Loader2,
    MapPin,
    Package,
    RefreshCcw,
    ShieldCheck,
    Truck,
    X,
} from "lucide-react";
import { useConfirmDeliveryMutation, useGetAssignedOrdersQuery, type RiderAssignedOrdersResponse } from "@/redux/api/riderOrdersApi";
import type { ApiResponse } from "@/types/api";
import type { Order } from "@/types/orders";
import { getAccentClass, ORDER_STATUS_CONFIG } from "@/utils/orderWorkflow";
import { LoadingSpinner } from "@/components/LoadingSpinner";

interface DeliveryConfirmationValues {
    handoverCode: string;
    note?: string;
}

interface ConfirmDeliveryDialogProps {
    open: boolean;
    order: Order | null;
    onClose: () => void;
    onConfirm: (values: DeliveryConfirmationValues) => void;
    isSubmitting: boolean;
    error?: string | null;
}

const formatDateTime = (iso?: string) => {
    if (!iso) {
        return "-";
    }
    const date = new Date(iso);
    return date.toLocaleString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

const parseErrorMessage = (error: unknown): string => {
    if (!error) {
        return "Something went wrong. Please try again.";
    }

    if (typeof error === "string") {
        return error;
    }

    if (typeof error === "object") {
        const typed = error as {
            status?: number;
            data?: {
                message?: string;
                error?: string;
                code?: string;
            };
            message?: string;
            error?: string;
        };

        const base = typed.data?.message ?? typed.data?.error ?? typed.message ?? typed.error;
        if (!base) {
            return "Unable to complete the request.";
        }

        return typed.data?.code ? `${typed.data.code}: ${base}` : base;
    }

    return "Unable to complete the request.";
};

const emptyConfirmationValues: DeliveryConfirmationValues = {
    handoverCode: "",
    note: "",
};

const ConfirmDeliveryDialog = ({
    open,
    order,
    onClose,
    onConfirm,
    isSubmitting,
    error,
}: ConfirmDeliveryDialogProps) => {
    const [values, setValues] = useState<DeliveryConfirmationValues>(emptyConfirmationValues);
    const [localError, setLocalError] = useState<string | null>(null);

    useEffect(() => {
        if (open) {
            setValues(emptyConfirmationValues);
            setLocalError(null);
        }
    }, [open, order?._id]);

    if (!open || !order) {
        return null;
    }

    const handleSubmit = () => {
        if (!values.handoverCode.trim()) {
            setLocalError("Please enter the customer handover code.");
            return;
        }

        setLocalError(null);
        onConfirm(values);
    };

    return (
        <div className="fixed inset-0 z-[1050] flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-xl">
                <div className="flex items-center justify-between border-b px-6 py-4">
                    <div>
                        <p className="text-xs uppercase tracking-wide text-gray-500">{order.orderNumber}</p>
                        <h2 className="text-lg font-semibold">Confirm Delivery</h2>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-full p-2 hover:bg-gray-100"
                        aria-label="Close confirmation dialog"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="space-y-4 px-6 py-5 text-sm">
                    <div>
                        <label className="block text-xs font-medium text-gray-600">Customer handover code</label>
                        <input
                            type="text"
                            value={values.handoverCode}
                            onChange={(event) =>
                                setValues((previous) => ({ ...previous, handoverCode: event.target.value }))
                            }
                            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1D7B3C]/40"
                            placeholder="Enter the code provided by the customer"
                        />
                        {order.handoverCodeMasked ? (
                            <p className="mt-1 text-xs text-gray-500">Hint: {order.handoverCodeMasked}</p>
                        ) : null}
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-600">Note (optional)</label>
                        <textarea
                            value={values.note ?? ""}
                            onChange={(event) =>
                                setValues((previous) => ({ ...previous, note: event.target.value }))
                            }
                            rows={3}
                            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1D7B3C]/40"
                            placeholder="Share any context about this delivery"
                        />
                    </div>

                    {localError ? <p className="text-xs text-red-600">{localError}</p> : null}
                    {error ? <p className="text-xs text-red-600">{error}</p> : null}
                </div>

                <div className="flex justify-end gap-3 border-t bg-gray-50 px-6 py-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-white"
                        disabled={isSubmitting}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        className="inline-flex items-center gap-2 rounded-lg bg-[#1D7B3C] px-4 py-2 text-sm font-medium text-white hover:bg-green-800 disabled:opacity-70"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Confirming...
                            </>
                        ) : (
                            "Confirm delivery"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

const RiderDashboard = () => {
    const { data, isLoading, isFetching, refetch, error } = useGetAssignedOrdersQuery();
    const [confirmDelivery, { isLoading: isConfirming }] = useConfirmDeliveryMutation();
    const [confirmDialogOrder, setConfirmDialogOrder] = useState<Order | null>(null);
    const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);

    const { orders, metrics, meta } = useMemo(() => {
        const empty = {
            orders: [] as Order[],
            metrics: undefined as RiderAssignedOrdersResponse["metrics"] | undefined,
            meta: undefined as RiderAssignedOrdersResponse["meta"] | undefined,
        };

        if (!data) {
            return empty;
        }

        const directPayload = data as unknown as RiderAssignedOrdersResponse | undefined;
        if (directPayload && Array.isArray(directPayload.orders)) {
            return {
                orders: directPayload.orders,
                metrics: directPayload.metrics,
                meta: directPayload.meta,
            };
        }

        const apiResponse = data as ApiResponse<RiderAssignedOrdersResponse> | undefined;
        if (apiResponse?.data && Array.isArray(apiResponse.data.orders)) {
            return {
                orders: apiResponse.data.orders,
                metrics: apiResponse.data.metrics,
                meta: apiResponse.data.meta,
            };
        }

        if (Array.isArray((data as unknown as { orders?: Order[] }).orders)) {
            return {
                orders: (data as unknown as { orders: Order[] }).orders,
                metrics: undefined,
                meta: undefined,
            };
        }

        if (Array.isArray((data as unknown as { data?: Order[] }).data)) {
            return {
                orders: (data as unknown as { data: Order[] }).data,
                metrics: undefined,
                meta: undefined,
            };
        }

        return empty;
    }, [data]);

    const reducedTotals = useMemo(() => {
        return orders.reduce(
            (summary, order) => {
                switch (order.orderStatus) {
                    case "awaiting_pickup":
                        summary.awaitingPickup += 1;
                        break;
                    case "en_route":
                        summary.enRoute += 1;
                        break;
                    case "delivered":
                    case "completed":
                        summary.delivered += 1;
                        break;
                    default:
                        summary.other += 1;
                        break;
                }
                return summary;
            },
            { awaitingPickup: 0, enRoute: 0, delivered: 0, other: 0 }
        );
    }, [orders]);

    const totals = useMemo(() => {
        const awaitingPickup = metrics?.awaitingPickup ?? meta?.awaitingPickup ?? reducedTotals.awaitingPickup;
        const enRoute = metrics?.enRoute ?? meta?.enRoute ?? reducedTotals.enRoute;
        const delivered = metrics?.deliveredToday ?? meta?.deliveredToday ?? reducedTotals.delivered;

        let other = metrics?.otherStatuses;
        if (other === undefined) {
            if (meta?.totalAssigned !== undefined) {
                other = Math.max(meta.totalAssigned - awaitingPickup - enRoute - delivered, 0);
            } else {
                other = reducedTotals.other;
            }
        }

        return { awaitingPickup, enRoute, delivered, other };
    }, [metrics, meta, reducedTotals]);

    useEffect(() => {
        if (error) {
            setFeedback({ type: "error", message: parseErrorMessage(error) });
        }
    }, [error]);

    const handleConfirmDelivery = async (values: DeliveryConfirmationValues) => {
        if (!confirmDialogOrder) {
            return;
        }

        setActionError(null);

        try {
            await confirmDelivery({
                orderId: confirmDialogOrder._id,
                handoverCode: values.handoverCode,
                note: values.note,
            }).unwrap();

            await refetch();

            setFeedback({
                type: "success",
                message: `Delivery for ${confirmDialogOrder.orderNumber} confirmed successfully.`,
            });
            setConfirmDialogOrder(null);
            setActionError(null);
        } catch (mutationError) {
            const resolvedMessage = parseErrorMessage(mutationError);
            setActionError(resolvedMessage);
            setFeedback({ type: "error", message: resolvedMessage });
        }
    };

    const isEmpty = !isLoading && orders.length === 0;

    return (
        <div className="space-y-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Assigned Deliveries</h1>
                    <p className="text-sm text-gray-600">
                        Track orders handed off to you and confirm successful deliveries.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => refetch()}
                    className="mt-2 inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:self-end sm:ml-auto"
                >
                    <RefreshCcw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
                    Refresh
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

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between text-xs font-medium uppercase text-gray-500">
                        Awaiting pickup
                        <Package className="h-4 w-4 text-gray-400" />
                    </div>
                    <p className="mt-2 text-2xl font-semibold text-gray-900">{totals.awaitingPickup}</p>
                    <p className="text-xs text-gray-500">Orders ready once logistics completes handover.</p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between text-xs font-medium uppercase text-gray-500">
                        On the way
                        <Truck className="h-4 w-4 text-gray-400" />
                    </div>
                    <p className="mt-2 text-2xl font-semibold text-gray-900">{totals.enRoute}</p>
                    <p className="text-xs text-gray-500">Actively en route to customers.</p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between text-xs font-medium uppercase text-gray-500">
                        Delivered today
                        <CheckCircle2 className="h-4 w-4 text-gray-400" />
                    </div>
                    <p className="mt-2 text-2xl font-semibold text-gray-900">{totals.delivered}</p>
                    <p className="text-xs text-gray-500">Deliveries marked as complete.</p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between text-xs font-medium uppercase text-gray-500">
                        Other statuses
                        <AlertTriangle className="h-4 w-4 text-gray-400" />
                    </div>
                    <p className="mt-2 text-2xl font-semibold text-gray-900">{totals.other}</p>
                    <p className="text-xs text-gray-500">Orders outside your normal flow.</p>
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-20">
                    <LoadingSpinner size="lg" />
                </div>
            ) : isEmpty ? (
                <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-10 text-center text-sm text-gray-600">
                    <p className="font-medium text-gray-900">No assigned deliveries yet</p>
                    <p className="mt-2 text-sm text-gray-600">
                        Once logistics assigns an order to you it will appear here.
                    </p>
                </div>
            ) : (
                <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white">
                    <table className="min-w-full divide-y divide-gray-100">
                        <thead className="bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                            <tr>
                                <th className="px-6 py-3">Order</th>
                                <th className="px-6 py-3">Customer</th>
                                <th className="px-6 py-3">Delivery details</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3" />
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                            {orders.map((order) => {
                                const statusConfig = ORDER_STATUS_CONFIG[order.orderStatus];
                                const customerName = typeof order.user === "string"
                                    ? order.user
                                    : [order.user?.firstName, order.user?.lastName].filter(Boolean).join(" ") || order.user?.email || "Customer";

                                return (
                                    <tr key={order._id} className="hover:bg-gray-50/70">
                                        <td className="px-6 py-4 align-top">
                                            <div className="font-semibold text-gray-900">{order.orderNumber}</div>
                                            <div className="text-xs text-gray-500">Created {formatDateTime(order.createdAt)}</div>
                                        </td>
                                        <td className="px-6 py-4 align-top">
                                            <div className="font-medium text-gray-900">{customerName}</div>
                                            <div className="text-xs text-gray-500">{order.deliveryInfo?.phoneNumber ?? "-"}</div>
                                        </td>
                                        <td className="px-6 py-4 align-top">
                                            <div className="flex items-start gap-2 text-xs text-gray-600">
                                                <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400" />
                                                <span>{order.deliveryInfo?.address ?? "Delivery address pending"}</span>
                                            </div>
                                            <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                                                <Clock className="h-4 w-4 text-gray-400" />
                                                {order.updatedAt ? `Last updated ${formatDateTime(order.updatedAt)}` : "Awaiting update"}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 align-top">
                                            <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold capitalize text-white ${getAccentClass(order.orderStatus)}`}>
                                                {statusConfig?.label ?? order.orderStatus.replaceAll("_", " ")}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 align-top text-right">
                                            {order.orderStatus === "en_route" ? (
                                                <button
                                                    type="button"
                                                    onClick={() => setConfirmDialogOrder(order)}
                                                    className="inline-flex items-center gap-2 rounded-lg bg-[#1D7B3C] px-4 py-2 text-xs font-semibold text-white hover:bg-green-800 disabled:opacity-70"
                                                    disabled={isConfirming && confirmDialogOrder?._id === order._id}
                                                >
                                                    {isConfirming && confirmDialogOrder?._id === order._id ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <ShieldCheck className="h-4 w-4" />
                                                    )}
                                                    Confirm delivery
                                                </button>
                                            ) : order.orderStatus === "delivered" || order.orderStatus === "completed" ? (
                                                <div className="inline-flex items-center gap-2 rounded-lg bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
                                                    <CheckCircle2 className="h-4 w-4" />
                                                    Delivered
                                                </div>
                                            ) : (
                                                <div className="inline-flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-1 text-xs font-medium text-gray-500">
                                                    <Truck className="h-4 w-4" />
                                                    Awaiting pickup
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            <ConfirmDeliveryDialog
                open={!!confirmDialogOrder}
                order={confirmDialogOrder}
                onClose={() => {
                    setConfirmDialogOrder(null);
                    setActionError(null);
                }}
                onConfirm={handleConfirmDelivery}
                isSubmitting={isConfirming}
                error={actionError}
            />
        </div>
    );
};

export default RiderDashboard;
