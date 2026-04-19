'use client';

import React, { useEffect, useState } from 'react';
import Button from '@/components/ui/Button';

interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  size: string;
  color: string;
  image: string;
}

interface Order {
  _id: string;
  userId?: string;
  guestEmail?: string;
  guestPhone?: string;
  items: OrderItem[];
  total: number;
  status: string;
  paymentMethod: string;
  paymentId: string;
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

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-400',
  confirmed: 'bg-blue-500/20 text-blue-400',
  shipped: 'bg-purple-500/20 text-purple-400',
  delivered: 'bg-green-500/20 text-green-400',
  cancelled: 'bg-red-500/20 text-red-400',
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmada',
  shipped: 'Enviada',
  delivered: 'Entregada',
  cancelled: 'Cancelada',
};

const STATUS_OPTIONS = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [trackingInputs, setTrackingInputs] = useState<Record<string, { code: string; carrier: string }>>({});

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      setOrders(data.orders || []);
    } catch { /* ignore */ }
    setLoading(false);
  }

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

  async function saveTracking(id: string) {
    const input = trackingInputs[id];
    if (!input?.code) return;
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trackingCode: input.code,
          trackingCarrier: input.carrier,
          status: 'shipped',
        }),
      });
      if (res.ok) {
        setOrders(orders.map((o) => o._id === id
          ? { ...o, trackingCode: input.code, trackingCarrier: input.carrier, status: 'shipped' }
          : o
        ));
        setTrackingInputs({ ...trackingInputs, [id]: { code: '', carrier: '' } });
      }
    } catch { /* ignore */ }
  }

  async function deleteOrder(id: string) {
    if (!confirm('¿Eliminar esta orden permanentemente?')) return;
    try {
      const res = await fetch(`/api/orders/${id}`, { method: 'DELETE' });
      if (res.ok) setOrders(orders.filter((o) => o._id !== id));
    } catch { /* ignore */ }
  }

  async function deleteAllOrders() {
    if (!confirm('¿Eliminar TODAS las órdenes? Esta acción no se puede deshacer.')) return;
    try {
      const res = await fetch('/api/orders/all', { method: 'DELETE' });
      if (res.ok) setOrders([]);
    } catch { /* ignore */ }
  }

  function toggleExpanded(id: string) {
    setExpandedId(expandedId === id ? null : id);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-unbounded text-2xl font-bold">Órdenes</h1>
        {orders.length > 0 && (
          <button
            onClick={deleteAllOrders}
            className="px-4 py-2 rounded-lg text-xs bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-colors"
          >
            🗑 Eliminar todas
          </button>
        )}
      </div>

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
          {orders.map((o) => {
            const isExpanded = expandedId === o._id;
            const tracking = trackingInputs[o._id] || { code: o.trackingCode || '', carrier: o.trackingCarrier || '' };

            return (
              <div key={o._id} className="bg-surface-dark border border-border rounded-2xl overflow-hidden transition-colors hover:border-border-hover">
                {/* Header row */}
                <div
                  className="p-5 cursor-pointer"
                  onClick={() => toggleExpanded(o._id)}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-xs text-muted font-mono">#{o._id.slice(-8)}</span>
                        <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${STATUS_COLORS[o.status] || 'bg-surface-elevated text-muted'}`}>
                          {STATUS_LABELS[o.status] || o.status}
                        </span>
                        {o.trackingCode && (
                          <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-purple-500/20 text-purple-400">
                            📦 {o.trackingCode}
                          </span>
                        )}
                        {o.guestPhone && !o.userId && (
                          <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-cyan-500/10 text-cyan-400">
                            Invitado
                          </span>
                        )}
                      </div>
                      <p className="text-sm">
                        {o.items.map((i) => `${i.name} x${i.quantity}`).join(', ')}
                      </p>
                      <p className="text-xs text-muted mt-1">
                        {new Date(o.createdAt).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        {' • '}{o.paymentMethod}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-unbounded text-lg font-bold">${o.total.toLocaleString('es-MX')}</span>
                      <span className="text-muted text-xs">{isExpanded ? '▲' : '▼'}</span>
                    </div>
                  </div>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="border-t border-border p-5 space-y-6" onClick={(e) => e.stopPropagation()}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Customer info */}
                      <div>
                        <h3 className="text-xs font-unbounded font-semibold uppercase tracking-wider text-muted mb-3">Cliente</h3>
                        <div className="space-y-2 text-sm">
                          {o.shippingAddress?.name && (
                            <p><span className="text-muted">Nombre:</span> {o.shippingAddress.name}</p>
                          )}
                          {o.guestPhone && (
                            <p>
                              <span className="text-muted">Teléfono:</span>{' '}
                              <a href={`https://wa.me/52${o.guestPhone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-green-400 hover:underline">
                                {o.guestPhone} ↗
                              </a>
                            </p>
                          )}
                          {o.guestEmail && (
                            <p>
                              <span className="text-muted">Email:</span>{' '}
                              <a href={`mailto:${o.guestEmail}`} className="text-electric-blue hover:underline">{o.guestEmail}</a>
                            </p>
                          )}
                          {o.userId && <p><span className="text-muted">ID Usuario:</span> {o.userId}</p>}
                        </div>
                      </div>

                      {/* Shipping address */}
                      <div>
                        <h3 className="text-xs font-unbounded font-semibold uppercase tracking-wider text-muted mb-3">Dirección de envío</h3>
                        <div className="text-sm space-y-1">
                          <p>{o.shippingAddress?.street || '—'}</p>
                          <p>{o.shippingAddress?.city}{o.shippingAddress?.state ? `, ${o.shippingAddress.state}` : ''}</p>
                          <p>{o.shippingAddress?.zip} {o.shippingAddress?.country}</p>
                        </div>
                      </div>
                    </div>

                    {/* Order items */}
                    <div>
                      <h3 className="text-xs font-unbounded font-semibold uppercase tracking-wider text-muted mb-3">Artículos</h3>
                      <div className="space-y-3">
                        {o.items.map((item, idx) => (
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
                                {` • Cantidad: ${item.quantity}`}
                              </p>
                            </div>
                            <span className="text-sm font-medium">${(item.price * item.quantity).toLocaleString('es-MX')}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Tracking code input */}
                    {['confirmed', 'shipped'].includes(o.status) && (
                      <div>
                        <h3 className="text-xs font-unbounded font-semibold uppercase tracking-wider text-muted mb-3">Código de rastreo</h3>
                        <div className="flex gap-3">
                          <input
                            type="text"
                            placeholder="Paquetería (ej: Estafeta, FedEx)"
                            value={tracking.carrier}
                            onChange={(e) => setTrackingInputs({
                              ...trackingInputs,
                              [o._id]: { ...tracking, carrier: e.target.value }
                            })}
                            className="flex-1 bg-surface-elevated border border-border rounded-lg px-3 py-2 text-sm text-cold-white placeholder-muted/50 focus:outline-none focus:border-electric-blue"
                          />
                          <input
                            type="text"
                            placeholder="Número de guía"
                            value={tracking.code}
                            onChange={(e) => setTrackingInputs({
                              ...trackingInputs,
                              [o._id]: { ...tracking, code: e.target.value }
                            })}
                            className="flex-1 bg-surface-elevated border border-border rounded-lg px-3 py-2 text-sm text-cold-white placeholder-muted/50 focus:outline-none focus:border-electric-blue"
                          />
                          <Button size="sm" onClick={() => saveTracking(o._id)}>
                            Enviar
                          </Button>
                        </div>
                        {o.trackingCode && (
                          <p className="text-xs text-green-400 mt-2">
                            ✓ Guía actual: {o.trackingCarrier && `${o.trackingCarrier} — `}{o.trackingCode}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Payment info */}
                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <div className="text-xs text-muted">
                        <span>Pago: {o.paymentMethod}</span>
                        {o.paymentId && <span> • ID: {o.paymentId}</span>}
                      </div>
                      <div className="flex items-center gap-3">
                        <select
                          value={o.status}
                          onChange={(e) => updateStatus(o._id, e.target.value)}
                          className="bg-surface-elevated border border-border rounded-lg px-3 py-2 text-xs text-cold-white focus:outline-none focus:border-electric-blue"
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                          ))}
                        </select>
                        <button
                          onClick={() => deleteOrder(o._id)}
                          className="px-3 py-2 rounded-lg text-xs bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-colors"
                        >
                          🗑
                        </button>
                      </div>
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
