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

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch('/api/stats');
        const data = await res.json();
        setStats(data);
      } catch { /* ignore */ }
      setLoading(false);
    }
    loadStats();
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

  return (
    <div className="space-y-8">
      <h1 className="font-unbounded text-2xl font-bold">Dashboard</h1>

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
        {/* Revenue Chart */}
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

        {/* Orders by Status */}
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
        {/* Top Products */}
        <div className="bg-surface-dark border border-border rounded-2xl p-5">
          <h2 className="text-xs font-unbounded font-semibold uppercase tracking-wider text-muted mb-4">Productos más vendidos</h2>
          {stats.topProducts.length === 0 ? (
            <p className="text-sm text-muted">Sin ventas aún</p>
          ) : (
            <div className="space-y-3">
              {stats.topProducts.map((p, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-electric-blue/20 text-electric-blue text-xs flex items-center justify-center font-bold">
                    {i + 1}
                  </span>
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

        {/* Low Stock + Quick Actions */}
        <div className="space-y-6">
          {/* Low Stock */}
          <div className="bg-surface-dark border border-border rounded-2xl p-5">
            <h2 className="text-xs font-unbounded font-semibold uppercase tracking-wider text-muted mb-4">Alertas de Stock</h2>
            {stats.lowStock.length === 0 ? (
              <p className="text-sm text-green-400">✓ Todo el inventario está bien</p>
            ) : (
              <div className="space-y-2">
                {stats.lowStock.map((p) => (
                  <div key={p._id} className="flex items-center justify-between text-sm">
                    <Link href={`/admin/products/${p._id}/edit`} className="hover:text-electric-blue transition-colors">
                      {p.name}
                    </Link>
                    <span className={`font-bold ${p.stock === 0 ? 'text-red-400' : 'text-yellow-400'}`}>
                      {p.stock === 0 ? 'Agotado' : `${p.stock} uds`}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
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
    </div>
  );
}

const STATUS_OPTIONS = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
