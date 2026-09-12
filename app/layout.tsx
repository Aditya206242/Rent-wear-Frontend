import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rent-wear",
  description: "Rent-wear account access",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
