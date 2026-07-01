import type { Metadata, Viewport } from 'next';
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from '@/context/LanguageContext';
import { CartProvider } from '@/context/CartContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#121212',
};

export const metadata: Metadata = {
  title: {
    default: "Apex Force — Вершина Сили | Спортивний інвентар",
    template: "%s | Apex Force"
  },
  description: "Total Fitness Solutions — Виробництво та продаж професійного спортивного інвентаря, турніків, шведських стінок та воркаут комплексів.",
  keywords: ["спорт", "турніки", "шведські стінки", "воркаут", "фітнес", "Apex Force", "спортивний інвентар"],
  authors: [{ name: 'Apex Force' }],
  openGraph: {
    title: "Apex Force — Вершина Сили",
    description: "Професійне спортивне обладнання від виробника. Вуличні комплекси, турніки, рукоходи.",
    url: "https://apex-production.up.railway.app",
    siteName: "Apex Force",
    locale: "uk_UA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Apex Force — Вершина Сили",
    description: "Професійне спортивне обладнання від виробника",
  },
  robots: {
    index: true,
    follow: true,
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uk" className={`${inter.variable} ${outfit.variable}`}>
      <body>
        <LanguageProvider>
          <CartProvider>
            <Header />
            <main className="main-content">
              {children}
            </main>
            <CartDrawer />
            <Footer />
          </CartProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
