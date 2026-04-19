'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    name: '', description: '', price: '', category: '',
    sizes: '',
    images: [] as string[],
    stock: '0',
    featured: false,
    moqEnabled: false,
    minOrderQty: '1',
    colors: [{ name: '', hex: '#0A6CFF' }],
  });

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/products/${id}`);
        if (res.ok) {
          const p = await res.json();
          setForm({
            name: p.name,
            description: p.description,
            price: p.price.toString(),
            category: p.category,
            sizes: p.sizes?.join(', ') || '',
            images: p.images || [],
            stock: p.stock?.toString() || '0',
            featured: p.featured || false,
            moqEnabled: p.moqEnabled || false,
            minOrderQty: p.minOrderQty?.toString() || '1',
            colors: p.colors?.length > 0 ? p.colors : [{ name: '', hex: '#0A6CFF' }],
          });
        }
      } catch { /* ignore */ }
    }
    load();
  }, [id]);

  function updateField(key: string, value: string | boolean) {
    setForm({ ...form, [key]: value });
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.url) {
        setForm({ ...form, images: [...form.images, data.url] });
      }
    } catch { /* ignore */ }
    setUploading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const body = {
        name: form.name,
        description: form.description,
        price: parseFloat(form.price),
        category: form.category,
        sizes: form.sizes.split(',').map((s) => s.trim()),
        images: form.images,
        stock: parseInt(form.stock),
        featured: form.featured,
        moqEnabled: form.moqEnabled,
        minOrderQty: parseInt(form.minOrderQty) || 1,
        colors: form.colors.filter((c) => c.name),
      };
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        router.push('/admin/products');
      }
    } catch { /* ignore */ }
    setLoading(false);
  }

  return (
    <div>
      <h1 className="font-unbounded text-2xl font-bold mb-8">Editar Producto</h1>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <Input label="Nombre" value={form.name} onChange={(e) => updateField('name', e.target.value)} required />
        <div>
          <label className="block text-xs font-medium text-cold-white/70 mb-1.5 tracking-wide">Descripción</label>
          <textarea
            className="w-full bg-surface-dark border border-border rounded-lg px-4 py-3 text-sm text-cold-white placeholder-muted/50 focus:outline-none focus:border-electric-blue focus:shadow-[0_0_10px_rgba(10,108,255,0.2)] transition-all min-h-[100px] resize-y"
            value={form.description}
            onChange={(e) => updateField('description', e.target.value)}
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Precio (MXN)" type="number" value={form.price} onChange={(e) => updateField('price', e.target.value)} required />
          <Input label="Stock" type="number" value={form.stock} onChange={(e) => updateField('stock', e.target.value)} />
        </div>
        <Input label="Categoría" value={form.category} onChange={(e) => updateField('category', e.target.value)} required />
        <Input label="Tallas (separadas por coma)" value={form.sizes} onChange={(e) => updateField('sizes', e.target.value)} />

        {/* Colors */}
        <div>
          <label className="block text-xs font-medium text-cold-white/70 mb-1.5 tracking-wide">Colores</label>
          {form.colors.map((c, i) => (
            <div key={i} className="flex gap-2 mb-2">
              <Input placeholder="Nombre" value={c.name} onChange={(e) => {
                const nc = [...form.colors]; nc[i].name = e.target.value; setForm({ ...form, colors: nc });
              }} />
              <input type="color" value={c.hex} onChange={(e) => {
                const nc = [...form.colors]; nc[i].hex = e.target.value; setForm({ ...form, colors: nc });
              }} className="w-12 h-[46px] rounded-lg cursor-pointer bg-surface-dark border border-border" />
              {form.colors.length > 1 && (
                <button type="button" onClick={() => setForm({ ...form, colors: form.colors.filter((_, idx) => idx !== i) })} className="text-red-400 text-xs px-2">✕</button>
              )}
            </div>
          ))}
          <button type="button" onClick={() => setForm({ ...form, colors: [...form.colors, { name: '', hex: '#ffffff' }] })} className="text-xs text-electric-blue hover:text-cyan-accent mt-1">+ Agregar color</button>
        </div>

        {/* Images */}
        <div>
          <label className="block text-xs font-medium text-cold-white/70 mb-1.5 tracking-wide">Imágenes</label>
          <div className="flex flex-wrap gap-3 mb-3">
            {form.images.map((img, i) => (
              <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-border">
                <img src={img} alt="" className="w-full h-full object-cover" />
                <button type="button" onClick={() => setForm({ ...form, images: form.images.filter((_, idx) => idx !== i) })} className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full text-white text-[10px] flex items-center justify-center">✕</button>
              </div>
            ))}
          </div>
          <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-elevated border border-border hover:border-electric-blue/30 transition-colors text-sm cursor-pointer">
            {uploading ? 'Subiendo...' : '📁 Subir imagen'}
            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
          </label>
        </div>

        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={form.featured} onChange={(e) => updateField('featured', e.target.checked)} className="w-4 h-4 rounded accent-electric-blue" />
          <span className="text-sm">Producto destacado</span>
        </label>

        {/* MOQ */}
        <div className="bg-surface-elevated border border-border rounded-xl p-4">
          <label className="flex items-center gap-3 cursor-pointer mb-3">
            <input type="checkbox" checked={form.moqEnabled} onChange={(e) => updateField('moqEnabled', e.target.checked)} className="w-4 h-4 rounded accent-electric-blue" />
            <span className="text-sm">Cantidad mínima de pedido (MOQ)</span>
          </label>
          {form.moqEnabled && (
            <Input
              label="Cantidad mínima"
              type="number"
              min="1"
              value={form.minOrderQty}
              onChange={(e) => updateField('minOrderQty', e.target.value)}
            />
          )}
        </div>

        <div className="flex gap-4 pt-4">
          <Button type="submit" disabled={loading}>{loading ? 'Guardando...' : 'Guardar Cambios'}</Button>
          <Button variant="ghost" type="button" onClick={() => router.back()}>Cancelar</Button>
        </div>
      </form>
    </div>
  );
}
