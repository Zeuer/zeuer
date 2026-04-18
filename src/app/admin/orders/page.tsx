'use client';

import React, { useEffect, useState } from 'react';

interface Order {
  _id: string;
  userId: string;
  items: { name: string; quantity: number }[];
  total: number;
  status: string;
  paymentMethod: string;
  createdAt: string;
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-400',
  confirmed: 'bg-blue-500/20 text-blue-400',
  shipped: 'bg-purple-500/20 text-purple-400',
  delivered: 'bg-green-500/20 text-green-400',
  cancelled: 'bg-red-500/20 text-red-400',
};

const STATUS_OPTIONS = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/orders');
        const data = await res.json();
        setOrders(data.orders || []);
      } catch { /* ignore */ }
      setLoading(false);
    }
    load();
  }, []);

  async function updateStatus(id: string, status: string) {
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setOrders(orders.map((o) => o._id === id ? { ...o, status } : o));
      }
    } catch { /* ignore */ }
  }

  return (
    <div>
      <h1 className="font-unbounded text-2xl font-bold mb-8">Órdenes</h1>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => <div key={i} className="bg-surface-dark rounded-xl h-20 animate-pulse" />)}
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-surface-dark border border-border rounded-2xl p-12 text-center">
          <p className="text-muted">No hay órdenes aún</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <div key={o._id} className="bg-surface-dark border border-border rounded-2xl p-5 hover:border-border-hover transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs text-muted font-mono">#{o._id.slice(-8)}</span>
                    <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${STATUS_COLORS[o.status] || 'bg-surface-elevated text-muted'}`}>
                      {o.status}
                    </span>
                  </div>
                  <p className="text-sm">
                    {o.items.map((i) => `${i.name} x${i.quantity}`).join(', ')}
                  </p>
                  <p className="text-xs text-muted mt-1">
                    {new Date(o.createdAt).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}
                    {' • '}{o.paymentMethod}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-unbounded text-lg font-bold">${o.total.toLocaleString('es-MX')}</span>
                  <select
                    value={o.status}
                    onChange={(e) => updateStatus(o._id, e.target.value)}
                    className="bg-surface-elevated border border-border rounded-lg px-3 py-2 text-xs text-cold-white focus:outline-none focus:border-electric-blue"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
