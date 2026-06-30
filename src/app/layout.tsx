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

export const metadata = {
  title: "Apex Force — Вершина Сили",
  description: "Total Fitness Solutions — Виробництво та продаж спортивного інвентаря",
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
