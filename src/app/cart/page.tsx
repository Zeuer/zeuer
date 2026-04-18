'use client';

import React from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import Button from '@/components/ui/Button';

export default function CartPage() {
  const { items, total, removeItem, updateQuantity, clearCart, itemCount } = useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="font-unbounded text-3xl font-bold mb-4">CARRITO</h1>
        <p className="text-muted mb-8">Tu carrito está vacío</p>
        <Link href="/products">
          <Button>Ver Colección</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-unbounded text-3xl font-bold">CARRITO</h1>
        <span className="text-sm text-muted">{itemCount} artículos</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item, idx) => (
            <div key={idx} className="flex gap-4 bg-surface-dark border border-border rounded-2xl p-4 transition-all hover:border-border-hover">
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl overflow-hidden bg-surface-elevated flex-shrink-0">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-unbounded text-sm font-semibold">{item.name}</h3>
                  <p className="text-xs text-muted mt-1">
                    {item.color && `Color: ${item.color}`} {item.size && `• Talla: ${item.size}`}
                  </p>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.productId, item.size, item.color, item.quantity - 1)}
                      className="w-8 h-8 rounded-lg border border-border text-cold-white/70 hover:border-electric-blue hover:text-cold-white transition-colors flex items-center justify-center text-sm"
                    >
                      −
                    </button>
                    <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.size, item.color, item.quantity + 1)}
                      className="w-8 h-8 rounded-lg border border-border text-cold-white/70 hover:border-electric-blue hover:text-cold-white transition-colors flex items-center justify-center text-sm"
                    >
                      +
                    </button>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-semibold">${(item.price * item.quantity).toLocaleString('es-MX')}</span>
                    <button
                      onClick={() => removeItem(item.productId, item.size, item.color)}
                      className="text-muted hover:text-red-400 transition-colors text-xs"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="bg-surface-dark border border-border rounded-2xl p-6 sticky top-24">
            <h3 className="font-unbounded text-sm font-semibold mb-6">RESUMEN</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-muted">
                <span>Subtotal</span>
                <span>${total.toLocaleString('es-MX')} MXN</span>
              </div>
              <div className="flex justify-between text-muted">
                <span>Envío</span>
                <span>Calculado al checkout</span>
              </div>
              <div className="border-t border-border pt-3 flex justify-between font-semibold text-cold-white">
                <span>Total</span>
                <span>${total.toLocaleString('es-MX')} MXN</span>
              </div>
            </div>

            <Link href="/checkout" className="block mt-6">
              <Button fullWidth size="lg">Proceder al pago</Button>
            </Link>

            <button
              onClick={clearCart}
              className="w-full mt-3 text-xs text-muted hover:text-red-400 transition-colors text-center py-2"
            >
              Vaciar carrito
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
