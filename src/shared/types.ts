export type UserRole = 'customer' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  active: boolean;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  categoryId: string;
  categoryName?: string;
  priceMinor: number; // Stored as integer minor units (cents)
  currency: string;   // 'USD'
  stock: number;
  active: boolean;
  imageUrl: string;
  imageAlt: string;
  features?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  productId: string;
  quantity: number;
  product?: Product;
}

export interface Cart {
  userId: string;
  items: CartItem[];
  updatedAt: string;
}

export type OrderStatus =
  | 'PENDING_PAYMENT'
  | 'PAID'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'REFUNDED';

export interface OrderItemSnapshot {
  productId: string;
  name: string;
  unitPriceMinor: number;
  quantity: number;
  subtotalMinor: number;
  imageUrl: string;
}

export interface DeliveryDetails {
  fullName: string;
  email: string;
  phone: string;
  addressLine1: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  items: OrderItemSnapshot[];
  subtotalMinor: number;
  shippingMinor: number;
  taxMinor: number;
  totalMinor: number;
  currency: string;
  deliveryDetails: DeliveryDetails;
  orderStatus: OrderStatus;
  paymentMethod: string;
  paymentProviderReference?: string;
  paymentStatus: 'UNPAID' | 'AUTHORIZED' | 'PAID' | 'REFUNDED' | 'FAILED';
  createdAt: string;
  updatedAt: string;
  statusHistory: Array<{
    status: OrderStatus;
    changedAt: string;
    changedBy: string;
    note?: string;
  }>;
}

export type InventoryReason =
  | 'INITIAL_SEED'
  | 'CHECKOUT_RESERVATION'
  | 'ORDER_FULFILLED'
  | 'ORDER_CANCELLED_RELEASE'
  | 'ADMIN_MANUAL_ADJUST'
  | 'ADMIN_RESTOCK';

export interface InventoryEvent {
  id: string;
  productId: string;
  productName: string;
  orderId?: string;
  change: number; // e.g. -2 for reservation, +10 for restock
  reason: InventoryReason;
  stockBefore: number;
  stockAfter: number;
  actorId: string;
  actorEmail: string;
  note?: string;
  createdAt: string;
}

export interface WebhookEventRecord {
  id: string;
  provider: string;
  eventId: string;
  orderId: string;
  amountMinor: number;
  currency: string;
  processedAt: string;
  outcome: 'SUCCESS' | 'DUPLICATE_IGNORED' | 'SIGNATURE_INVALID' | 'AMOUNT_MISMATCH';
}

export interface ApiResponse<T> {
  data?: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
  error?: {
    code: string;
    message: string;
    requestId?: string;
    details?: Record<string, string>;
  };
}

// Allowed state transitions according to Section 12.2 of the Spec
export const ALLOWED_ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING_PAYMENT: ['PAID', 'CANCELLED'],
  PAID: ['PROCESSING', 'REFUNDED'],
  PROCESSING: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['COMPLETED'],
  COMPLETED: [],
  CANCELLED: [],
  REFUNDED: [],
};

// Formats integer minor units to human currency string ($129.00)
export function formatMoney(priceMinor: number, currency = 'USD'): string {
  const amount = priceMinor / 100;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
