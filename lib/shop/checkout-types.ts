import type { RentOrBuy } from "./types";

/**
 * Response shapes of the backend's cart / checkout / order endpoints (see
 * Loopwear-backend/docs/CHECKOUT_ORDER_FLOW.md). Every amount arrives as a
 * pricing envelope: `base` is integer paise in INR (what the backend
 * charges and what the client echoes back), `display` is the same amount
 * converted to the shopper's display currency, ready to render.
 */
export type Pricing<K extends string> = {
  baseCurrency: string;
  displayCurrency: string;
  fxRate: number;
  base: Record<`${K}Paise`, number>;
  display: Record<K, number>;
};

export type OrderStatus =
  | "pending_payment"
  | "confirmed"
  | "packed"
  | "shipped"
  | "with_customer"
  | "return_in_transit"
  | "closed"
  | "cancelled"
  | "payment_failed"
  | "refunded";

export type LineIssueCode =
  | "product_unavailable"
  | "variant_unavailable"
  | "out_of_stock"
  | "insufficient_stock"
  | "rental_date_invalid"
  | "price_changed";

export type LineIssue = { code: LineIssueCode; message: string; blocking: boolean; available?: number };

export type ApiCartLine = {
  id: string;
  productId: string;
  variantId: string;
  mode: RentOrBuy;
  size: string;
  quantity: number;
  startDate: string | null;
  endDate: string | null;
  product: { id: string; name: string; brand: string; rentDays: number; imageUrl: string | null };
  variant: { id: string; color: string; colorHex: string };
  status: "ok" | "warning" | "blocked";
  issues: LineIssue[];
  availableQuantity: number;
  maxQuantity: number;
  pricing: Pricing<"unitPrice" | "deposit" | "lineTotal" | "lineDeposit">;
};

export type CartSummaryPricing = Pricing<"rentSubtotal" | "buySubtotal" | "subtotal" | "discount" | "depositTotal" | "total" | "grandTotal">;

export type ApiCart = {
  id: string;
  items: ApiCartLine[];
  coupon: { code: string; applied: boolean; message: string | null; pricing: Pricing<"discount"> } | null;
  summary: CartSummaryPricing;
  itemCount: number;
  lineCount: number;
  canCheckout: boolean;
  blockers: string[];
};

export type ApiPriceChange = {
  itemId: string;
  productName: string;
  message: string;
  pricing: Pricing<"previousUnitPrice" | "currentUnitPrice">;
};

export type ApiMergeReport = {
  merged: number;
  dropped: { productId: string; size: string; mode: string; reason: string; message: string }[];
  reduced: { productId: string; size: string; mode: string; quantity: number; message: string }[];
};

export type ApiAddress = {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  line1: string;
  line2: string | null;
  landmark: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AddressInput = {
  label: string;
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  landmark?: string;
  city: string;
  state: string;
  postalCode: string;
  isDefault?: boolean;
};

export type ApiDeliveryOption = {
  code: string;
  label: string;
  description: string;
  minDays: number;
  maxDays: number;
  estimatedFrom: string;
  estimatedTo: string;
  available: boolean;
  unavailableReason: string | null;
  pricing: Pricing<"fee" | "baseFee">;
};

export type ApiCheckoutSummary = {
  cart: ApiCart;
  addresses: ApiAddress[];
  defaultAddressId: string | null;
  deliveryOptions: ApiDeliveryOption[];
  canCheckout: boolean;
  blockers: string[];
  holdMinutes: number;
};

export type OrderPricing = Pricing<"rentSubtotal" | "buySubtotal" | "subtotal" | "discount" | "deliveryFee" | "depositTotal" | "total" | "grandTotal">;

export type ApiOrderPreview = {
  canPlaceOrder: boolean;
  blockers: string[];
  cart: ApiCart;
  address: ApiAddress;
  delivery: ApiDeliveryOption;
  deliveryOptions: ApiDeliveryOption[];
  pricing: OrderPricing;
  /** Echo back as POST /orders' expectedTotalPaise. */
  expectedTotalPaise: number;
  holdMinutes: number;
};

export type ApiPaymentSession =
  | {
      gateway: "razorpay";
      paymentId: string;
      orderId: string;
      razorpayOrderId: string;
      keyId: string;
      amount: number;
      currency: string;
      expiresAt: string | null;
      prefill: { name: string; email: string; contact: string };
    }
  | {
      gateway: "stripe";
      paymentId: string;
      orderId: string;
      clientSecret: string;
      amount: number;
      currency: string;
      expiresAt: string | null;
    };

export type ApiOrderLine = {
  key: string;
  productId: string;
  variantId: string | null;
  productName: string;
  color: string | null;
  imageUrl: string | null;
  mode: RentOrBuy;
  size: string;
  quantity: number;
  rentStartDate: string | null;
  rentReturnDate: string | null;
  pricing: Pricing<"unitPrice" | "deposit" | "lineTotal" | "lineDeposit">;
};

export type ApiTimeline = {
  steps: { key: OrderStatus; label: string; description: string; state: "done" | "current" | "upcoming"; at: string | null }[];
  terminal: { status: OrderStatus; label: string; at: string | null; message: string | null } | null;
  awaitingPayment: boolean;
  events: { id: string; type: string; status: OrderStatus | null; message: string; at: string }[];
};

export type ApiOrderSummary = {
  id: string;
  status: OrderStatus;
  statusLabel: string;
  placedAt: string;
  confirmedAt: string | null;
  eventDate: string | null;
  city: string | null;
  isPayable: boolean;
  paymentExpiresAt: string | null;
  itemCount: number;
  lines: ApiOrderLine[];
  pricing: Pricing<"subtotal" | "discount" | "deliveryFee" | "total" | "depositTotal" | "grandTotal">;
};

export type ApiOrderDetail = ApiOrderSummary & {
  cancelledAt: string | null;
  cancelReason: string | null;
  canCancel: boolean;
  delivery: {
    fullName: string | null;
    email: string | null;
    phone: string | null;
    addressLine1: string | null;
    addressLine2: string | null;
    city: string | null;
    state: string | null;
    postalCode: string | null;
    country: string | null;
    deliveryNote: string | null;
  };
  deliveryMethod: { code: string; label: string | null; estimatedFrom: string | null; estimatedTo: string | null } | null;
  couponCode: string | null;
  payment: { status: string; gateway: string; method: string; paidAt: string | null; failureReason: string | null } | null;
  refunds: { id: string; status: string; reason: string; createdAt: string; processedAt: string | null; pricing: Pricing<"amount"> }[];
  timeline: ApiTimeline;
};

export type ApiOrderStatus = {
  id: string;
  status: OrderStatus;
  statusLabel: string;
  isPayable: boolean;
  paymentExpiresAt: string | null;
  payment: { status: string; failureReason: string | null } | null;
  timeline: ApiTimeline;
};
