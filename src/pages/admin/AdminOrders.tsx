import { skipToken } from "@reduxjs/toolkit/query";
import { useEffect, useMemo, useState } from "react";
import {
	AlertTriangle,
	BadgeCheck,
	ClipboardList,
	Clock,
	Loader2,
	MapPin,
	Package,
	RefreshCcw,
	Search,
	Signal,
	ShieldCheck,
	Truck,
	Users,
	X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
	useGetOrdersQuery,
	useGetOrderActionsQuery,
	useTriggerOrderActionMutation,
	type AdminOrder,
	type GetOrdersQueryArgs,
} from "@/redux/api/adminOrdersApi";
import {
	ORDER_STATUS_LIST,
	ORDER_ACTION_CONFIG,
	ORDER_STATUS_CONFIG,
	getAccentClass,
	getStatusConfig,
	type OrderWorkflowAction,
	type OrderActionConfig,
} from "@/utils/orderWorkflow";
import type { OrderItem, OrderStatus, StageOwnerRole } from "@/types/orders";
import { LoadingSpinner } from "@/components/LoadingSpinner";

interface LegacyOrderNotes {
	note?: string;
	orderNote?: string;
	customerNote?: string;
}

interface StatusHistoryAttachment {
	id?: string;
	url?: string;
	name?: string;
}

interface StatusHistoryMetadata {
	handoverMethod?: string | number;
	riderId?: string | number;
	attachments?: StatusHistoryAttachment[];
}

const formatCurrency = (amount: number) =>
	new Intl.NumberFormat(undefined, { style: "currency", currency: "NGN" }).format(amount);

const formatDateTime = (iso?: string, withTime = true) => {
	if (!iso) return "-";
	const date = new Date(iso);
	return date.toLocaleString(undefined, {
		year: "numeric",
		month: "short",
		day: "numeric",
		hour: withTime ? "2-digit" : undefined,
		minute: withTime ? "2-digit" : undefined,
	});
};

const formatName = (order: AdminOrder) => {
	const { user } = order;
	if (!user) return "-";
	if (typeof user === "string") return user;
	const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
	return fullName || user.email || "Customer";
};

const getApiBaseUrl = () => {
	const envBase = import.meta.env?.VITE_API_BASE_URL as string | undefined;
	return envBase ?? "https://api.farmchops.com/api";
};

const wsUrlFromApiBase = (apiBase: string, path = "/ws/admin/orders") => {
	const trimmed = apiBase.replace(/\/$/, "");
	const withoutApi = trimmed.replace(/\/api$/, "");
	const normalizedPath = path.startsWith("/") ? path : `/${path}`;
	return withoutApi.replace(/^http/, "ws") + normalizedPath;
};

const resolveErrorMessage = (error: unknown): string => {
	if (!error) return "Something went wrong. Please try again.";
	if (typeof error === "string") return error;
	if (typeof error === "object") {
		const typed = error as {
			data?: { message?: string; error?: string; code?: string } | undefined;
			error?: string;
			message?: string;
		};
		const data = (typed.data ?? {}) as { message?: string; error?: string; code?: string };
		const baseMessage = data.message ?? typed.message ?? typed.error ?? "Failed to complete the action. Please retry.";
		return data && "code" in data && data.code ? `${data.code}: ${baseMessage}` : baseMessage;
	}
	return "Failed to complete the action. Please retry.";
};

interface ActionFormValues {
	note?: string;
	riderId?: string;
	handoverCode?: string;
	proofFiles?: File[];
	reason?: string;
}

interface OrderActionModalProps {
	open: boolean;
	actionConfig?: OrderActionConfig;
	order?: AdminOrder | null;
	onClose: () => void;
	onSubmit: (values: ActionFormValues) => void;
	isSubmitting: boolean;
	error?: string | null;
}

const OrderActionModal = ({
	open,
	actionConfig,
	order,
	onClose,
	onSubmit,
	isSubmitting,
	error,
}: OrderActionModalProps) => {
	const [values, setValues] = useState<ActionFormValues>({});
	const [localError, setLocalError] = useState<string | null>(null);

	useEffect(() => {
		if (open) {
			setValues({});
			setLocalError(null);
		}
	}, [open, actionConfig?.action]);

	if (!open || !actionConfig) return null;

	const requires = actionConfig.requires ?? {};

	const handleSubmit = () => {
		if (requires.note && !values.note?.trim()) {
			setLocalError("Please provide a note for this action.");
			return;
		}

		if (requires.riderId && !values.riderId?.trim()) {
			setLocalError("Please provide the rider ID.");
			return;
		}

		if (requires.handoverCode && !values.handoverCode?.trim()) {
			setLocalError("Please enter the customer handover code.");
			return;
		}

		if (requires.reason && !values.reason?.trim()) {
			setLocalError(actionConfig.reasonLabel ? `${actionConfig.reasonLabel} is required.` : "Please provide a reason for this action.");
			return;
		}

		setLocalError(null);
		onSubmit(values);
	};

	return (
		<div className="fixed inset-0 z-[1050] flex items-center justify-center bg-black/40 p-4">
			<div className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-xl">
				<div className="flex items-center justify-between border-b px-6 py-4">
					<div>
						<p className="text-xs uppercase tracking-wide text-gray-500">{order?.orderNumber}</p>
						<h2 className="text-xl font-semibold">{actionConfig.label}</h2>
					</div>
					<button onClick={onClose} className="rounded p-2 hover:bg-gray-100" aria-label="Close">
						<X className="h-5 w-5" />
					</button>
				</div>

				<div className="space-y-4 px-6 py-5 text-sm">
					{requires.note && (
						<div className="space-y-2">
							<label className="block text-xs font-medium text-gray-600">Internal note</label>
							<textarea
								className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1D7B3C]/40"
								rows={4}
								placeholder={actionConfig.notePlaceholder ?? "Add context for this transition"}
								value={values.note ?? ""}
								onChange={(event) => setValues((prev) => ({ ...prev, note: event.target.value }))}
							/>
						</div>
					)}

					{requires.reason && (
						<div className="space-y-2">
							<label className="block text-xs font-medium text-gray-600">{actionConfig.reasonLabel ?? "Reason"}</label>
							<input
								type="text"
								className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1D7B3C]/40"
								placeholder={actionConfig.reasonPlaceholder ?? "Enter reason"}
								value={values.reason ?? ""}
								onChange={(event) => setValues((prev) => ({ ...prev, reason: event.target.value }))}
							/>
						</div>
					)}

					{requires.riderId && (
						<div className="space-y-2">
							<label className="block text-xs font-medium text-gray-600">{actionConfig.riderLabel ?? "Assign rider"}</label>
							<input
								type="text"
								className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1D7B3C]/40"
								placeholder={actionConfig.riderLabel ?? "Enter rider ID"}
								value={values.riderId ?? ""}
								onChange={(event) => setValues((prev) => ({ ...prev, riderId: event.target.value }))}
							/>
							<p className="text-xs text-gray-500">Provide the unique rider identifier from the logistics roster.</p>
						</div>
					)}

					{requires.handoverCode && (
						<div className="space-y-2">
							<label className="block text-xs font-medium text-gray-600">{actionConfig.handoverLabel ?? "Customer handover code"}</label>
							<input
								type="text"
								className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1D7B3C]/40"
								placeholder="Enter the code shared with the customer"
								value={values.handoverCode ?? ""}
								onChange={(event) => setValues((prev) => ({ ...prev, handoverCode: event.target.value }))}
							/>
							{order?.handoverCodeMasked ? (
								<p className="text-xs text-gray-500">Masked hint: {order.handoverCodeMasked}</p>
							) : null}
						</div>
					)}

					{requires.proof && (
						<div className="space-y-2">
							<label className="block text-xs font-medium text-gray-600">{actionConfig.proofLabel ?? "Proof (optional)"}</label>
							<input
								type="file"
								multiple
								accept="image/*,application/pdf"
								onChange={(event) => {
									const files = Array.from(event.target.files ?? []);
									setValues((prev) => ({ ...prev, proofFiles: files }));
								}}
								className="block w-full text-xs text-gray-600"
							/>
							<p className="text-xs text-gray-500">Upload photos or signed acknowledgment. Accepted formats: images or PDF.</p>
						</div>
					)}

					{localError ? <p className="text-xs text-red-600">{localError}</p> : null}
					{error ? <p className="text-xs text-red-600">{error}</p> : null}
				</div>

				<div className="flex justify-end gap-3 border-t bg-gray-50 px-6 py-4">
					<button
						onClick={onClose}
						className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-white"
						disabled={isSubmitting}
					>
						Cancel
					</button>
					<button
						onClick={handleSubmit}
						className={cn(
							"rounded-lg px-4 py-2 text-sm font-medium text-white",
							actionConfig.variant === "danger"
								? "bg-red-600 hover:bg-red-700"
								: "bg-[#1D7B3C] hover:bg-green-800"
						)}
						disabled={isSubmitting}
					>
						{isSubmitting ? (
							<span className="flex items-center gap-2">
								<Loader2 className="h-4 w-4 animate-spin" />
								Processing...
							</span>
						) : (
							actionConfig.label
						)}
					</button>
				</div>
			</div>
		</div>
	);
};

interface OrderDetailPanelProps {
	order: AdminOrder;
	onClose: () => void;
	onAction: (action: OrderWorkflowAction) => void;
	allowedActions: OrderWorkflowAction[];
	isActionLoading: boolean;
	actionError?: string | null;
	actionSuccess?: string | null;
}

const OrderDetailPanel = ({ order, onClose, onAction, allowedActions, isActionLoading, actionError, actionSuccess }: OrderDetailPanelProps) => {
	const statusConfig = getStatusConfig(order.orderStatus);
	const totalNaira =
		typeof order.summary?.totalAmountInNaira === "number"
			? order.summary.totalAmountInNaira
			: typeof order.totalAmount === "number"
			? order.totalAmount / 100
			: 0;

	const legacyNotes = order as AdminOrder & LegacyOrderNotes;
	const buyerNote = legacyNotes.notes ?? legacyNotes.note ?? legacyNotes.orderNote ?? legacyNotes.customerNote ?? "-";

	const blockers = order.blockers ?? [];
	const customerEmail = typeof order.user === "string" ? "" : order.user?.email ?? "";

	return (
		<div className="fixed inset-0 z-[1040] flex items-center justify-center bg-black/45 p-4">
			<div className="relative flex h-full max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
				<div className="flex items-start justify-between border-b px-6 py-4">
					<div>
						<div className="flex items-center gap-2 text-xs uppercase tracking-wide text-gray-500">
							<span>{order.orderNumber}</span>
							<span>•</span>
							<span>Created {formatDateTime(order.createdAt)}</span>
						</div>
						<div className="mt-1 flex items-center gap-3">
							<h2 className="text-2xl font-semibold">{statusConfig?.label ?? order.orderStatus}</h2>
							<span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium text-white ${getAccentClass(order.orderStatus)}`}>
								{order.currentStageOwnerRole ?? "Unassigned"}
							</span>
						</div>
					</div>
					<button onClick={onClose} className="rounded-full p-2 hover:bg-gray-100" aria-label="Close details">
						<X className="h-5 w-5" />
					</button>
				</div>

				<div className="flex flex-1 flex-col overflow-y-auto">
					<div className="grid grid-cols-1 gap-6 px-6 py-6 lg:grid-cols-3">
						<div className="space-y-6 lg:col-span-2">
							<section className="rounded-2xl border border-gray-200 bg-gray-50/80 p-5">
								<div className="flex flex-wrap items-center justify-between gap-3">
									<div>
										<p className="text-xs uppercase tracking-wide text-gray-500">Order total</p>
										<p className="text-2xl font-semibold text-gray-900">{formatCurrency(totalNaira)}</p>
									</div>
									<div className="text-sm text-gray-600">
										<p>Payment: {order.paymentStatus ?? "-"}</p>
										<p className="text-xs text-gray-500">Method: {order.paymentMethod ?? "-"}</p>
									</div>
								</div>
								<div className="mt-4 grid gap-3 sm:grid-cols-2">
									<div className="rounded-xl bg-white p-4 shadow-sm">
										<div className="flex items-center gap-2 text-xs font-semibold uppercase text-gray-500">
											<Users className="h-4 w-4" /> Customer
										</div>
										<p className="mt-1 text-sm font-medium text-gray-900">{formatName(order)}</p>
										<p className="text-xs text-gray-500">{customerEmail || "-"}</p>
										<p className="text-xs text-gray-500">{order.deliveryInfo?.phoneNumber ?? "-"}</p>
									</div>
									<div className="rounded-xl bg-white p-4 shadow-sm">
										<div className="flex items-center gap-2 text-xs font-semibold uppercase text-gray-500">
											<MapPin className="h-4 w-4" /> Delivery address
										</div>
										<p className="mt-1 text-sm font-medium text-gray-900">{order.deliveryInfo?.address ?? "-"}</p>
										<p className="text-xs text-gray-500">{order.deliveryInfo?.city ?? ""}</p>
									</div>
								</div>
							</section>

							<section className="space-y-3">
								<div className="flex items-center justify-between">
									<h3 className="text-sm font-semibold uppercase tracking-wide text-gray-600">Items</h3>
									<span className="text-xs text-gray-500">{order.items?.length ?? 0} items</span>
								</div>
								<div className="overflow-hidden rounded-2xl border border-gray-200">
									{order.items?.length ? (
										order.items.map((item: OrderItem) => {
											const productId = item.product?._id ?? item.product?.id ?? item.productName;
											const itemName = item.productName || item.product?.name || "Item";
											const lineTotal = typeof item.totalPrice === "number" ? item.totalPrice / 100 : 0;
											return (
												<div key={productId} className="flex items-center justify-between gap-4 border-b border-gray-200 bg-white px-4 py-3 text-sm last:border-b-0">
													<div>
														<p className="font-medium text-gray-900">{itemName}</p>
														<p className="text-xs text-gray-500">Qty: {item.quantity}</p>
													</div>
													<p className="font-medium text-gray-800">{formatCurrency(lineTotal)}</p>
											</div>
											);
										})
									) : (
										<div className="bg-white px-4 py-6 text-center text-sm text-gray-500">No items recorded for this order.</div>
									)}
								</div>
							</section>

							<section className="rounded-2xl border border-gray-200 bg-white p-5">
								<h3 className="text-sm font-semibold uppercase tracking-wide text-gray-600">Status timeline</h3>
								<div className="mt-4 space-y-4">
									{order.statusHistory?.length ? (
										order.statusHistory.map((entry, idx) => {
											const metadata = (entry.metadata ?? {}) as StatusHistoryMetadata;
											const attachments = Array.isArray(metadata.attachments) ? metadata.attachments : [];
											const handoverMethod = metadata.handoverMethod;
											const riderId = metadata.riderId;
											return (
												<div key={entry._id ?? idx} className="relative flex gap-3">
													<div className="flex flex-col items-center">
														<span className={`mt-1 inline-flex h-2 w-2 rounded-full ${getAccentClass(entry.status)}`} />
														{idx !== order.statusHistory.length - 1 ? <span className="mt-1 h-full w-px bg-gray-200" /> : null}
													</div>
													<div className="flex-1 rounded-xl bg-gray-50 p-3">
														<div className="flex flex-wrap items-center justify-between gap-2">
															<p className="text-sm font-semibold text-gray-900">{getStatusConfig(entry.status)?.label ?? entry.status}</p>
															<span className="text-xs text-gray-500">{formatDateTime(entry.timestamp)}</span>
														</div>
														<p className="mt-1 text-xs text-gray-600">{entry.note ?? "No note provided."}</p>
														<div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-500">
															{entry.updatedBy?.name ? (
																<span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 shadow-sm">
																	<ShieldCheck className="h-3 w-3 text-[#1D7B3C]" />
																	{entry.updatedBy.name} {entry.updatedBy.role ? `(${entry.updatedBy.role})` : ""}
																</span>
															) : null}
															{handoverMethod ? (
																<span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 shadow-sm">
																	<Truck className="h-3 w-3 text-[#1D7B3C]" />
																	{String(handoverMethod)}
																</span>
															) : null}
															{riderId ? (
																<span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 shadow-sm">
																	<Users className="h-3 w-3 text-[#1D7B3C]" /> Rider {String(riderId)}
																</span>
															) : null}
														</div>
														{attachments.length ? (
															<div className="mt-2 space-y-1">
																<p className="text-xs font-semibold text-gray-500">Attachments</p>
																<ul className="list-inside list-disc text-xs text-[#1D7B3C]">
																	{attachments.map((attachment, attachmentIdx) => (
																		<li key={attachment.id ?? attachmentIdx}>
																			<a
																				href={attachment.url ?? "#"}
																				target="_blank"
																				rel="noopener noreferrer"
																				className="hover:underline"
																			>
																				{attachment.name ?? attachment.url ?? `Attachment ${attachmentIdx + 1}`}
																			</a>
																		</li>
																	))}
																</ul>
															</div>
														) : null}
													</div>
											</div>
										);
										})
									) : (
										<p className="text-sm text-gray-500">No history available.</p>
									)}
								</div>
							</section>
						</div>

						<div className="space-y-5">
							<section className="rounded-2xl border border-gray-200 bg-white p-5">
								<div className="flex items-center justify-between">
									<h3 className="text-sm font-semibold uppercase tracking-wide text-gray-600">Workflow</h3>
									<span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-medium text-white ${getAccentClass(order.orderStatus)}`}>
										{statusConfig?.ownerRole ?? "-"}
									</span>
								</div>
								<div className="mt-3 space-y-2 text-xs text-gray-600">
									<p>
										Current owner: <span className="font-semibold text-gray-900">{order.currentStageOwnerRole ?? statusConfig?.ownerRole ?? "-"}</span>
									</p>
									<p>Last update: {formatDateTime(order.updatedAt)}</p>
									<p>Handover code issued: {order.handoverCodeIssuedAt ? formatDateTime(order.handoverCodeIssuedAt) : "Not generated"}</p>
									<p>Code active: {order.handoverCodeActive ? "Yes" : "No"}</p>
									{order.handoverCodeMasked ? <p>Masked code hint: <span className="font-semibold">{order.handoverCodeMasked}</span></p> : null}
									{order.handoverCodeExpiresAt ? <p>Code expires: {formatDateTime(order.handoverCodeExpiresAt)}</p> : null}
									{order.handoverVerifiedAt ? <p>Handover verified: {formatDateTime(order.handoverVerifiedAt)}</p> : null}
								</div>
								{order.assignedRider ? (
									<div className="mt-4 rounded-xl border border-dashed border-[#1D7B3C]/30 bg-[#1D7B3C]/5 p-3 text-xs text-gray-700">
										<div className="flex items-center gap-2 font-semibold text-[#1D7B3C]">
											<Truck className="h-4 w-4" /> Assigned rider
										</div>
										<p className="mt-1">{order.assignedRider.name}</p>
										<p className="text-xs text-gray-500">ID: {order.assignedRider.id}</p>
										{order.assignedRider.phone ? <p className="text-xs text-gray-500">Phone: {order.assignedRider.phone}</p> : null}
									</div>
								) : null}
							</section>

							<section className="rounded-2xl border border-gray-200 bg-white p-5">
								<h3 className="text-sm font-semibold uppercase tracking-wide text-gray-600">Action bar</h3>
								{actionSuccess ? (
									<p className="mt-3 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-xs text-green-700">
										{actionSuccess}
									</p>
								) : null}
								{actionError ? (
									<p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
										{actionError}
									</p>
								) : null}
								<div className="mt-3 flex flex-wrap gap-3">
									{isActionLoading ? (
										<span className="inline-flex items-center gap-2 text-xs text-gray-500">
											<Loader2 className="h-4 w-4 animate-spin text-[#1D7B3C]" />
											Checking available transitions…
										</span>
									) : allowedActions.length ? (
										allowedActions.map((action) => {
											const config = ORDER_ACTION_CONFIG[action];
											if (!config) return null;
											const variant = config.variant ?? "primary";
											return (
												<button
													key={action}
													onClick={() => onAction(action)}
													className={cn(
														"rounded-full px-4 py-2 text-sm font-medium transition-colors",
														variant === "danger"
															? "bg-red-50 text-red-600 hover:bg-red-100"
															: "bg-[#1D7B3C]/10 text-[#1D7B3C] hover:bg-[#1D7B3C]/20"
													)}
													disabled={isActionLoading}
												>
													{config.label}
												</button>
											);
										})
									) : (
										<p className="text-xs text-gray-500">No transitions available for your permission level.</p>
									)}
								</div>
							</section>

							<section className="rounded-2xl border border-gray-200 bg-white p-5">
								<div className="flex items-center gap-2">
									<ClipboardList className="h-4 w-4 text-[#1D7B3C]" />
									<h3 className="text-sm font-semibold uppercase tracking-wide text-gray-600">Customer note</h3>
								</div>
								<p className="mt-2 text-sm text-gray-700">{buyerNote || "-"}</p>
							</section>

							<section className="rounded-2xl border border-gray-200 bg-white p-5">
								<div className="flex items-center gap-2">
									<BadgeCheck className="h-4 w-4 text-[#1D7B3C]" />
									<h3 className="text-sm font-semibold uppercase tracking-wide text-gray-600">Blockers & alerts</h3>
								</div>
								<div className="mt-3 space-y-2">
									{blockers.length ? (
										blockers.map((blocker, idx) => (
											<div key={blocker.code ?? idx} className="flex items-start gap-2 rounded-xl bg-red-50 p-3 text-xs text-red-700">
												<AlertTriangle className="mt-0.5 h-4 w-4" />
												<div>
													<p className="font-semibold">{blocker.message ?? blocker.code ?? "Issue"}</p>
													{blocker.code ? <p className="text-[11px] uppercase text-red-400">{blocker.code}</p> : null}
												</div>
											</div>
										))
									) : (
										<p className="text-xs text-gray-500">No outstanding blockers for this order.</p>
									)}
								</div>
							</section>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

const statusFilterOptions = [{ key: "all" as const, label: "All orders" }, ...ORDER_STATUS_LIST.map((status) => ({ key: status, label: ORDER_STATUS_CONFIG[status].label }))];

const ownerRoleOptions: Array<{ key: StageOwnerRole | "all"; label: string }> = [
	{ key: "all", label: "All teams" },
	{ key: "operations", label: "Operations" },
	{ key: "processing", label: "Processing" },
	{ key: "packaging", label: "Packaging" },
	{ key: "logistics", label: "Logistics" },
	{ key: "rider", label: "Rider" },
	{ key: "support", label: "Support" },
	{ key: "supervisor", label: "Supervisors" },
];

const AdminOrders = () => {
	const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
	const [ownerFilter, setOwnerFilter] = useState<StageOwnerRole | "all">("all");
	const [searchInput, setSearchInput] = useState("");
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
	const [requestedAction, setRequestedAction] = useState<OrderWorkflowAction | null>(null);
	const [actionError, setActionError] = useState<string | null>(null);
	const [actionSuccess, setActionSuccess] = useState<string | null>(null);
	const [connectionState, setConnectionState] = useState<"connecting" | "online" | "offline">("connecting");

	const PAGE_SIZE = 60;
	const DEFAULT_PAGE = 1;

	const queryArgs = useMemo<GetOrdersQueryArgs>(() => {
		const args: GetOrdersQueryArgs = { limit: PAGE_SIZE, page: DEFAULT_PAGE };
		if (statusFilter !== "all") args.status = statusFilter;
		if (ownerFilter !== "all") args.ownerRole = ownerFilter;
		if (searchQuery.trim()) args.search = searchQuery.trim();
		return args;
	}, [ownerFilter, searchQuery, statusFilter]);

	const { data: ordersResponse, isLoading, isFetching, refetch } = useGetOrdersQuery(queryArgs);
	const [triggerOrderAction, { isLoading: isActionSubmitting }] = useTriggerOrderActionMutation();

	const selectedOrderId = selectedOrder?._id;
	const {
		data: orderActionsResponse,
		isFetching: isOrderActionsFetching,
		refetch: refetchOrderActions,
	} = useGetOrderActionsQuery(selectedOrderId ?? skipToken);
	const serverActions = orderActionsResponse?.data?.actions ?? [];

	const orders = useMemo<AdminOrder[]>(() => {
		const payload = ordersResponse?.data;
		if (!payload) return [];
		return Array.isArray(payload) ? (payload as AdminOrder[]) : payload.orders ?? [];
	}, [ordersResponse]);

	useEffect(() => {
		if (!selectedOrder) return;
		const updated = orders.find((order) => order._id === selectedOrder._id);
		if (updated && updated !== selectedOrder) {
			setSelectedOrder(updated);
		}
	}, [orders, selectedOrder]);

	useEffect(() => {
		setConnectionState("connecting");
		const apiBase = getApiBaseUrl();
		let isMounted = true;
		let socket: WebSocket | null = null;

		try {
			const ws = new WebSocket(wsUrlFromApiBase(apiBase));
			socket = ws;
			ws.onopen = () => {
				if (!isMounted) return;
				setConnectionState("online");
			};
			ws.onerror = () => {
				if (!isMounted) return;
				setConnectionState("offline");
			};
			ws.onclose = () => {
				if (!isMounted) return;
				setConnectionState("offline");
			};
			ws.onmessage = (event) => {
				if (!isMounted) return;
				try {
					const payload = JSON.parse(event.data as string) as { type?: string };
					if (payload?.type && payload.type.startsWith("order.")) {
						refetch();
					}
				} catch {
					// ignore malformed messages
				}
			};
		} catch {
			setConnectionState("offline");
		}

		return () => {
			isMounted = false;
			socket?.close();
		};
	}, [refetch]);

	const allowedActions = useMemo<OrderWorkflowAction[]>(() => {
		const apiActions = serverActions.filter(
			(action): action is OrderWorkflowAction => Boolean(ORDER_ACTION_CONFIG[action])
		);
		if (apiActions.length) return apiActions;
		if (!selectedOrder) return [];
		return getStatusConfig(selectedOrder.orderStatus)?.nextActions ?? [];
	}, [selectedOrder, serverActions]);

	const activeStatuses = statusFilter === "all" ? ORDER_STATUS_LIST : [statusFilter];
	const isActionModalOpen = Boolean(requestedAction && selectedOrder);

	const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setSearchQuery(searchInput);
	};

	const handleClearSearch = () => {
		setSearchInput("");
		setSearchQuery("");
	};

	const handleOpenOrder = (order: AdminOrder) => {
		setSelectedOrder(order);
		setRequestedAction(null);
		setActionError(null);
		setActionSuccess(null);
	};

	const handleCloseOrder = () => {
		setSelectedOrder(null);
		setRequestedAction(null);
		setActionError(null);
		setActionSuccess(null);
	};

	const handleRequestAction = (action: OrderWorkflowAction) => {
		setRequestedAction(action);
		setActionError(null);
		setActionSuccess(null);
	};

	const handleActionSubmit = async (values: ActionFormValues) => {
		if (!selectedOrder || !requestedAction) return;
		const actionConfig = ORDER_ACTION_CONFIG[requestedAction];
		if (!actionConfig) return;

		setActionError(null);
		setActionSuccess(null);

		const payload: Record<string, unknown> = {};
		if (values.note?.trim()) payload.note = values.note.trim();
		if (values.riderId?.trim()) payload.riderId = values.riderId.trim();
		if (values.handoverCode?.trim()) payload.handoverCode = values.handoverCode.trim();
		if (values.reason?.trim()) payload.reason = values.reason.trim();

		let body: Record<string, unknown> | FormData = payload;
		if (actionConfig.requires?.proof && values.proofFiles?.length) {
			const formData = new FormData();
			Object.entries(payload).forEach(([key, value]) => {
				if (value !== undefined && value !== null) {
					formData.append(key, String(value));
				}
			});
			values.proofFiles.forEach((file) => formData.append("proof", file));
			body = formData;
		}

		try {
			await triggerOrderAction({
				id: selectedOrder._id,
				action: requestedAction,
				payload: body,
			}).unwrap();
			setRequestedAction(null);
			setActionSuccess(`${actionConfig.label} completed.`);
			refetch();
			if (selectedOrderId) {
				refetchOrderActions();
			}
		} catch (error) {
			setActionError(resolveErrorMessage(error));
		}
	};

	const totalOrders = orders.length;

	return (
		<div className="space-y-6 p-6">
			<div className="flex flex-wrap items-center justify-between gap-4">
				<div>
					<h1 className="text-2xl font-semibold text-[#1D7B3C]">Orders workflow</h1>
					<p className="text-sm text-gray-500">Track each stage and collaborate with the fulfilment teams in real-time.</p>
				</div>
				<div className="flex items-center gap-3">
					<div
						className={cn(
							"flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium",
							connectionState === "online"
								? "bg-[#1D7B3C]/10 text-[#1D7B3C]"
								: "bg-amber-100 text-amber-700"
						)}
					>
						<Signal className="h-3.5 w-3.5" />
						{connectionState === "online" ? "Live updates on" : connectionState === "connecting" ? "Connecting…" : "Live updates offline"}
					</div>
					<button
						onClick={() => refetch()}
						type="button"
						className="inline-flex items-center gap-2 rounded-full border border-[#1D7B3C]/30 px-4 py-2 text-sm font-medium text-[#1D7B3C] transition hover:border-[#1D7B3C] focus:outline-none"
						disabled={isFetching}
					>
						<RefreshCcw className={cn("h-4 w-4", isFetching && "animate-spin")} />
						Refresh
					</button>
				</div>
			</div>

			<div className="flex flex-col gap-4 rounded-3xl bg-white p-5 shadow-sm">
				<form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center gap-3">
					<div className="relative">
						<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
						<input
							type="search"
							value={searchInput}
							onChange={(event) => setSearchInput(event.target.value)}
							placeholder="Search by order number or customer"
							className="w-full rounded-full border border-gray-200 bg-gray-50 py-2 pl-10 pr-3 text-sm focus:border-[#1D7B3C] focus:bg-white focus:outline-none"
						/>
					</div>
					<div className="flex items-center gap-2">
						<button
							type="submit"
							className="rounded-full bg-[#1D7B3C] px-4 py-2 text-sm font-medium text-white hover:bg-[#166430] focus:outline-none"
						>
							Search
						</button>
						{searchQuery ? (
							<button
								type="button"
								onClick={handleClearSearch}
								className="rounded-full border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-100"
							>
								Clear
							</button>
						) : null}
					</div>
					<select
						value={ownerFilter}
						onChange={(event) => setOwnerFilter(event.target.value as StageOwnerRole | "all")}
						className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 focus:border-[#1D7B3C] focus:outline-none"
					>
						{ownerRoleOptions.map((option) => (
							<option key={option.key} value={option.key}>
								{option.label}
							</option>
						))}
					</select>
					<div className="ml-auto flex items-center gap-2 text-xs text-gray-500">
						<Package className="h-4 w-4 text-[#1D7B3C]" />
						<span>{totalOrders} orders</span>
					</div>
				</form>

				<div className="flex gap-2 overflow-x-auto pb-2">
					{statusFilterOptions.map((option) => {
						const isActive = option.key === statusFilter;
						return (
							<button
								key={option.key}
								type="button"
								onClick={() => setStatusFilter(option.key)}
								className={cn(
									"whitespace-nowrap rounded-full border px-4 py-2 text-sm transition",
									isActive ? "border-[#1D7B3C] bg-[#1D7B3C] text-white" : "border-gray-200 bg-gray-100 text-gray-600 hover:bg-white"
								)}
							>
								{option.label}
							</button>
						);
					})}
				</div>
			</div>

			{isLoading && !orders.length ? (
				<div className="flex justify-center py-20">
					<LoadingSpinner size="lg" />
				</div>
			) : (
				<div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
					{activeStatuses.map((status) => {
						const statusConfig = ORDER_STATUS_CONFIG[status];
						const statusOrders = orders.filter((order) => order.orderStatus === status);
						return (
							<div key={status} className="flex flex-col rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-xs uppercase tracking-wide text-gray-500">{statusConfig.ownerRole}</p>
										<h2 className="text-lg font-semibold text-gray-900">{statusConfig.label}</h2>
									</div>
									<span className={`rounded-full px-3 py-1 text-xs font-medium text-white ${statusConfig.accent}`}>
										{statusOrders.length}
									</span>
								</div>
								<p className="mt-2 text-xs text-gray-500">{statusConfig.description}</p>
								<div className="mt-4 space-y-3">
									{statusOrders.length ? (
										statusOrders.map((order) => (
											<button
												key={order._id}
												type="button"
												onClick={() => handleOpenOrder(order)}
												className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-4 text-left transition hover:border-[#1D7B3C] hover:bg-white"
											>
												<div className="flex items-center justify-between text-sm font-semibold text-gray-900">
													<span>{order.orderNumber}</span>
													<span>{formatCurrency((order.summary?.totalAmountInNaira ?? order.totalAmount / 100) || 0)}</span>
												</div>
												<p className="mt-1 text-xs text-gray-500">Placed {formatDateTime(order.createdAt)}</p>
												<div className="mt-3 flex items-center justify-between text-xs text-gray-500">
													<span className="flex items-center gap-1">
														<Users className="h-3.5 w-3.5 text-[#1D7B3C]" />
														{formatName(order)}
													</span>
													<span className="flex items-center gap-1">
														<Clock className="h-3.5 w-3.5 text-gray-400" />
														{order.statusHistory?.length ? `${order.statusHistory.length} updates` : "No updates"}
													</span>
												</div>
											</button>
										))
									) : (
										<p className="rounded-2xl border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500">No orders in this stage.</p>
									)}
								</div>
							</div>
						);
					})}
				</div>
			)}

			{selectedOrder ? (
				<OrderDetailPanel
					order={selectedOrder}
					onClose={handleCloseOrder}
					onAction={handleRequestAction}
					allowedActions={allowedActions}
					isActionLoading={isActionSubmitting || isOrderActionsFetching}
					actionError={actionError}
					actionSuccess={actionSuccess}
				/>
			) : null}

			{isActionModalOpen ? (
				<OrderActionModal
					open={isActionModalOpen}
					actionConfig={requestedAction ? ORDER_ACTION_CONFIG[requestedAction] : undefined}
					order={selectedOrder}
					onClose={() => setRequestedAction(null)}
					onSubmit={handleActionSubmit}
					isSubmitting={isActionSubmitting}
					error={actionError}
				/>
			) : null}
		</div>
	);
};

export default AdminOrders;

