// Public on purpose: it's a URL, not a secret, and both server components
// and client components (cart, wishlist, checkout) need to reach it.
export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api").replace(/\/$/, "");
