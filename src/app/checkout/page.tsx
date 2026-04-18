'use client';

import React, { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Link from 'next/link';

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const [orderComplete, setOrderComplete] = useState(false);
  const [address, setAddress] = useState({
    name: '', street: '', city: '', state: '', zip: '', country: 'México',
  });

  async function createOrder(paymentId: string) {
    try {
      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          total,
          paymentMethod: 'paypal',
          paymentId,
          shippingAddress: address,
        }),
      });
      clearCart();
      setOrderComplete(true);
    } catch { /* handle error */ }
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <h1 className="font-unbounded text-2xl font-bold mb-4">Checkout</h1>
        <p className="text-muted mb-6">Inicia sesión para continuar</p>
        <Link href="/login"><Button>Iniciar sesión</Button></Link>
      </div>
    );
  }

  if (items.length === 0 && !orderComplete) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <h1 className="font-unbounded text-2xl font-bold mb-4">Checkout</h1>
        <p className="text-muted mb-6">Tu carrito está vacío</p>
        <Link href="/products"><Button>Ver Colección</Button></Link>
      </div>
    );
  }

  if (orderComplete) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-green-400 text-3xl">✓</span>
        </div>
        <h1 className="font-unbounded text-2xl font-bold mb-4">¡Orden Completada!</h1>
        <p className="text-muted mb-8">Gracias por tu compra. Recibirás un correo de confirmación.</p>
        <Link href="/products"><Button>Seguir comprando</Button></Link>
      </div>
    );
  }

  const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || 'test';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="font-unbounded text-3xl font-bold mb-8">CHECKOUT</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Shipping form */}
        <div className="space-y-6">
          <h2 className="font-unbounded text-lg font-semibold">Dirección de envío</h2>
          <div className="space-y-4">
            <Input label="Nombre completo" value={address.name} onChange={(e) => setAddress({ ...address, name: e.target.value })} required />
            <Input label="Calle y número" value={address.street} onChange={(e) => setAddress({ ...address, street: e.target.value })} required />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Ciudad" value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} required />
              <Input label="Estado" value={address.state} onChange={(e) => setAddress({ ...address, state: e.target.value })} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Código postal" value={address.zip} onChange={(e) => setAddress({ ...address, zip: e.target.value })} required />
              <Input label="País" value={address.country} onChange={(e) => setAddress({ ...address, country: e.target.value })} />
            </div>
          </div>

          {/* PayPal */}
          <div className="mt-8">
            <h2 className="font-unbounded text-lg font-semibold mb-4">Método de pago</h2>
            {paypalClientId !== 'test' ? (
              <PayPalScriptProvider options={{ clientId: paypalClientId, currency: 'MXN' }}>
                <PayPalButtons
                  style={{ layout: 'vertical', color: 'black', shape: 'rect', label: 'pay' }}
                  createOrder={(_data, actions) => {
                    return actions.order.create({
                      intent: 'CAPTURE',
                      purchase_units: [{
                        amount: { currency_code: 'MXN', value: total.toFixed(2) },
                        description: `Zeuer - ${items.length} artículos`,
                      }],
                    });
                  }}
                  onApprove={async (_data, actions) => {
                    const details = await actions.order!.capture();
                    await createOrder(details.id!);
                  }}
                />
              </PayPalScriptProvider>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted">PayPal sandbox mode. Usa el botón para simular pago.</p>
                <Button fullWidth onClick={() => createOrder('sandbox-' + Date.now())}>
                  Simular Pago — ${total.toLocaleString('es-MX')} MXN
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Order summary */}
        <div>
          <div className="bg-surface-dark border border-border rounded-2xl p-6 sticky top-24">
            <h2 className="font-unbounded text-sm font-semibold mb-6">RESUMEN DE ORDEN</h2>
            <div className="space-y-4 mb-6">
              {items.map((item, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-surface-elevated flex-shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-muted">{item.size} • {item.color} • x{item.quantity}</p>
                  </div>
                  <p className="text-sm font-medium">${(item.price * item.quantity).toLocaleString('es-MX')}</p>
                </div>
              ))}
            </div>
            <div className="border-t border-border pt-4 flex justify-between font-semibold">
              <span>Total</span>
              <span>${total.toLocaleString('es-MX')} MXN</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
