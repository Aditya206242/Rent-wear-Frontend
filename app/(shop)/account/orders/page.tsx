import Link from "next/link";
import { Package, ArrowRight, Truck, RotateCcw, CalendarClock, Compass, ClipboardList, Clock, CalendarCheck, CheckCircle2, Search } from "lucide-react";
import { OrderSortSelect } from "@/components/shop/OrderSortSelect";
import { listOrdersAction } from "@/lib/shop/order-actions";
import { formatMoney } from "@/lib/shop/format";
import { requireUser } from "@/lib/auth/session";

export const metadata = { title: "My orders — LoopWear" };

const TABS = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "processing", label: "Processing" },
  { key: "shipped", label: "Shipped" },
  { key: "delivered", label: "Delivered" },
  { key: "returned", label: "Returned" },
  { key: "cancelled", label: "Cancelled" },
] as const;

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string; sort?: string }>;
}) {
  await requireUser("/account/orders");

  const { status: statusParam, q = "", sort = "newest" } = await searchParams;
  const activeTab = TABS.find((t) => t.key === statusParam)?.key ?? "all";

  const orders = await listOrdersAction();
  const activeCount = orders.filter((o) => o.status !== "closed").length;
  const upcomingReturnsCount = orders.filter((o) => o.status === "with customer").length;
  const completedCount = orders.filter((o) => o.status === "closed").length;

  const visible = orders
    .filter((order) => {
      if (activeTab === "active") return order.status !== "closed";
      if (activeTab === "processing") return order.status === "confirmed" || order.status === "packed";
      if (activeTab === "shipped") return order.status === "shipped";
      if (activeTab === "delivered") return order.status === "with customer";
      if (activeTab === "returned") return order.status === "return in transit" || order.status === "closed";
      if (activeTab === "cancelled") return order.status === "cancelled";
      return true;
    })
    .filter((order) => order.id.toLowerCase().includes(q.trim().toLowerCase()))
    .sort((a, b) => {
      const aTime = new Date(a.placedAt).getTime();
      const bTime = new Date(b.placedAt).getTime();
      return sort === "oldest" ? aTime - bTime : bTime - aTime;
    });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-10">
      <h1 className="font-display text-3xl font-medium text-brand-navy">My Orders</h1>
      <p className="mt-2 font-ui text-sm text-brand-navy/55">
        Track your purchases, rentals and upcoming returns.
      </p>

      {orders.length > 0 && (
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          <div className="relative rounded-xl border border-brand-navy/10 bg-white px-4 py-4 sm:px-5 sm:py-5">
            <span className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg bg-brand-cyan/12 text-brand-cyan-deep sm:right-5 sm:top-5">
              <ClipboardList size={16} strokeWidth={1.8} />
            </span>
            <p className="font-ui text-[10.5px] font-semibold uppercase tracking-wide text-brand-navy/45">Total Orders</p>
            <p className="mt-2 font-display text-2xl font-semibold text-brand-navy sm:text-[26px]">{orders.length}</p>
          </div>
          <div className="relative rounded-xl border border-brand-navy/10 bg-white px-4 py-4 sm:px-5 sm:py-5">
            <span className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg bg-brand-cyan/12 text-brand-cyan-deep sm:right-5 sm:top-5">
              <Clock size={16} strokeWidth={1.8} />
            </span>
            <p className="font-ui text-[10.5px] font-semibold uppercase tracking-wide text-brand-navy/45">Active Rentals</p>
            <p className="mt-2 font-display text-2xl font-semibold text-brand-navy sm:text-[26px]">{activeCount}</p>
          </div>
          <div className="relative rounded-xl border border-brand-navy/10 bg-white px-4 py-4 sm:px-5 sm:py-5">
            <span className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg bg-amber-700/10 text-amber-800 sm:right-5 sm:top-5">
              <CalendarCheck size={16} strokeWidth={1.8} />
            </span>
            <p className="font-ui text-[10.5px] font-semibold uppercase tracking-wide text-brand-navy/45">Upcoming Returns</p>
            <p className="mt-2 font-display text-2xl font-semibold text-brand-navy sm:text-[26px]">{upcomingReturnsCount}</p>
          </div>
          <div className="relative rounded-xl border border-brand-navy/10 bg-white px-4 py-4 sm:px-5 sm:py-5">
            <span className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-700/10 text-emerald-800 sm:right-5 sm:top-5">
              <CheckCircle2 size={16} strokeWidth={1.8} />
            </span>
            <p className="font-ui text-[10.5px] font-semibold uppercase tracking-wide text-brand-navy/45">Completed Orders</p>
            <p className="mt-2 font-display text-2xl font-semibold text-brand-navy sm:text-[26px]">{completedCount}</p>
          </div>
        </div>
      )}

      {orders.length > 0 && (
        <div className="mt-7 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            {TABS.map((tab) => (
              <Link
                key={tab.key}
                href={tab.key === "all" ? "/account/orders" : `/account/orders?status=${tab.key}`}
                className={`rounded-full border px-4 py-1.5 font-ui text-xs font-medium transition-colors ${
                  activeTab === tab.key
                    ? "border-brand-navy bg-brand-navy text-white"
                    : "border-brand-navy/15 bg-white text-brand-navy/65 hover:border-brand-navy/35 hover:text-brand-navy"
                }`}
              >
                {tab.label}
              </Link>
            ))}
          </div>

          <form method="get" className="flex w-full shrink-0 items-center gap-2 lg:w-auto">
            {activeTab !== "all" && <input type="hidden" name="status" value={activeTab} />}
            <label className="relative min-w-0 flex-1 lg:w-56">
              <Search size={14} strokeWidth={1.75} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-brand-navy/35" />
              <input
                type="search"
                name="q"
                defaultValue={q}
                placeholder="Search your orders..."
                className="h-9 w-full rounded-lg border border-brand-navy/15 bg-white py-2 pl-9 pr-3 font-ui text-xs text-brand-navy placeholder:text-brand-navy/40"
              />
            </label>
            <OrderSortSelect value={sort} />
            <button type="submit" className="sr-only">Apply filters</button>
          </form>
        </div>
      )}

      {orders.length === 0 ? (
        <div className="mt-10 rounded-xl border border-brand-navy/12 bg-white px-6 py-14 text-center">
          <p className="font-ui text-sm text-brand-navy/55">You haven&apos;t placed any orders yet.</p>
          <Link
            href="/discover"
            className="mt-4 inline-block rounded-lg bg-brand-navy px-5 py-2.5 font-ui text-sm font-semibold text-white transition-colors hover:bg-brand-navy-dark"
          >
            Continue browsing
          </Link>
        </div>
      ) : visible.length === 0 ? (
        <div className="mt-8 rounded-xl border border-brand-navy/12 bg-white px-6 py-12 text-center">
          <p className="font-ui text-sm text-brand-navy/55">No orders in this view.</p>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {visible.map((order) => {
            const withCustomer = order.status === "with customer";
            const closed = order.status === "closed";
            const processing = order.status === "packed" || order.status === "shipped";
            const badgeClass = closed
              ? "bg-emerald-700/10 text-emerald-800"
              : processing
                ? "bg-amber-700/10 text-amber-800"
                : "bg-brand-cyan/15 text-brand-cyan-deep";
            const stateNote = withCustomer
              ? "Currently with you — return due soon"
              : closed
                ? "Delivered and completed"
                : processing
                  ? "Being prepared for shipping"
                  : "Payment received — preparing your order";
            return (
              <li key={order.id} className="rounded-xl border border-brand-navy/10 bg-white p-4 sm:grid sm:grid-cols-[minmax(0,1fr)_13.75rem] sm:gap-5 sm:p-5">
                <Link href={`/orders/${order.id}`} className="group flex items-center gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-brand-surface text-brand-navy/50">
                    <Package size={22} strokeWidth={1.5} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-ui text-sm font-semibold text-brand-navy">Order {order.id}</p>
                      <span className={`rounded-full px-2.5 py-0.5 font-ui text-[11px] font-semibold ${badgeClass}`}>
                        {order.statusLabel}
                      </span>
                    </div>
                    <p className="mt-1 font-ui text-xs text-brand-navy/50">
                      Placed{" "}
                      {new Date(order.placedAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                      {order.city ? ` · ${order.city}` : ""}
                    </p>
                    <p className="mt-3 flex items-center gap-2 font-ui text-xs text-brand-navy/55">
                      <span className={`h-1.5 w-1.5 rounded-full ${closed ? "bg-signal-success" : processing ? "bg-signal-warning" : "bg-brand-cyan-deep"}`} />
                      {stateNote}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-3">
                    <p className="font-mono text-sm text-brand-navy/80">
                      {formatMoney(order.pricing.display.total, order.pricing.displayCurrency)}
                    </p>
                    <ArrowRight size={16} strokeWidth={1.75} className="text-brand-navy/30 transition-colors group-hover:text-brand-cyan-deep" />
                  </div>
                </Link>

                <div className="mt-4 flex flex-wrap gap-2 border-t border-brand-navy/8 pt-4 sm:mt-0 sm:flex-col sm:border-l sm:border-t-0 sm:pl-5 sm:pt-0">
                  {withCustomer ? (
                    <>
                      <Link href={`/orders/${order.id}`} className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-brand-navy px-3.5 py-2 font-ui text-xs font-semibold text-white transition-colors hover:bg-brand-navy-dark">
                        <Truck size={13} strokeWidth={1.75} /> Track Order
                      </Link>
                      <div className="flex gap-2">
                        <Link href={`/orders/${order.id}`} className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-brand-navy/15 px-2 py-2 font-ui text-xs font-medium text-brand-navy hover:border-brand-navy/35"><CalendarClock size={13} /> Extend Rental</Link>
                        <Link href={`/orders/${order.id}`} className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-brand-navy/15 px-2 py-2 font-ui text-xs font-medium text-brand-navy hover:border-brand-navy/35"><RotateCcw size={13} /> Return Item</Link>
                      </div>
                    </>
                  ) : closed ? (
                    <div className="flex gap-2">
                      <Link href="/discover" className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-brand-navy px-2 py-2 font-ui text-xs font-semibold text-white hover:bg-brand-navy-dark"><Compass size={13} /> Buy Again</Link>
                      <Link href="/discover?mode=rent" className="flex flex-1 items-center justify-center rounded-lg border border-brand-navy/15 px-2 py-2 font-ui text-xs font-medium text-brand-navy hover:border-brand-navy/35">Rent Again</Link>
                    </div>
                  ) : (
                    <Link href={`/orders/${order.id}`} className="flex items-center justify-center rounded-lg border border-brand-navy/15 px-3.5 py-2 font-ui text-xs font-medium text-brand-navy hover:border-brand-navy/35">Contact Support</Link>
                  )}
                  <Link href={`/orders/${order.id}`} className="flex items-center justify-center gap-1 rounded-lg border border-brand-navy/25 px-3.5 py-1.5 font-ui text-xs font-medium text-brand-navy/70 hover:border-brand-navy/45 hover:text-brand-navy">
                    View Details <ArrowRight size={12} strokeWidth={1.75} />
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
