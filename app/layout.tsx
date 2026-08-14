import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";

/**
 * AG Holding's site references `'Nunito', sans-serif`; we self-host it via
 * next/font and fall back to a system sans stack (see --font-sans in
 * globals.css) so nothing depends on a third-party font CDN at runtime.
 */
const nunito = Nunito({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-nunito",
});

/**
 * `metadataBase` drives <link rel="canonical"> and Open Graph `url` only —
 * every in-app link stays relative, so the app keeps working on the current
 * *.workers.dev origin and in local dev while the custom domain is set up.
 */
export const metadata: Metadata = {
  metadataBase: new URL("https://agconnect.agholding.ae"),
  title: { default: "AGConnect — Digital identity platform by AG Holding", template: "%s | AGConnect" },
  description:
    "AGConnect gives every AG Holding employee a verified digital business card — centrally managed, shareable by NFC or QR.",
  applicationName: "AGConnect",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "AGConnect",
    url: "/",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" dir="ltr" className={nunito.variable}>
      <body>{children}</body>
    </html>
  );
}
