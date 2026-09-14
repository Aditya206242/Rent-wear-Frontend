import Link from "next/link";
import type { ReactNode } from "react";
import { LoopWearLogo } from "@/components/LoopWearLogo";

type AuthCardProps = {
  heading: string;
  subheading: string;
  children: ReactNode;
  footer?: { text: string; linkText: string; href: string };
};

export function AuthCard({ heading, subheading, children, footer }: AuthCardProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-cream px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <LoopWearLogo size="lg" />
        </div>
        <div className="overflow-hidden rounded-2xl border border-brand-navy/10 bg-white shadow-[0_20px_50px_-24px_rgba(23,43,77,0.35)]">
          <div className="h-1.5 w-full bg-gradient-to-r from-brand-navy via-brand-gold to-brand-navy" />
          <div className="p-8">
            <h1 className="text-center text-lg font-semibold text-brand-navy">{heading}</h1>
            {subheading && <p className="mt-1.5 text-center text-sm text-neutral-500">{subheading}</p>}

            <div className="mt-6">{children}</div>
          </div>
        </div>

        {footer && (
          <p className="mt-6 text-center text-sm text-neutral-500">
            {footer.text}{" "}
            <Link href={footer.href} className="font-semibold text-brand-gold-deep underline-offset-4 hover:underline">
              {footer.linkText}
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
