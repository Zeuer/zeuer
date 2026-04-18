'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: '◈' },
  { href: '/admin/products', label: 'Productos', icon: '◇' },
  { href: '/admin/users', label: 'Usuarios', icon: '◉' },
  { href: '/admin/orders', label: 'Órdenes', icon: '◎' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push('/login');
    }
  }, [user, loading, isAdmin, router]);

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-electric-blue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <aside className="md:w-56 flex-shrink-0">
          <div className="sticky top-24">
            <h2 className="font-unbounded text-xs font-semibold uppercase tracking-wider text-electric-blue mb-6">Admin Panel</h2>
            <nav className="space-y-1">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all ${
                    pathname === item.href
                      ? 'bg-electric-blue/15 text-electric-blue border border-electric-blue/20'
                      : 'text-muted hover:text-cold-white hover:bg-surface-elevated'
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </nav>
            <Link
              href="/"
              className="flex items-center gap-3 px-4 py-2.5 mt-6 rounded-xl text-sm text-muted hover:text-cold-white hover:bg-surface-elevated transition-all"
            >
              ← Volver al sitio
            </Link>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}
