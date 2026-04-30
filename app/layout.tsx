import type { Metadata } from "next";
import { headers } from "next/headers";
import { Poppins, Geist_Mono } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dattapay",
  description: "Dattapay - Financial Services",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const nonce = (await headers()).get("x-nonce") ?? undefined;

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${poppins.variable} ${geistMono.variable} antialiased`}>
        <Providers nonce={nonce}>{children}</Providers>
      </body>
    </html>
  );
}
