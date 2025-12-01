// src/types/groupOrder.ts

// Phase-based status system
export type GroupPhase = 'filling' | 'checkout_window' | 'confirmed' | 'expired' | 'cancelled';

// Participant status
export type ParticipantStatus = 'reserved' | 'paid' | 'removed';

// Waitlist participant
export interface WaitlistParticipant {
  userId: string;
  user: {
    firstName: string;
    lastName: string;
    email?: string; // May be omitted for privacy when viewing other participants
    phone?: string; // May be omitted for privacy when viewing other participants
  };
  quantity: number;
  joinedAt: string;
  notifiedAt?: string;
  promotionDeadline?: string;
}

// Group participant
export interface GroupParticipant {
  id: string;
  userId?: string; // Optional - some API responses don't include this
  user: {
    _id?: string; // Sometimes included with user ID
    firstName: string;
    lastName: string;
    email?: string; // May be omitted for privacy when viewing other participants
    phone?: string; // May be omitted for privacy when viewing other participants
  };
  quantity: number;
  amount: number;

  // Status tracking
  status: ParticipantStatus;

  // Timestamps
  reservedAt: string;
  paidAt?: string;
  checkoutDeadline?: string;
  removedAt?: string;

  // Payment details (only after checkout)
  paymentReference?: string;
  deliveryInfo?: {
    address: string;
    city: string;
    state: string;
    phoneNumber: string;
  };
  deliveryFee?: number;
  orderId?: string;
}

// Product group configuration
export interface GroupConfig {
  minParticipants: number;
  maxParticipants: number;
  quantityPerPerson: {
    min: number;
    max: number;
  };
  targetQuantity: number;
  bulkPricePerUnit: number;
  deadlineHours: number;
  maxActiveGroups: number;
  checkoutWindowHours: number;
}

// Group order
export interface GroupOrder {
  _id: string;
  groupId: string;

  // Product info
  product: {
    _id: string;
    name: string;
    images: string[];
    unit?: string;
    bulkPrice?: number;
    regularPrice?: number;
  };

  // Configuration
  minParticipants: number;
  maxParticipants: number;
  quantityPerPerson: {
    min: number;
    max: number;
  };
  targetQuantity: number;
  bulkPricePerUnit: number;
  deadlineHours: number;
  maxActiveGroups: number;
  checkoutWindowDurationHours: number;

  // Phase tracking
  phase: GroupPhase;

  // Checkout window
  checkoutWindowOpensAt?: string;
  checkoutWindowClosesAt?: string;

  // Participants
  participants?: GroupParticipant[];
  participantsCount?: number;
  reservedSlots: number;
  paidSlots: number;
  spotsLeft?: number;

  // Waitlist
  waitlist?: WaitlistParticipant[];
  waitlistCount?: number;

  // Shareable link
  shareableCode: string;
  shareableLink?: string;

  // Status tracking
  groupFilledAt?: string;
  confirmedAt?: string;
  expiredAt?: string;
  cancelledAt?: string;
  cancelledReason?: string;
  fillWindowExpiresAt?: string; // When the group will be dissolved if not filled

  createdAt: string;
  updatedAt: string;
}

// Reserve slot request
export interface ReserveSlotRequest {
  quantity: number;
}

// Reserve slot response
export interface ReserveSlotResponse {
  success: boolean;
  message: string;
  data: {
    group: {
      groupId: string;
      phase: GroupPhase;
      reservedSlots: number;
      participantsCount: number;
      spotsLeft: number;
    };
    participant: {
      id: string;
      quantity: number;
      amount: number;
      status: ParticipantStatus;
      reservedAt: string;
      checkoutDeadline?: string;
    };
    checkoutWindow?: {
      opensAt: string;
      closesAt: string;
      durationHours: number;
    } | null;
  };
}

// Checkout request
export interface CheckoutRequest {
  deliveryInfo: {
    address: string;
    city: string;
    state: string;
    phoneNumber: string;
  };
  deliveryFee: number;
}

// Checkout response
export interface CheckoutResponse {
  success: boolean;
  message: string;
  data: {
    payment: {
      authorizationUrl: string;
      reference: string;
      amount: number;
      email: string;
    };
    group: {
      groupId: string;
      checkoutDeadline: string;
    };
  };
}

// Verify payment response
export interface VerifyPaymentResponse {
  success: boolean;
  data: {
    payment: {
      reference: string;
      status: string;
      amount: number;
      paidAt: string;
    };
    group: {
      groupId: string;
      phase: GroupPhase;
    };
    order: {
      _id: string;
      orderNumber: string;
      status: string;
    };
  };
}

// Join waitlist request
export interface JoinWaitlistRequest {
  quantity: number;
}

// Join waitlist response
export interface JoinWaitlistResponse {
  success: boolean;
  message: string;
  data: {
    group: {
      groupId: string;
      waitlistPosition: number;
    };
    waitlistEntry: {
      quantity: number;
      joinedAt: string;
    };
  };
}

// My participation
export interface MyParticipation {
  quantity: number;
  amount: number;
  status: ParticipantStatus;
  checkoutDeadline?: string;
  reservedAt: string;
  paidAt?: string;
  deliveryInfo?: {
    address: string;
    city: string;
    state: string;
    phoneNumber: string;
  };
  deliveryFee?: number;
  orderId?: string;
}

// My group order
export interface MyGroupOrder {
  groupId: string;
  product: {
    _id: string;
    name: string;
    images: string[];
    unit?: string;
  };
  phase: GroupPhase;
  myParticipation: MyParticipation;
  checkoutWindowOpensAt?: string;
  checkoutWindowClosesAt?: string;
  reservedSlots: number;
  paidSlots: number;
  minParticipants: number;
  maxParticipants: number;
  createdAt: string;
}

// Group order list response
export interface GroupOrderListResponse {
  groups: GroupOrder[];
}

// My groups response
export interface MyGroupsResponse {
  groups: MyGroupOrder[];
}

// Leave group response
export interface LeaveGroupResponse {
  success: boolean;
  message: string;
  data: {
    groupId: string;
  };
}

// Product with group config
export interface ProductWithGroupConfig {
  _id: string;
  name: string;
  images: string[];
  unit: string;
  price: number;
  groupBuyingEnabled: boolean;
  groupConfig?: GroupConfig;
}

// Admin: Configure group buying request
export interface ConfigureGroupBuyingRequest {
  groupBuyingEnabled: boolean;
  minParticipants: number;
  maxParticipants: number;
  quantityPerPerson: {
    min: number;
    max: number;
  };
  targetQuantity: number;
  bulkPricePerUnit: number;
  deadlineHours: number;
  maxActiveGroups: number;
  checkoutWindowHours: number;
}

// Admin: Group stats
export interface AdminGroupStats {
  totalFillingGroups: number;
  totalCheckoutWindowGroups: number;
  totalConfirmedGroups: number;
  totalExpiredGroups: number;
  totalCancelledGroups: number;
  totalRevenue: number;
}

// Admin: All groups response
export interface AdminGroupsResponse {
  groups: GroupOrder[];
  stats: AdminGroupStats;
}

// Admin: Cancel group request
export interface CancelGroupRequest {
  reason: string;
}

// Admin: Cancel group response
export interface CancelGroupResponse {
  success: boolean;
  message: string;
  data: {
    group: {
      groupId: string;
      phase: GroupPhase;
      cancelledAt: string;
      cancelledReason: string;
      participantsCount: number;
      paidParticipantsCount: number;
      totalRefunds: number;
    };
  };
}
