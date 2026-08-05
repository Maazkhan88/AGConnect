import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "AG Connect", template: "%s | AG Connect" },
  description: "Secure multi-brand digital identity for AG Holding.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
