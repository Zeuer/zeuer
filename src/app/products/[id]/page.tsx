'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import Button from '@/components/ui/Button';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  sizes: string[];
  colors: { name: string; hex: string }[];
  colorImages?: Record<string, string[]>;
  category: string;
  stock: number;
  moqEnabled?: boolean;
  minOrderQty?: number;
}

const STATIC_PRODUCTS: Record<string, Product> = {
  'static-0': { _id: 'static-0', name: "Kit Irapuato '67", description: "Un clásico de 1967. Jersey retro con diseño deportivo profesional.", price: 449, images: ['/images/jersey.png'], sizes: ['S','M','L','XL','XXL'], colors: [{ name: 'Rojo', hex: '#ff3c3c' }], category: 'Jerseys', stock: 50 },
  'static-1': { _id: 'static-1', name: 'Kit DWNC', description: "Recuerda ser quien gustes ser. Colaboración exclusiva.", price: 449, images: ['/images/dwnc.png'], sizes: ['S','M','L','XL','XXL'], colors: [{ name: 'Cyan', hex: '#18C8FF' }], category: 'Colaboraciones', stock: 30 },
  'static-2': { _id: 'static-2', name: 'Concepto Kit GB', description: "Excelencia académica.", price: 449, images: ['/images/zgb.png'], sizes: ['S','M','L','XL','XXL'], colors: [{ name: 'Blanco', hex: '#ffffff' }], category: 'Concepto', stock: 25 },
  'static-3': { _id: 'static-3', name: 'Essentials Negro', description: "Lo fundamental. Negro profundo para el día a día.", price: 349, images: ['/images/ess1.png'], sizes: ['S','M','L','XL','XXL'], colors: [{ name: 'Negro', hex: '#000000' }], category: 'Essentials', stock: 100 },
  'static-4': { _id: 'static-4', name: 'Essentials Gris', description: "Lo fundamental. Gris versátil.", price: 349, images: ['/images/ess3.png'], sizes: ['S','M','L','XL','XXL'], colors: [{ name: 'Gris', hex: '#777777' }], category: 'Essentials', stock: 80 },
  'static-5': { _id: 'static-5', name: 'Essentials Azul', description: "Lo fundamental. Azul eléctrico signature.", price: 349, images: ['/images/ess5.png'], sizes: ['S','M','L','XL','XXL'], colors: [{ name: 'Azul', hex: '#0A6CFF' }], category: 'Essentials', stock: 60 },
};

export default function ProductPage() {
  const params = useParams();
  const id = params.id as string;
  const { addItem } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [mainImage, setMainImage] = useState('');
  const [added, setAdded] = useState(false);
  const [quantity, setQuantity] = useState(1);

  // Get images for the currently selected color
  function getActiveImages(): string[] {
    if (!product) return [];
    const ci = product.colorImages;
    if (ci && selectedColor && ci[selectedColor]?.length > 0) {
      return ci[selectedColor];
    }
    return product.images.length > 0 ? product.images : ['/images/jersey.png'];
  }

  useEffect(() => {
    async function load() {
      // Check static first
      if (STATIC_PRODUCTS[id]) {
        const p = STATIC_PRODUCTS[id];
        setProduct(p);
        setMainImage(p.images[0]);
        setSelectedSize(p.sizes[0]);
        setSelectedColor(p.colors[0]?.name || '');
        return;
      }
      try {
        const res = await fetch(`/api/products/${id}`);
        if (res.ok) {
          const p = await res.json();
          // Convert mongoose Map to plain object if needed
          if (p.colorImages && typeof p.colorImages === 'object') {
            const ci: Record<string, string[]> = {};
            for (const [k, v] of Object.entries(p.colorImages)) {
              ci[k] = v as string[];
            }
            p.colorImages = ci;
          }
          setProduct(p);
          setSelectedSize(p.sizes?.[0] || '');
          const firstColor = p.colors?.[0]?.name || '';
          setSelectedColor(firstColor);
          // Set initial image based on first color
          const colorImgs = p.colorImages?.[firstColor];
          if (colorImgs?.length > 0) {
            setMainImage(colorImgs[0]);
          } else {
            setMainImage(p.images?.[0] || '');
          }
          if (p.moqEnabled && p.minOrderQty > 1) {
            setQuantity(p.minOrderQty);
          }
        }
      } catch { /* fallback */ }
    }
    load();
  }, [id]);

  // When color changes, update images
  useEffect(() => {
    if (!product) return;
    const imgs = getActiveImages();
    if (imgs.length > 0 && !imgs.includes(mainImage)) {
      setMainImage(imgs[0]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedColor]);

  function handleAddToCart() {
    if (!product) return;
    const moq = product.moqEnabled ? (product.minOrderQty || 1) : 1;
    const qty = Math.max(quantity, moq);
    const imgs = getActiveImages();
    addItem({
      productId: product._id,
      name: product.name,
      price: product.price,
      quantity: qty,
      size: selectedSize,
      color: selectedColor,
      image: imgs[0] || product.images[0] || '',
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-electric-blue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const activeImages = getActiveImages();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
        {/* Images */}
        <div>
          <div className="relative aspect-square bg-surface-dark rounded-2xl overflow-hidden border border-border">
            <img
              src={mainImage}
              alt={product.name}
              className="w-full h-full object-cover transition-opacity duration-300"
            />
          </div>
          {activeImages.length > 1 && (
            <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
              {activeImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setMainImage(img)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${mainImage === img ? 'border-electric-blue' : 'border-border hover:border-border-hover'}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex flex-col">
          <span className="text-xs uppercase tracking-widest text-electric-blue font-medium">{product.category}</span>
          <h1 className="font-unbounded text-2xl sm:text-3xl font-bold mt-2">{product.name}</h1>
          <p className="text-2xl font-semibold text-cold-white mt-4">${product.price.toLocaleString('es-MX')} MXN</p>
          <p className="text-muted mt-4 leading-relaxed">{product.description}</p>

          {/* Colors */}
          {product.colors.length > 0 && (
            <div className="mt-8">
              <h3 className="text-xs font-unbounded font-semibold uppercase tracking-wider mb-3">
                Color: <span className="text-muted font-dm-sans font-normal normal-case">{selectedColor}</span>
              </h3>
              <div className="flex gap-3">
                {product.colors.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => setSelectedColor(c.name)}
                    className={`w-10 h-10 rounded-xl border-2 transition-all ${selectedColor === c.name ? 'border-cold-white scale-110' : 'border-border hover:border-border-hover'}`}
                    style={{ backgroundColor: c.hex }}
                    title={c.name}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Sizes */}
          {product.sizes.length > 0 && (
            <div className="mt-6">
              <h3 className="text-xs font-unbounded font-semibold uppercase tracking-wider mb-3">Talla</h3>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(s)}
                    className={`w-14 h-10 rounded-xl border-2 text-sm font-medium transition-all ${selectedSize === s ? 'border-electric-blue bg-electric-blue/20 text-cold-white' : 'border-border text-muted hover:border-border-hover hover:text-cold-white'}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* MOQ badge */}
          {product.moqEnabled && product.minOrderQty && product.minOrderQty > 1 && (
            <div className="mt-3 inline-block bg-yellow-500/10 border border-yellow-500/30 rounded-lg px-3 py-1.5">
              <p className="text-xs text-yellow-400 font-medium">
                ⚠ Pedido mínimo: {product.minOrderQty} unidades
              </p>
            </div>
          )}

          {/* Quantity selector */}
          <div className="mt-6">
            <h3 className="text-xs font-unbounded font-semibold uppercase tracking-wider mb-3">Cantidad</h3>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity(Math.max(product.moqEnabled ? (product.minOrderQty || 1) : 1, quantity - 1))}
                className="w-10 h-10 rounded-xl border border-border text-cold-white/70 hover:border-electric-blue hover:text-cold-white transition-colors flex items-center justify-center"
              >
                −
              </button>
              <span className="w-12 text-center font-medium">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-10 rounded-xl border border-border text-cold-white/70 hover:border-electric-blue hover:text-cold-white transition-colors flex items-center justify-center"
              >
                +
              </button>
            </div>
          </div>

          {/* Add to cart */}
          <div className="mt-8 flex gap-4">
            <Button
              size="lg"
              fullWidth
              onClick={handleAddToCart}
              className={added ? '!bg-green-600 hover:!shadow-none' : ''}
            >
              {added ? '✓ Agregado' : `Agregar al carrito — $${(product.price * quantity).toLocaleString('es-MX')}`}
            </Button>
          </div>

          {/* Stock info */}
          <p className="text-xs text-muted mt-4">
            {product.stock > 0 ? `${product.stock} unidades disponibles` : 'Agotado'}
          </p>
        </div>
      </div>
    </div>
  );
}
