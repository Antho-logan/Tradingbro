import "./globals.css";
import type { Metadata } from "next";
import { JetBrains_Mono, Inter } from "next/font/google";

export const metadata: Metadata = {
  title: "TraderBro — Terminal-first AI trading coach",
  description: "Learn to trade with an AI coach. Charts, journal, analytics — terminal vibe.",
};

// Terminal-first fonts
const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* mono default; keep sans var available */}
      <body className={`${mono.variable} ${sans.variable} min-h-full bg-neutral-50 text-neutral-900 antialiased`}>
        {children}
      </body>
    </html>
  );
}