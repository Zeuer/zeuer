'use client';

import React, { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from '@/components/ui/ProductCard';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

interface Product {
  _id: string;
  name: string;
  price: number;
  images: string[];
  category: string;
}

const CATEGORIES = ['Jerseys', 'Essentials', 'Colaboraciones', 'Concepto'];

const STATIC_PRODUCTS = [
  { _id: 'static-0', name: "Kit Irapuato '67", price: 449, images: ['/images/jersey.png'], category: 'Jerseys' },
  { _id: 'static-1', name: 'Kit DWNC', price: 449, images: ['/images/dwnc.png'], category: 'Colaboraciones' },
  { _id: 'static-2', name: 'Concepto Kit GB', price: 449, images: ['/images/zgb.png'], category: 'Concepto' },
  { _id: 'static-3', name: 'Essentials Negro', price: 349, images: ['/images/ess1.png'], category: 'Essentials' },
  { _id: 'static-4', name: 'Essentials Gris', price: 349, images: ['/images/ess3.png'], category: 'Essentials' },
  { _id: 'static-5', name: 'Essentials Azul', price: 349, images: ['/images/ess5.png'], category: 'Essentials' },
];

function ProductsContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (category) params.set('category', category);
      if (minPrice) params.set('minPrice', minPrice);
      if (maxPrice) params.set('maxPrice', maxPrice);

      const res = await fetch(`/api/products?${params.toString()}`);
      const data = await res.json();
      if (data.products && data.products.length > 0) {
        setProducts(data.products);
      } else {
        let filtered = STATIC_PRODUCTS as Product[];
        if (category) filtered = filtered.filter((p) => p.category === category);
        if (search) filtered = filtered.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
        if (minPrice) filtered = filtered.filter((p) => p.price >= parseFloat(minPrice));
        if (maxPrice) filtered = filtered.filter((p) => p.price <= parseFloat(maxPrice));
        setProducts(filtered);
      }
    } catch {
      let filtered = STATIC_PRODUCTS as Product[];
      if (category) filtered = filtered.filter((p) => p.category === category);
      setProducts(filtered);
    }
    setLoading(false);
  }, [search, category, minPrice, maxPrice]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="font-unbounded text-3xl sm:text-4xl font-bold mb-8">COLECCIÓN</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar filters */}
        <aside className="lg:w-64 flex-shrink-0">
          <div className="sticky top-24 space-y-6">
            <div>
              <Input placeholder="Buscar productos..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>

            <div>
              <h3 className="text-xs font-unbounded font-semibold uppercase tracking-wider text-cold-white mb-3">Categoría</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setCategory('')}
                  className={`block w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${!category ? 'bg-electric-blue/20 text-electric-blue' : 'text-muted hover:text-cold-white hover:bg-surface-elevated'}`}
                >
                  Todas
                </button>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`block w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${category === cat ? 'bg-electric-blue/20 text-electric-blue' : 'text-muted hover:text-cold-white hover:bg-surface-elevated'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-unbounded font-semibold uppercase tracking-wider text-cold-white mb-3">Precio</h3>
              <div className="flex gap-2">
                <Input placeholder="Min" type="number" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
                <Input placeholder="Max" type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
              </div>
              <Button variant="ghost" size="sm" fullWidth className="mt-2" onClick={fetchProducts}>Aplicar</Button>
            </div>
          </div>
        </aside>

        {/* Products grid */}
        <div className="flex-1">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-surface-dark rounded-2xl aspect-square animate-pulse" />
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {products.map((p) => (
                <ProductCard key={p._id} id={p._id} name={p.name} price={p.price} image={p.images?.[0] || '/images/jersey.png'} category={p.category} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-muted text-lg">No se encontraron productos</p>
            </div>
          )}

          {/* Custom Jersey CTA */}
          <div className="mt-12 text-center bg-gradient-to-br from-electric-blue/10 via-surface-dark to-cyan-accent/5 border border-electric-blue/20 rounded-2xl p-8">
            <h3 className="font-unbounded text-lg font-bold mb-2">¿Buscas un uniforme para tu equipo?</h3>
            <p className="text-sm text-muted mb-6">Diseñamos jerseys personalizados. Contáctanos.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="https://wa.me/5217299684245?text=Hola%2C%20me%20interesa%20un%20jersey%20personalizado"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 text-sm px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-500 transition-colors"
              >
                💬 WhatsApp
              </a>
              <a
                href="mailto:zeuermedia@hotmail.com?subject=Jersey%20personalizado"
                className="inline-flex items-center justify-center gap-2 text-sm px-6 py-3 bg-surface-elevated border border-border text-cold-white rounded-lg hover:border-electric-blue transition-colors"
              >
                ✉️ Email
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="h-10 w-48 bg-surface-dark rounded animate-pulse mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => <div key={i} className="bg-surface-dark rounded-2xl aspect-square animate-pulse" />)}
        </div>
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}
