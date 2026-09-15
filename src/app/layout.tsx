import type { Metadata } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { Shell } from "@/components/shell";
import { Providers } from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const instrument = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: {
    default: "NightDesk",
    template: "%s · NightDesk",
  },
  description:
    "Overnight agent desk for Bitget tokenized US stocks. Research, sentiment, risk, and execution with cancel-on-anomaly order flow.",
  applicationName: "NightDesk",
  authors: [{ name: "XElvolution", url: "https://github.com/xElvolution" }],
  keywords: [
    "Bitget",
    "rToken",
    "tokenized stocks",
    "agent trading",
    "paper trading",
    "risk",
    "NightDesk",
  ],
  openGraph: {
    title: "NightDesk",
    description:
      "Overnight agent desk for Bitget rTokens. Import holdings. Submit one risk-gated rebalance.",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${instrument.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-bg text-ink">
        <Providers>
          <Shell>{children}</Shell>
        </Providers>
      </body>
    </html>
  );
}
