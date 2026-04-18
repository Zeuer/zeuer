'use client';

import React, { useEffect, useState } from 'react';

interface Stats {
  products: number;
  users: number;
  orders: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ products: 0, users: 0, orders: 0 });

  useEffect(() => {
    async function loadStats() {
      try {
        const [pRes, uRes, oRes] = await Promise.all([
          fetch('/api/products?limit=0'),
          fetch('/api/users'),
          fetch('/api/orders'),
        ]);
        const pData = await pRes.json();
        const uData = await uRes.json();
        const oData = await oRes.json();
        setStats({
          products: pData.total || 0,
          users: uData.users?.length || 0,
          orders: oData.orders?.length || 0,
        });
      } catch { /* ignore */ }
    }
    loadStats();
  }, []);

  const cards = [
    { label: 'Productos', value: stats.products, icon: '◇', color: 'electric-blue' },
    { label: 'Usuarios', value: stats.users, icon: '◉', color: 'cyan-accent' },
    { label: 'Órdenes', value: stats.orders, icon: '◎', color: 'electric-blue' },
  ];

  return (
    <div>
      <h1 className="font-unbounded text-2xl font-bold mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {cards.map((card) => (
          <div
            key={card.label}
            className="bg-surface-dark border border-border rounded-2xl p-6 transition-all hover:border-electric-blue/30"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-2xl">{card.icon}</span>
              <span className={`text-xs uppercase tracking-wider text-${card.color}`}>{card.label}</span>
            </div>
            <p className="font-unbounded text-3xl font-bold">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 bg-surface-dark border border-border rounded-2xl p-6">
        <h2 className="font-unbounded text-lg font-semibold mb-4">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <a href="/admin/products/new" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-surface-elevated border border-border hover:border-electric-blue/30 transition-all text-sm">
            <span className="text-electric-blue">+</span> Nuevo Producto
          </a>
          <a href="/admin/products" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-surface-elevated border border-border hover:border-electric-blue/30 transition-all text-sm">
            <span className="text-electric-blue">◇</span> Gestionar Productos
          </a>
          <a href="/admin/users" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-surface-elevated border border-border hover:border-electric-blue/30 transition-all text-sm">
            <span className="text-electric-blue">◉</span> Ver Usuarios
          </a>
          <a href="/admin/orders" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-surface-elevated border border-border hover:border-electric-blue/30 transition-all text-sm">
            <span className="text-electric-blue">◎</span> Ver Órdenes
          </a>
        </div>
      </div>
    </div>
  );
}
