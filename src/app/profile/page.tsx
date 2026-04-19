'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import Button from '@/components/ui/Button';

interface OrderItem {
  name: string;
  price: number;
  quantity: number;
  size: string;
  color: string;
  image: string;
}

interface Order {
  _id: string;
  items: OrderItem[];
  total: number;
  status: string;
  trackingCode?: string;
  trackingCarrier?: string;
  shippingAddress: {
    name: string;
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  createdAt: string;
}

const STATUS_STEPS = ['pending', 'confirmed', 'shipped', 'delivered'];

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmada',
  shipped: 'Enviada',
  delivered: 'Entregada',
  cancelled: 'Cancelada',
};

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-400',
  confirmed: 'bg-blue-500/20 text-blue-400',
  shipped: 'bg-purple-500/20 text-purple-400',
  delivered: 'bg-green-500/20 text-green-400',
  cancelled: 'bg-red-500/20 text-red-400',
};

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    async function loadOrders() {
      try {
        const res = await fetch('/api/orders');
        const data = await res.json();
        setOrders(data.orders || []);
      } catch { /* ignore */ }
      setLoading(false);
    }
    loadOrders();
  }, [user]);

  if (authLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20">
        <div className="h-8 w-48 bg-surface-dark rounded animate-pulse mb-8" />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => <div key={i} className="bg-surface-dark rounded-2xl h-24 animate-pulse" />)}
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <h1 className="font-unbounded text-2xl font-bold mb-4">Mi Cuenta</h1>
        <p className="text-muted mb-6">Inicia sesión para ver tu perfil y pedidos</p>
        <Link href="/login"><Button>Iniciar sesión</Button></Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Profile header */}
      <div className="bg-surface-dark border border-border rounded-2xl p-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-electric-blue/20 flex items-center justify-center">
            <span className="font-unbounded text-xl font-bold text-electric-blue">
              {user.name?.charAt(0)?.toUpperCase() || user.email.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h1 className="font-unbounded text-xl font-bold">{user.name || 'Usuario'}</h1>
            <p className="text-sm text-muted">{user.email}</p>
          </div>
        </div>
      </div>

      {/* Orders */}
      <h2 className="font-unbounded text-lg font-bold mb-6">Mis Pedidos</h2>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => <div key={i} className="bg-surface-dark rounded-2xl h-24 animate-pulse" />)}
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-surface-dark border border-border rounded-2xl p-12 text-center">
          <p className="text-muted mb-4">No tienes pedidos aún</p>
          <Link href="/products"><Button>Ver Colección</Button></Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const isExpanded = expandedOrder === order._id;
            const currentStep = STATUS_STEPS.indexOf(order.status);
            const isCancelled = order.status === 'cancelled';

            return (
              <div key={order._id} className="bg-surface-dark border border-border rounded-2xl overflow-hidden">
                {/* Order header */}
                <div
                  className="p-5 cursor-pointer hover:bg-surface-elevated/30 transition-colors"
                  onClick={() => setExpandedOrder(isExpanded ? null : order._id)}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-xs text-muted font-mono">#{order._id.slice(-8)}</span>
                        <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${STATUS_COLORS[order.status]}`}>
                          {STATUS_LABELS[order.status]}
                        </span>
                      </div>
                      <p className="text-sm">
                        {order.items.map((i) => `${i.name} x${i.quantity}`).join(', ')}
                      </p>
                      <p className="text-xs text-muted mt-1">
                        {new Date(order.createdAt).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-unbounded text-lg font-bold">${order.total.toLocaleString('es-MX')}</span>
                      <span className="text-muted text-xs">{isExpanded ? '▲' : '▼'}</span>
                    </div>
                  </div>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="border-t border-border p-5 space-y-6">
                    {/* Status timeline */}
                    {!isCancelled && (
                      <div>
                        <h3 className="text-xs font-unbounded font-semibold uppercase tracking-wider text-muted mb-4">Estado del pedido</h3>
                        <div className="flex items-center gap-2">
                          {STATUS_STEPS.map((step, i) => (
                            <React.Fragment key={step}>
                              <div className="flex flex-col items-center gap-1">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                                  i <= currentStep
                                    ? 'bg-electric-blue text-white'
                                    : 'bg-surface-elevated text-muted'
                                }`}>
                                  {i <= currentStep ? '✓' : i + 1}
                                </div>
                                <span className="text-[10px] text-muted text-center">{STATUS_LABELS[step]}</span>
                              </div>
                              {i < STATUS_STEPS.length - 1 && (
                                <div className={`flex-1 h-0.5 ${i < currentStep ? 'bg-electric-blue' : 'bg-surface-elevated'}`} />
                              )}
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Tracking */}
                    {order.trackingCode && (
                      <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
                        <p className="text-xs text-muted mb-1">Código de rastreo</p>
                        <p className="text-sm font-medium text-purple-400">
                          {order.trackingCarrier && <span className="text-muted">{order.trackingCarrier}: </span>}
                          {order.trackingCode}
                        </p>
                      </div>
                    )}

                    {/* Items */}
                    <div>
                      <h3 className="text-xs font-unbounded font-semibold uppercase tracking-wider text-muted mb-3">Artículos</h3>
                      <div className="space-y-3">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-3 bg-surface-elevated rounded-xl p-3">
                            {item.image && (
                              <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                                <img src={item.image} alt="" className="w-full h-full object-cover" />
                              </div>
                            )}
                            <div className="flex-1">
                              <p className="text-sm font-medium">{item.name}</p>
                              <p className="text-xs text-muted">
                                {item.size && `Talla: ${item.size}`}
                                {item.color && ` • Color: ${item.color}`}
                                {` • x${item.quantity}`}
                              </p>
                            </div>
                            <span className="text-sm font-medium">${(item.price * item.quantity).toLocaleString('es-MX')}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Shipping address */}
                    {order.shippingAddress?.street && (
                      <div>
                        <h3 className="text-xs font-unbounded font-semibold uppercase tracking-wider text-muted mb-3">Dirección de envío</h3>
                        <div className="text-sm space-y-1 text-muted">
                          <p>{order.shippingAddress.name}</p>
                          <p>{order.shippingAddress.street}</p>
                          <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}</p>
                          <p>{order.shippingAddress.country}</p>
                        </div>
                      </div>
                    )}

                    {/* Total */}
                    <div className="border-t border-border pt-4 flex justify-between items-center">
                      <span className="text-sm text-muted">Total del pedido</span>
                      <span className="font-unbounded text-xl font-bold">${order.total.toLocaleString('es-MX')} MXN</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
