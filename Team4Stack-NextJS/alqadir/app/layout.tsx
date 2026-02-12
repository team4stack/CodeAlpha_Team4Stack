import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { ProductProvider } from "@/context/ProductContext";
import { OrderProvider } from "@/context/OrderContext";

const poppins = Poppins({
  weight: ['400', '500', '600', '700'],
  subsets: ["latin"],
  variable: "--font-poppins",
  display: 'swap',
  fallback: ['system-ui', 'arial'],
  adjustFontFallback: false,
});

export const metadata: Metadata = {
  title: "Al-Qadir - Best Deals with Free Delivery",
  description: "Best deals on electronics, cosmetics, watches and more with free delivery across Pakistan. Cash on delivery available.",
  keywords: "Al-Qadir, Pakistan, online shopping, electronics, cosmetics, watches, free delivery",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${poppins.variable} font-sans antialiased bg-[#f5f5f5]`} suppressHydrationWarning>
        <ProductProvider>
          <OrderProvider>
            {children}
          </OrderProvider>
        </ProductProvider>
      </body>
    </html>
  );
}
