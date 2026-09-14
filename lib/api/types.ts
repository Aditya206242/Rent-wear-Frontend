export type Paginated<T> = {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

/** Shared shape: base is always the accounting currency (paise); display is what to render. */
type PricingEnvelope<TBase extends Record<string, number>, TDisplay extends Record<string, number>> = {
  baseCurrency: string;
  displayCurrency: string;
  fxRate: number;
  base: TBase;
  display: TDisplay;
};

export type ProductPricing = PricingEnvelope<
  { rentPricePaise: number; buyPricePaise: number; depositPaise: number },
  { rentPrice: number; buyPrice: number; deposit: number }
>;

export type CartLinePricing = PricingEnvelope<Record<string, number>, Record<string, number>>;

export type OrderPricing = PricingEnvelope<
  { totalPaise: number; depositTotalPaise: number },
  { total: number; depositTotal: number }
>;

export type OrderItemPricing = PricingEnvelope<
  { unitPricePaise: number; depositPaise: number },
  { unitPrice: number; deposit: number }
>;
