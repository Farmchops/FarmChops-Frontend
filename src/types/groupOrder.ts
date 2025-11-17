// src/types/groupOrder.ts

export type GroupOrderStatus = 'active' | 'confirmed' | 'cancelled';

export interface GroupParticipant {
  id: string;
  userId: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  quantity: number;
  amount: number;
  paymentStatus: 'paid';
  paymentReference: string;
  paidAt: string;
  deliveryInfo: {
    address: string;
    city: string;
    state: string;
    phoneNumber: string;
  };
  deliveryFee: number;
  orderId?: string;
  joinedAt: string;
}

export interface GroupOrder {
  _id: string;
  groupId: string;

  product: {
    _id: string;
    name: string;
    images: string[];
    unit?: string;
  };

  totalSlots: number;
  quantityPerSlot: number;
  pricePerSlot: number;

  participants?: GroupParticipant[];
  participantsCount?: number;
  filledSlots: number;

  status: GroupOrderStatus;

  createdAt: string;
  confirmedAt?: string;
  cancelledAt?: string;
  cancelledReason?: string;
}

export interface JoinGroupRequest {
  deliveryAddress?: string;
  phoneNumber?: string;
  deliveryInfo?: {
    address: string;
    city: string;
    state: string;
    phoneNumber: string;
  };
  paymentReference?: string;
  paymentMethod?: 'paystack' | 'pay_later';
}

export interface MyGroupParticipation {
  quantity: number;
  amount: number;
  deliveryFee: number;
  totalPaid: number;
  paymentStatus: 'paid';
  joinedAt: string;
  orderId?: string;
}

export interface MyGroupOrder {
  _id: string;
  groupId: string;
  quantity: number;
  amountPaid: number;
  deliveryAddress: string;
  joinedAt: string;
  orderId?: string;
  product: {
    _id: string;
    name: string;
    images: string[];
    unit: string;
  };
  status: GroupOrderStatus;
  totalSlots: number;
  filledSlots: number;
  pricePerSlot: number;
  quantityPerSlot: number;
  createdAt: string;
  confirmedAt?: string;
}

export interface GroupOrderListResponse {
  groups: GroupOrder[];
  pagination?: {
    page: number;
    limit: number;
    totalGroups: number;
    totalPages: number;
  };
}

export interface JoinGroupResponse {
  success: boolean;
  message: string;
  payment?: {
    authorizationUrl: string;
    reference: string;
  };
  group?: {
    groupId: string;
    filledSlots: number;
    totalSlots: number;
    status: GroupOrderStatus;
  };
  order?: {
    _id: string;
    orderNumber: string;
    orderStatus: string;
  };
}
