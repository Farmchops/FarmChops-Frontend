import type { OrderStatus, StageOwnerRole } from "@/types/orders";

export type OrderWorkflowAction =
	| "mark-processing"
	| "mark-ready-for-dispatch"
	| "assign-rider"
	| "confirm-pickup"
	| "confirm-delivery"
	| "fail-delivery"
	| "return-to-dispatch"
	| "cancel"
	| "close";

/**
 * Maps admin role (from user.adminRole) to workflow stage owner role.
 * This handles the discrepancy between admin system roles and order workflow roles.
 */
export const mapAdminRoleToStageOwnerRole = (adminRole?: string): StageOwnerRole | undefined => {
	if (!adminRole) return undefined;

	const mapping: Record<string, StageOwnerRole> = {
		'operations_officer': 'operations',
		'logistics': 'logistics',
		'customer_support': 'support',
		'rider': 'rider',
		'supervisor': 'supervisor',
		// Processing and packaging roles (if they exist in your system)
		'processing': 'processing',
		'packaging': 'packaging',
		// Finance has read-only access, maps to finance role
		'finance': 'finance',
	};

	return mapping[adminRole];
};

export interface OrderStatusConfig {
  key: OrderStatus;
  label: string;
  ownerRole: StageOwnerRole;
  accent: string;
  description?: string;
  nextActions: OrderWorkflowAction[];
}

export interface OrderActionRequirements {
	note?: boolean;
	riderId?: boolean;
	handoverCode?: boolean;
	proof?: boolean;
	reason?: boolean;
}

export interface OrderActionConfig {
	action: OrderWorkflowAction;
	label: string;
	targetStatus?: OrderStatus;
	permission: string;
	ownerRoles: StageOwnerRole[];
	requires?: OrderActionRequirements;
	variant?: "primary" | "secondary" | "danger";
	reasonLabel?: string;
	reasonPlaceholder?: string;
	notePlaceholder?: string;
  proofLabel?: string;
  handoverLabel?: string;
  riderLabel?: string;
}

/**
 * Order status configuration defining workflow stages.
 *
 * NOTE: Finance role has read-only access to orders for reporting purposes.
 * They are not assigned as stage owners and cannot perform workflow actions.
 */
export const ORDER_STATUS_CONFIG: Record<OrderStatus, OrderStatusConfig> = {
  pending_payment: {
    key: "pending_payment",
    label: "Pending Payment",
    ownerRole: "operations",
    accent: "bg-yellow-500",
    description: "Awaiting payment verification before processing",
    nextActions: ["mark-processing", "cancel"],
  },
  ready_for_processing: {
    key: "ready_for_processing",
    label: "Ready for Processing",
    ownerRole: "operations",
    accent: "bg-emerald-500",
    description: "Verified and ready for warehouse intake",
    nextActions: ["mark-processing", "cancel"],
  },
  processing: {
    key: "processing",
    label: "Processing",
    ownerRole: "processing",
    accent: "bg-amber-500",
    description: "Items are being picked and prepared",
    nextActions: ["mark-ready-for-dispatch", "cancel"],
  },
  packed: {
    key: "packed",
    label: "Packed",
    ownerRole: "packaging",
    accent: "bg-blue-500",
    description: "Order packed and awaiting dispatch prep",
    nextActions: ["mark-ready-for-dispatch", "cancel"],
  },
  ready_for_dispatch: {
    key: "ready_for_dispatch",
    label: "Ready for Dispatch",
    ownerRole: "logistics",
    accent: "bg-indigo-500",
    description: "Dispatch team to assign rider and handover code",
    nextActions: ["assign-rider", "cancel"],
  },
  awaiting_pickup: {
    key: "awaiting_pickup",
    label: "Awaiting Pickup",
    ownerRole: "logistics",
    accent: "bg-sky-500",
    description: "Rider has been assigned and pending pickup",
    nextActions: ["confirm-pickup", "fail-delivery", "return-to-dispatch", "cancel"],
  },
  en_route: {
    key: "en_route",
    label: "En Route",
    ownerRole: "rider",
    accent: "bg-purple-500",
    description: "Rider is on the way to customer",
    nextActions: ["confirm-delivery", "fail-delivery", "return-to-dispatch"],
  },
  delivered: {
    key: "delivered",
    label: "Delivered",
    ownerRole: "support",
    accent: "bg-green-600",
    description: "Delivery confirmed, awaiting completion",
    nextActions: ["close", "return-to-dispatch"],
  },
  completed: {
    key: "completed",
    label: "Completed",
    ownerRole: "support",
    accent: "bg-gray-500",
    description: "Order closed",
    nextActions: [],
  },
  cancelled: {
    key: "cancelled",
    label: "Cancelled",
    ownerRole: "support",
    accent: "bg-red-500",
    description: "Order cancelled",
    nextActions: [],
  },
  failed_delivery: {
    key: "failed_delivery",
    label: "Failed Delivery",
    ownerRole: "support",
    accent: "bg-rose-500",
    description: "Delivery failed, awaiting resolution",
    nextActions: ["return-to-dispatch", "cancel"],
  },
};

export const ORDER_ACTION_CONFIG: Record<OrderWorkflowAction, OrderActionConfig> = {
  "mark-processing": {
    action: "mark-processing",
    label: "Mark Processing",
    targetStatus: "processing",
    permission: "orders.processing.start",
    ownerRoles: ["operations", "processing"],
    notePlaceholder: "Add optional context for the processing team",
  },
  "mark-ready-for-dispatch": {
    action: "mark-ready-for-dispatch",
    label: "Ready for Dispatch",
    targetStatus: "ready_for_dispatch",
    permission: "orders.dispatch.prepare",
    ownerRoles: ["processing", "packaging", "logistics"],
    requires: { note: true },
    notePlaceholder: "Share packing or QC notes for logistics",
  },
  "assign-rider": {
    action: "assign-rider",
    label: "Assign Rider",
    targetStatus: "awaiting_pickup",
    permission: "orders.dispatch.assign",
    ownerRoles: ["logistics"],
    requires: { riderId: true, note: true },
    riderLabel: "Rider identifier",
    notePlaceholder: "Any dispatch notes for the rider",
  },
  "confirm-pickup": {
    action: "confirm-pickup",
    label: "Confirm Pickup",
    targetStatus: "en_route",
    permission: "orders.dispatch.handover",
    ownerRoles: ["logistics"],
    requires: { note: true, proof: true },
    notePlaceholder: "Record pickup context or issues",
    proofLabel: "Pickup proof (optional)",
  },
  "confirm-delivery": {
    action: "confirm-delivery",
    label: "Confirm Delivery",
    targetStatus: "delivered",
    permission: "orders.delivery.confirm",
    ownerRoles: ["rider", "logistics"],
    requires: { handoverCode: true, proof: true },
    handoverLabel: "Customer handover code",
    proofLabel: "Delivery proof (optional)",
  },
  "fail-delivery": {
    action: "fail-delivery",
    label: "Mark Failed Delivery",
    targetStatus: "failed_delivery",
    permission: "orders.dispatch.fail",
    ownerRoles: ["logistics", "support", "supervisor", "customer_support"],
    requires: { note: true, reason: true },
    reasonLabel: "Failure reason",
  reasonPlaceholder: "e.g. Customer unreachable",
    variant: "danger",
    notePlaceholder: "Document the attempt and escalation details",
  },
  "return-to-dispatch": {
    action: "return-to-dispatch",
    label: "Return to Dispatch",
    targetStatus: "ready_for_dispatch",
    permission: "orders.dispatch.return",
    ownerRoles: ["logistics", "support", "supervisor", "customer_support"],
    requires: { note: true, reason: true },
    reasonLabel: "Return reason",
    reasonPlaceholder: "Share why the order is returning to dispatch",
    notePlaceholder: "Assist the next team with context",
  },
  cancel: {
    action: "cancel",
    label: "Cancel Order",
    targetStatus: "cancelled",
    permission: "orders.override.cancel",
    ownerRoles: ["support", "supervisor", "customer_support"],
    requires: { note: true, reason: true },
    reasonLabel: "Cancellation reason",
    reasonPlaceholder: "Brief reason for cancellation",
    variant: "danger",
    notePlaceholder: "Add internal context for the audit trail",
  },
  close: {
    action: "close",
    label: "Close Order",
    targetStatus: "completed",
    permission: "orders.delivery.close",
    ownerRoles: ["support", "supervisor", "customer_support"],
    requires: { note: true },
    notePlaceholder: "Confirm successful fulfilment details",
  },
};

export const ORDER_STATUS_LIST: OrderStatus[] = Object.keys(ORDER_STATUS_CONFIG) as OrderStatus[];

export const getStatusConfig = (status?: string | null): OrderStatusConfig | undefined => {
  if (!status) return undefined;
  return ORDER_STATUS_CONFIG[status as OrderStatus];
};

export const getActionConfig = (action: OrderWorkflowAction): OrderActionConfig => ORDER_ACTION_CONFIG[action];

export const getAccentClass = (status?: string | null): string => {
  const config = getStatusConfig(status ?? undefined);
  return config?.accent ?? "bg-gray-400";
};

/**
 * Returns the list of order statuses that a given role is allowed to view.
 * Super admins can see all statuses.
 *
 * @param role - The stage owner role of the user
 * @param isSuperAdmin - Whether the user is a super admin
 * @returns Array of order statuses the role can view
 */
export const getVisibleStatusesForRole = (
	role?: StageOwnerRole,
	isSuperAdmin: boolean = false
): OrderStatus[] => {
	// Super admin sees everything
	if (isSuperAdmin) return ORDER_STATUS_LIST;

	// Finance sees all statuses (read-only for reporting)
	if (role === 'finance') return ORDER_STATUS_LIST;

	if (!role) return [];

	// Map each role to the statuses they should see
	const roleStatusMap: Record<StageOwnerRole, OrderStatus[]> = {
		// Operations sees early-stage orders
		operations: ['pending_payment', 'ready_for_processing', 'processing'],

		// Processing team sees orders they're working on
		processing: ['processing', 'packed', 'ready_for_dispatch'],

		// Packaging sees orders ready to pack and packed orders
		packaging: ['packed', 'ready_for_dispatch'],

		// Logistics sees dispatch-related statuses
		logistics: ['ready_for_dispatch', 'awaiting_pickup', 'failed_delivery'],

		// Riders see only delivery-related statuses
		rider: ['awaiting_pickup', 'en_route', 'failed_delivery'],

		// Support (customer_support) sees completed/problem orders
		support: ['delivered', 'completed', 'cancelled', 'failed_delivery'],
		customer_support: ['delivered', 'completed', 'cancelled', 'failed_delivery'],

		// Supervisors see everything
		supervisor: ORDER_STATUS_LIST,

		// Finance sees everything (read-only)
		finance: ORDER_STATUS_LIST,
	};

	return roleStatusMap[role] || [];
};
