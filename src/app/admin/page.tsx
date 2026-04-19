'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

interface Stats {
  totalRevenue: number;
  confirmedRevenue: number;
  avgOrderValue: number;
  totalOrders: number;
  ordersToday: number;
  ordersByStatus: Record<string, number>;
  dailyRevenue: { date: string; revenue: number; count: number }[];
  topProducts: { name: string; qty: number; revenue: number }[];
  lowStock: { name: string; stock: number; _id: string }[];
  totalProducts: number;
  totalUsers: number;
}

interface Analytics {
  totalViews: number;
  viewsToday: number;
  viewsThisWeek: number;
  viewsThisMonth: number;
  weekTrend: number;
  dailyViews: { date: string; views: number }[];
  popularPages: { path: string; views: number }[];
  deviceBreakdown: Record<string, number>;
  topCountries: { country: string; views: number }[];
  hourlyActivity: number[];
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmada',
  shipped: 'Enviada',
  delivered: 'Entregada',
  cancelled: 'Cancelada',
};

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-500',
  confirmed: 'bg-blue-500',
  shipped: 'bg-purple-500',
  delivered: 'bg-green-500',
  cancelled: 'bg-red-500',
};

const STATUS_OPTIONS = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

const PAGE_LABELS: Record<string, string> = {
  '/': 'Inicio',
  '/products': 'Colección',
  '/cart': 'Carrito',
  '/checkout': 'Checkout',
  '/login': 'Login',
  '/register': 'Registro',
  '/profile': 'Mi Cuenta',
};

const COUNTRY_FLAGS: Record<string, string> = {
  MX: '🇲🇽', US: '🇺🇸', ES: '🇪🇸', CO: '🇨🇴', AR: '🇦🇷',
  CL: '🇨🇱', PE: '🇵🇪', BR: '🇧🇷', GT: '🇬🇹', Desconocido: '🌍',
};

const DEVICE_ICONS: Record<string, string> = {
  mobile: '📱', tablet: '📟', desktop: '🖥️',
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'revenue' | 'analytics'>('revenue');

  useEffect(() => {
    async function loadAll() {
      const [statsRes, analyticsRes] = await Promise.allSettled([
        fetch('/api/stats').then(r => r.json()),
        fetch('/api/analytics/stats').then(r => r.json()),
      ]);
      if (statsRes.status === 'fulfilled') setStats(statsRes.value);
      if (analyticsRes.status === 'fulfilled' && !analyticsRes.value.error) setAnalytics(analyticsRes.value);
      setLoading(false);
    }
    loadAll();
  }, []);

  if (loading) {
    return (
      <div>
        <h1 className="font-unbounded text-2xl font-bold mb-8">Dashboard</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="bg-surface-dark rounded-2xl h-28 animate-pulse" />)}
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div>
        <h1 className="font-unbounded text-2xl font-bold mb-8">Dashboard</h1>
        <p className="text-muted">Error al cargar estadísticas</p>
      </div>
    );
  }

  const maxDailyRevenue = Math.max(...stats.dailyRevenue.map(d => d.revenue), 1);
  const maxDailyViews = analytics ? Math.max(...analytics.dailyViews.map(d => d.views), 1) : 1;
  const maxHourly = analytics ? Math.max(...analytics.hourlyActivity, 1) : 1;
  const totalDeviceViews = analytics ? Object.values(analytics.deviceBreakdown).reduce((s, v) => s + v, 0) : 0;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="font-unbounded text-2xl font-bold">Dashboard</h1>
        {/* Tab switcher */}
        <div className="flex bg-surface-dark border border-border rounded-xl overflow-hidden">
          <button
            onClick={() => setTab('revenue')}
            className={`px-4 py-2 text-xs font-medium transition-colors ${tab === 'revenue' ? 'bg-electric-blue text-white' : 'text-muted hover:text-cold-white'}`}
          >
            💰 Ingresos
          </button>
          <button
            onClick={() => setTab('analytics')}
            className={`px-4 py-2 text-xs font-medium transition-colors ${tab === 'analytics' ? 'bg-electric-blue text-white' : 'text-muted hover:text-cold-white'}`}
          >
            📊 Sitio Web
          </button>
        </div>
      </div>

      {/* ═════════ REVENUE TAB ═════════ */}
      {tab === 'revenue' && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-surface-dark border border-border rounded-2xl p-5">
              <p className="text-xs text-muted uppercase tracking-wider mb-1">Ingresos Totales</p>
              <p className="font-unbounded text-2xl font-bold text-green-400">${stats.totalRevenue.toLocaleString('es-MX')}</p>
              <p className="text-xs text-muted mt-1">Confirmados: ${stats.confirmedRevenue.toLocaleString('es-MX')}</p>
            </div>
            <div className="bg-surface-dark border border-border rounded-2xl p-5">
              <p className="text-xs text-muted uppercase tracking-wider mb-1">Órdenes</p>
              <p className="font-unbounded text-2xl font-bold">{stats.totalOrders}</p>
              <p className="text-xs text-muted mt-1">Hoy: {stats.ordersToday}</p>
            </div>
            <div className="bg-surface-dark border border-border rounded-2xl p-5">
              <p className="text-xs text-muted uppercase tracking-wider mb-1">Valor Promedio</p>
              <p className="font-unbounded text-2xl font-bold">${stats.avgOrderValue.toFixed(0)}</p>
              <p className="text-xs text-muted mt-1">por orden</p>
            </div>
            <div className="bg-surface-dark border border-border rounded-2xl p-5">
              <p className="text-xs text-muted uppercase tracking-wider mb-1">Productos / Usuarios</p>
              <p className="font-unbounded text-2xl font-bold">{stats.totalProducts} <span className="text-base text-muted font-normal">/</span> {stats.totalUsers}</p>
              <p className="text-xs text-muted mt-1">registrados</p>
            </div>
          </div>

          {/* Revenue Chart + Orders by Status */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-surface-dark border border-border rounded-2xl p-5">
              <h2 className="text-xs font-unbounded font-semibold uppercase tracking-wider text-muted mb-4">Ingresos — Últimos 30 días</h2>
              <div className="flex items-end gap-[2px] h-40">
                {stats.dailyRevenue.map((d, i) => {
                  const height = maxDailyRevenue > 0 ? (d.revenue / maxDailyRevenue) * 100 : 0;
                  return (
                    <div key={i} className="flex-1 group relative">
                      <div
                        className="w-full bg-electric-blue/60 rounded-t-sm hover:bg-electric-blue transition-colors cursor-pointer"
                        style={{ height: `${Math.max(height, 2)}%` }}
                      />
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-deep-black border border-border rounded-lg px-3 py-2 text-xs whitespace-nowrap z-10 shadow-lg">
                        <p className="font-medium">${d.revenue.toLocaleString('es-MX')}</p>
                        <p className="text-muted">{d.count} orden{d.count !== 1 ? 'es' : ''}</p>
                        <p className="text-muted">{new Date(d.date).toLocaleDateString('es-MX', { month: 'short', day: 'numeric' })}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between mt-2 text-[10px] text-muted">
                <span>{new Date(stats.dailyRevenue[0]?.date).toLocaleDateString('es-MX', { month: 'short', day: 'numeric' })}</span>
                <span>Hoy</span>
              </div>
            </div>

            <div className="bg-surface-dark border border-border rounded-2xl p-5">
              <h2 className="text-xs font-unbounded font-semibold uppercase tracking-wider text-muted mb-4">Órdenes por Estado</h2>
              <div className="space-y-3">
                {STATUS_OPTIONS.map((status) => {
                  const count = stats.ordersByStatus[status] || 0;
                  const pct = stats.totalOrders > 0 ? (count / stats.totalOrders) * 100 : 0;
                  return (
                    <div key={status}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{STATUS_LABELS[status]}</span>
                        <span className="text-muted">{count}</span>
                      </div>
                      <div className="w-full bg-surface-elevated rounded-full h-2 overflow-hidden">
                        <div className={`h-full rounded-full ${STATUS_COLORS[status]} transition-all`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Top Products + Low Stock */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-surface-dark border border-border rounded-2xl p-5">
              <h2 className="text-xs font-unbounded font-semibold uppercase tracking-wider text-muted mb-4">Productos más vendidos</h2>
              {stats.topProducts.length === 0 ? (
                <p className="text-sm text-muted">Sin ventas aún</p>
              ) : (
                <div className="space-y-3">
                  {stats.topProducts.map((p, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-electric-blue/20 text-electric-blue text-xs flex items-center justify-center font-bold">{i + 1}</span>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{p.name}</p>
                        <p className="text-xs text-muted">{p.qty} vendidos</p>
                      </div>
                      <span className="text-sm font-semibold">${p.revenue.toLocaleString('es-MX')}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="bg-surface-dark border border-border rounded-2xl p-5">
                <h2 className="text-xs font-unbounded font-semibold uppercase tracking-wider text-muted mb-4">Alertas de Stock</h2>
                {stats.lowStock.length === 0 ? (
                  <p className="text-sm text-green-400">✓ Todo el inventario está bien</p>
                ) : (
                  <div className="space-y-2">
                    {stats.lowStock.map((p) => (
                      <div key={p._id} className="flex items-center justify-between text-sm">
                        <Link href={`/admin/products/${p._id}/edit`} className="hover:text-electric-blue transition-colors">{p.name}</Link>
                        <span className={`font-bold ${p.stock === 0 ? 'text-red-400' : 'text-yellow-400'}`}>{p.stock === 0 ? 'Agotado' : `${p.stock} uds`}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-surface-dark border border-border rounded-2xl p-5">
                <h2 className="text-xs font-unbounded font-semibold uppercase tracking-wider text-muted mb-4">Acciones Rápidas</h2>
                <div className="grid grid-cols-2 gap-3">
                  <Link href="/admin/products/new" className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-surface-elevated border border-border hover:border-electric-blue/30 transition-all text-sm">
                    <span className="text-electric-blue">+</span> Producto
                  </Link>
                  <Link href="/admin/orders" className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-surface-elevated border border-border hover:border-electric-blue/30 transition-all text-sm">
                    <span className="text-electric-blue">◎</span> Órdenes
                  </Link>
                  <Link href="/admin/products" className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-surface-elevated border border-border hover:border-electric-blue/30 transition-all text-sm">
                    <span className="text-electric-blue">◇</span> Productos
                  </Link>
                  <Link href="/admin/users" className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-surface-elevated border border-border hover:border-electric-blue/30 transition-all text-sm">
                    <span className="text-electric-blue">◉</span> Usuarios
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ═════════ ANALYTICS TAB ═════════ */}
      {tab === 'analytics' && (
        <>
          {!analytics ? (
            <div className="bg-surface-dark border border-border rounded-2xl p-12 text-center">
              <p className="text-muted mb-2">Aún no hay datos de visitas</p>
              <p className="text-xs text-muted">Las visitas se empezarán a registrar automáticamente</p>
            </div>
          ) : (
            <>
              {/* Analytics KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-surface-dark border border-border rounded-2xl p-5">
                  <p className="text-xs text-muted uppercase tracking-wider mb-1">Visitas Totales</p>
                  <p className="font-unbounded text-2xl font-bold">{analytics.totalViews.toLocaleString()}</p>
                  <p className="text-xs text-muted mt-1">Hoy: {analytics.viewsToday}</p>
                </div>
                <div className="bg-surface-dark border border-border rounded-2xl p-5">
                  <p className="text-xs text-muted uppercase tracking-wider mb-1">Esta Semana</p>
                  <p className="font-unbounded text-2xl font-bold">{analytics.viewsThisWeek.toLocaleString()}</p>
                  <p className={`text-xs mt-1 ${analytics.weekTrend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {analytics.weekTrend >= 0 ? '↑' : '↓'} {Math.abs(analytics.weekTrend)}% vs semana pasada
                  </p>
                </div>
                <div className="bg-surface-dark border border-border rounded-2xl p-5">
                  <p className="text-xs text-muted uppercase tracking-wider mb-1">Este Mes</p>
                  <p className="font-unbounded text-2xl font-bold">{analytics.viewsThisMonth.toLocaleString()}</p>
                  <p className="text-xs text-muted mt-1">últimos 30 días</p>
                </div>
                <div className="bg-surface-dark border border-border rounded-2xl p-5">
                  <p className="text-xs text-muted uppercase tracking-wider mb-1">Dispositivos</p>
                  <div className="flex items-center gap-3 mt-2">
                    {Object.entries(analytics.deviceBreakdown).map(([device, count]) => (
                      count > 0 && (
                        <div key={device} className="text-center">
                          <span className="text-lg">{DEVICE_ICONS[device] || '🖥️'}</span>
                          <p className="text-xs text-muted">{totalDeviceViews > 0 ? Math.round((count / totalDeviceViews) * 100) : 0}%</p>
                        </div>
                      )
                    ))}
                  </div>
                </div>
              </div>

              {/* Views Chart + Popular Pages */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-surface-dark border border-border rounded-2xl p-5">
                  <h2 className="text-xs font-unbounded font-semibold uppercase tracking-wider text-muted mb-4">Visitas — Últimos 30 días</h2>
                  <div className="flex items-end gap-[2px] h-40">
                    {analytics.dailyViews.map((d, i) => {
                      const height = maxDailyViews > 0 ? (d.views / maxDailyViews) * 100 : 0;
                      return (
                        <div key={i} className="flex-1 group relative">
                          <div
                            className="w-full bg-cyan-accent/60 rounded-t-sm hover:bg-cyan-accent transition-colors cursor-pointer"
                            style={{ height: `${Math.max(height, 2)}%` }}
                          />
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-deep-black border border-border rounded-lg px-3 py-2 text-xs whitespace-nowrap z-10 shadow-lg">
                            <p className="font-medium">{d.views} visitas</p>
                            <p className="text-muted">{new Date(d.date).toLocaleDateString('es-MX', { month: 'short', day: 'numeric' })}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-between mt-2 text-[10px] text-muted">
                    <span>{new Date(analytics.dailyViews[0]?.date).toLocaleDateString('es-MX', { month: 'short', day: 'numeric' })}</span>
                    <span>Hoy</span>
                  </div>
                </div>

                {/* Popular pages */}
                <div className="bg-surface-dark border border-border rounded-2xl p-5">
                  <h2 className="text-xs font-unbounded font-semibold uppercase tracking-wider text-muted mb-4">Páginas Populares</h2>
                  <div className="space-y-3">
                    {analytics.popularPages.length === 0 ? (
                      <p className="text-sm text-muted">Sin datos aún</p>
                    ) : (
                      analytics.popularPages.map((page, i) => {
                        const label = PAGE_LABELS[page.path] || page.path;
                        const maxViews = analytics.popularPages[0]?.views || 1;
                        const pct = (page.views / maxViews) * 100;
                        return (
                          <div key={i}>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="truncate">{label}</span>
                              <span className="text-muted ml-2">{page.views}</span>
                            </div>
                            <div className="w-full bg-surface-elevated rounded-full h-1.5 overflow-hidden">
                              <div className="h-full rounded-full bg-cyan-accent/70 transition-all" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>

              {/* Hourly Activity + Countries */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Hourly activity heatmap */}
                <div className="bg-surface-dark border border-border rounded-2xl p-5">
                  <h2 className="text-xs font-unbounded font-semibold uppercase tracking-wider text-muted mb-4">Actividad por Hora (7 días)</h2>
                  <div className="grid grid-cols-12 gap-1">
                    {analytics.hourlyActivity.map((count, h) => {
                      const intensity = maxHourly > 0 ? count / maxHourly : 0;
                      return (
                        <div key={h} className="group relative">
                          <div
                            className="w-full aspect-square rounded-sm transition-colors cursor-pointer"
                            style={{
                              backgroundColor: intensity > 0
                                ? `rgba(24, 200, 255, ${0.15 + intensity * 0.85})`
                                : 'rgba(234, 246, 255, 0.05)',
                            }}
                          />
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-deep-black border border-border rounded-lg px-2 py-1 text-[10px] whitespace-nowrap z-10">
                            {h}:00 — {count} visitas
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-between mt-2 text-[10px] text-muted">
                    <span>12am</span>
                    <span>6am</span>
                    <span>12pm</span>
                    <span>6pm</span>
                  </div>
                </div>

                {/* Top countries */}
                <div className="bg-surface-dark border border-border rounded-2xl p-5">
                  <h2 className="text-xs font-unbounded font-semibold uppercase tracking-wider text-muted mb-4">Países</h2>
                  {analytics.topCountries.length === 0 ? (
                    <p className="text-sm text-muted">Sin datos de ubicación</p>
                  ) : (
                    <div className="space-y-3">
                      {analytics.topCountries.map((c, i) => {
                        const flag = COUNTRY_FLAGS[c.country] || '🌍';
                        const maxC = analytics.topCountries[0]?.views || 1;
                        const pct = (c.views / maxC) * 100;
                        return (
                          <div key={i}>
                            <div className="flex justify-between text-sm mb-1">
                              <span>{flag} {c.country}</span>
                              <span className="text-muted">{c.views}</span>
                            </div>
                            <div className="w-full bg-surface-elevated rounded-full h-1.5 overflow-hidden">
                              <div className="h-full rounded-full bg-electric-blue/70 transition-all" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
