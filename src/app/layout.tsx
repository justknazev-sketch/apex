import type { Metadata, Viewport } from 'next';
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import "./admin.css";
import { LanguageProvider } from '@/context/LanguageContext';
import { CartProvider } from '@/context/CartContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import { cookies } from 'next/headers';

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
  themeColor: '#FFFFFF',
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


export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const lang = cookieStore.get('NEXT_LOCALE')?.value || 'uk';

  return (
    <html lang={lang} className={`${inter.variable} ${outfit.variable}`} suppressHydrationWarning>
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
