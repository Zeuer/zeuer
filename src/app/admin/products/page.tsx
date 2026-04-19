'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';

interface Product {
  _id: string;
  name: string;
  price: number;
  category: string;
  stock: number;
  images: string[];
  moqEnabled?: boolean;
  minOrderQty?: number;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    try {
      const res = await fetch('/api/products?limit=100');
      const data = await res.json();
      setProducts(data.products || []);
    } catch { /* ignore */ }
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar este producto?')) return;
    try {
      await fetch(`/api/products/${id}`, { method: 'DELETE' });
      setProducts(products.filter((p) => p._id !== id));
    } catch { /* ignore */ }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-unbounded text-2xl font-bold">Productos</h1>
        <Link href="/admin/products/new">
          <Button size="sm">+ Nuevo Producto</Button>
        </Link>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-surface-dark rounded-xl h-20 animate-pulse" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="bg-surface-dark border border-border rounded-2xl p-12 text-center">
          <p className="text-muted mb-4">No hay productos aún</p>
          <Link href="/admin/products/new"><Button>Crear primer producto</Button></Link>
        </div>
      ) : (
        <div className="bg-surface-dark border border-border rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-4 py-3 text-xs font-unbounded uppercase tracking-wider text-muted">Producto</th>
                  <th className="text-left px-4 py-3 text-xs font-unbounded uppercase tracking-wider text-muted">Categoría</th>
                  <th className="text-left px-4 py-3 text-xs font-unbounded uppercase tracking-wider text-muted">Precio</th>
                  <th className="text-left px-4 py-3 text-xs font-unbounded uppercase tracking-wider text-muted">Stock</th>
                  <th className="text-left px-4 py-3 text-xs font-unbounded uppercase tracking-wider text-muted">MOQ</th>
                  <th className="text-right px-4 py-3 text-xs font-unbounded uppercase tracking-wider text-muted">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p._id} className="border-b border-border last:border-0 hover:bg-surface-elevated/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-surface-elevated flex-shrink-0">
                          <img src={p.images?.[0] || '/images/jersey.png'} alt="" className="w-full h-full object-cover" />
                        </div>
                        <span className="font-medium">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted">{p.category}</td>
                    <td className="px-4 py-3">${p.price.toLocaleString('es-MX')}</td>
                    <td className="px-4 py-3">
                      <span className={`${p.stock > 10 ? 'text-green-400' : p.stock > 0 ? 'text-yellow-400' : 'text-red-400'}`}>
                        {p.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {p.moqEnabled ? (
                        <span className="text-xs bg-yellow-500/10 text-yellow-400 px-2 py-0.5 rounded">{p.minOrderQty || 1}</span>
                      ) : (
                        <span className="text-xs text-muted">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/products/${p._id}/edit`}
                          className="px-3 py-1.5 rounded-lg text-xs bg-surface-elevated border border-border hover:border-electric-blue/30 transition-colors"
                        >
                          Editar
                        </Link>
                        <button
                          onClick={() => handleDelete(p._id)}
                          className="px-3 py-1.5 rounded-lg text-xs bg-surface-elevated border border-border hover:border-red-500/30 hover:text-red-400 transition-colors"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
