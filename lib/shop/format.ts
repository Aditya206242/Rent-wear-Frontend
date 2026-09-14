/** Every price on the Shop comes pre-converted by the backend into some
 * display currency (geo-detected or ?currency=) — always format with the
 * currency that came back with that specific price, never assume INR. */
export function formatMoney(amount: number, currency: string): string {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "INR" ? 0 : 2,
  }).format(amount);
}
