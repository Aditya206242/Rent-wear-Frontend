import Link from "next/link";
import type { ReactNode } from "react";

type AuthCardProps = {
  heading: string;
  subheading: string;
  children: ReactNode;
  footer?: { text: string; linkText: string; href: string };
};

export function AuthCard({ heading, subheading, children, footer }: AuthCardProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="text-lg font-semibold tracking-tight text-neutral-900">Rent-wear</span>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-8 shadow-sm">
          <h1 className="text-xl font-semibold text-neutral-900">{heading}</h1>
          <p className="mt-1 text-sm text-neutral-500">{subheading}</p>

          <div className="mt-6">{children}</div>
        </div>

        {footer && (
          <p className="mt-6 text-center text-sm text-neutral-500">
            {footer.text}{" "}
            <Link href={footer.href} className="font-medium text-neutral-900 underline-offset-4 hover:underline">
              {footer.linkText}
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
