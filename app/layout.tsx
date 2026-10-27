import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SafeHaven Checkout",
  description: "Secure NGN checkout powered by SafeHaven",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
