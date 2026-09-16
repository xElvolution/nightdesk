import type { Metadata } from "next";
import { IBM_Plex_Sans, IBM_Plex_Mono, Oswald } from "next/font/google";
import "./globals.css";
import { Shell } from "@/components/shell";
import { Providers } from "@/components/providers";

const plex = IBM_Plex_Sans({
  variable: "--font-plex",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const display = Oswald({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
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
    "operator desk",
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
      className={`${plex.variable} ${plexMono.variable} ${display.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-bg text-ink">
        <Providers>
          <Shell>{children}</Shell>
        </Providers>
      </body>
    </html>
  );
}
