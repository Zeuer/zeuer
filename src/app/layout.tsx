import type { Metadata } from 'next';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import { AuthProvider } from '@/context/AuthContext';
import Header from '@/components/ui/Header';
import Footer from '@/components/ui/Footer';

export const metadata: Metadata = {
  title: 'Zeuer — Ropa Deportiva',
  description: 'Técnico. Táctico. Lógico. Zeuer es una marca de ropa deportiva nacida desde la determinación, el esfuerzo constante y la superación personal.',
  keywords: ['zeuer', 'ropa deportiva', 'sportswear', 'jerseys', 'athletic wear'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen flex flex-col">
        <AuthProvider>
          <CartProvider>
            <Header />
            <main className="flex-1 pt-16 sm:pt-20">{children}</main>
            <Footer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
