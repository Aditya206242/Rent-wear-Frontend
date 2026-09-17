"use client";

import { useEffect, useState } from "react";
import { Heart, Star, X } from "lucide-react";
import { ImageFilmstrip } from "./ImageFilmstrip";
import { RentBuyToggle } from "./RentBuyToggle";
import { SizeSelector } from "./SizeSelector";
import { AvailabilityPicker } from "./AvailabilityPicker";
import { useShopCart } from "@/lib/shop/cart-context";
import { formatMoney } from "@/lib/shop/format";
import { fetchGarmentSizesAction } from "@/lib/shop/product-actions";
import type { Garment, RentOrBuy, SizeOption } from "@/lib/shop/types";

export function ProductQuickView({ garment, onClose }: { garment: Garment; onClose: () => void }) {
	const [mode, setMode] = useState<RentOrBuy>("rent");
	// The discover grid only has list-level data, which doesn't include sizes
	// (see lib/shop/product-actions.ts) — fetch the real ones before letting
	// anyone pick one, instead of leaving the selector permanently empty.
	const [sizes, setSizes] = useState<SizeOption[]>(garment.sizes);
	const [loadingSizes, setLoadingSizes] = useState(garment.sizes.length === 0);
	const [size, setSize] = useState<string | null>(garment.sizes.find((option) => option.available)?.size ?? null);
	const [startDate, setStartDate] = useState("");
	const { addLine, toggleWishlist, isWishlisted } = useShopCart();
	const wishlisted = isWishlisted(garment.id);

	useEffect(() => {
		if (garment.sizes.length > 0) return;
		let cancelled = false;
		fetchGarmentSizesAction(garment.id).then((result) => {
			if (cancelled) return;
			setSizes(result);
			setSize(result.find((option) => option.available)?.size ?? null);
			setLoadingSizes(false);
		});
		return () => {
			cancelled = true;
		};
	}, [garment.id, garment.sizes.length]);

	function addToBag(cartMode: RentOrBuy) {
		if (!size) return;
		addLine({
			garmentId: garment.id,
			mode: cartMode,
			size,
			startDate: cartMode === "rent" ? startDate || undefined : undefined,
			product: { id: garment.id, name: garment.name, brand: garment.brand, colorHex: garment.colorHex },
			currency: garment.currency,
			rentPrice: garment.rentPrice,
			deposit: garment.deposit,
			buyPrice: garment.buyPrice,
		});
		onClose();
	}

	return (
		<div className="fixed inset-0 z-[70] flex items-center justify-center bg-brand-navy/45 p-4 backdrop-blur-sm" onMouseDown={onClose}>
			<section
				role="dialog"
				aria-modal="true"
				aria-label={`${garment.name} details`}
				className="relative max-h-[calc(100vh-2rem)] w-full max-w-5xl overflow-hidden rounded-xl bg-brand-cream shadow-[0_24px_80px_-24px_rgba(11,31,58,0.55)]"
				onMouseDown={(event) => event.stopPropagation()}
			>
			<div className="grid max-h-[calc(100vh-2rem)] grid-cols-1 overflow-y-auto md:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)]">
				<div className="relative min-h-[360px] bg-brand-surface p-5 md:min-h-[600px] md:p-7">
					<ImageFilmstrip colorHex={garment.colorHex} name={garment.name} views={garment.views} imageUrls={garment.imageUrls} />
					<div className="pointer-events-none absolute inset-x-5 top-5 flex items-start justify-end md:inset-x-7 md:top-7">
						<button
							type="button"
							onClick={() => toggleWishlist(garment.id)}
							aria-label={wishlisted ? "Remove from wishlist" : "Save to wishlist"}
							className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-brand-navy/70 hover:text-brand-cyan-deep"
						>
							<Heart size={18} fill={wishlisted ? "var(--color-brand-cyan-deep)" : "none"} />
						</button>
					</div>
				</div>

				<div className="relative px-6 py-7 sm:px-8 sm:py-9">
					<button type="button" onClick={onClose} aria-label="Close product details" className="absolute right-5 top-5 text-brand-navy/45 hover:text-brand-navy">
						<X size={20} strokeWidth={1.75} />
					</button>

					<p className="font-mono text-[10px] uppercase tracking-[0.16em] text-brand-navy/45">{garment.brand}</p>
					<h2 className="mt-1 max-w-sm font-display text-2xl font-medium leading-tight text-brand-navy">{garment.name}</h2>
					<p className="mt-1 font-ui text-sm text-brand-navy/55">{garment.category} · {garment.color}</p>

					<div className="mt-2 flex items-center gap-1.5 font-ui text-sm text-brand-navy/60">
						<Star size={14} fill="var(--color-brand-cyan)" strokeWidth={0} />
						{garment.rating} <span className="text-brand-navy/40">({garment.reviewCount} reviews)</span>
					</div>

					<p className="mt-3 font-ui text-sm leading-relaxed text-brand-navy/65">{garment.conditionCopy}</p>

					<div className="mt-6">
						<RentBuyToggle value={mode} onChange={setMode} rentPrice={garment.rentPrice} rentDays={garment.rentDays} buyPrice={garment.buyPrice} currency={garment.currency} />
						{mode === "rent" && (
							<p className="mt-2 font-ui text-xs text-brand-navy/50">
								Refundable deposit {formatMoney(garment.deposit, garment.currency)}, returned after inspection.
							</p>
						)}
					</div>

					<div className="mt-6">
						<p className="font-ui text-xs font-semibold uppercase tracking-wide text-brand-navy/50">Select size</p>
						<div className="mt-2">
							{loadingSizes ? (
								<p className="font-ui text-xs text-brand-navy/45">Checking sizes…</p>
							) : sizes.length === 0 ? (
								<p className="font-ui text-xs text-brand-navy/45">No sizes currently available.</p>
							) : (
								<SizeSelector sizes={sizes} selected={size} onSelect={setSize} />
							)}
						</div>
					</div>

					{mode === "rent" && (
						<div className="mt-6">
							<AvailabilityPicker
								status={garment.availability}
								rentDays={garment.rentDays}
								deliveryDays={garment.deliveryDays}
								availableFrom={garment.availableFrom}
								value={startDate}
								onChange={setStartDate}
							/>
						</div>
					)}

					<div className="mt-7 flex items-center gap-2">
						<button
							type="button"
							onClick={() => addToBag("rent")}
							disabled={!size || loadingSizes}
							className="flex-1 rounded-lg border border-brand-navy/25 py-3 font-ui text-sm font-semibold text-brand-navy transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
						>
							Add to Cart
						</button>
						<button
							type="button"
							onClick={() => addToBag("buy")}
							disabled={!size || loadingSizes}
							className="flex-1 rounded-lg bg-brand-navy py-3 font-ui text-sm font-semibold text-white transition-colors hover:bg-brand-navy-dark disabled:cursor-not-allowed disabled:opacity-40"
						>
							Buy
						</button>
					</div>

					<div className="mt-8 border-t border-brand-navy/10 pt-6">
						<p className="font-ui text-xs font-semibold uppercase tracking-wide text-brand-navy/50">Product details</p>
						<div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
							<div>
								<p className="font-ui text-xs uppercase tracking-wide text-brand-navy/45">Fabric</p>
								<p className="mt-0.5 font-ui text-brand-navy">{garment.fabric}</p>
							</div>
							<div>
								<p className="font-ui text-xs uppercase tracking-wide text-brand-navy/45">Colour</p>
								<p className="mt-0.5 font-ui text-brand-navy">{garment.color}</p>
							</div>
							{garment.measurements.map((m) => (
								<div key={m.label}>
									<p className="font-ui text-xs uppercase tracking-wide text-brand-navy/45">{m.label}</p>
									<p className="mt-0.5 font-mono text-brand-navy">{m.value}</p>
								</div>
							))}
						</div>
					</div>

					<div className="mt-5">
						<p className="font-ui text-xs uppercase tracking-wide text-brand-navy/45">Material &amp; care</p>
						<ul className="mt-1 space-y-0.5">
							{garment.care.map((c) => (
								<li key={c} className="font-ui text-sm text-brand-navy/70">
									{c}
								</li>
							))}
						</ul>
					</div>
				</div>
				</div>
			</section>
		</div>
	);
}
