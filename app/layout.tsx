import type { Metadata } from "next";
import { Fraunces, Jost, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  axes: ["opsz", "SOFT", "WONK"],
  display: "swap",
});


const jost = Jost({
  subsets: ["latin"],
  variable: "--font-jost",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono-console",
  display: "swap",
});

export const metadata: Metadata = {
  title: "LoopWear",
  description: "LoopWear account access",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${jost.variable} ${jetbrainsMono.variable}`}>
      <body className="antialiased font-ui">{children}</body>
    </html>
  );
}
