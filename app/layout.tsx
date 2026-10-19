import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Piriyapul International",
    template: "%s | Piriyapul International",
  },
  description:
    "A leading importer and distributor of premium Fast-Moving Consumer Goods in Thailand.",
  icons: {
    icon: [{ url: "/assets/company-seal.png", type: "image/png" }],
  },
  openGraph: {
    title: "Piriyapul International",
    description:
      "Elevating every home with world-class premium quality.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
