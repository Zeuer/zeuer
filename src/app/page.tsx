'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import ProductCard from '@/components/ui/ProductCard';

interface Product {
  _id: string;
  name: string;
  price: number;
  images: string[];
  category: string;
  colors?: { name: string; hex: string }[];
}

const MARQUEE_PHRASES = [
  'EDICIONES LIMITADAS',
  'TÉCNICO. TÁCTICO. LÓGICO.',
  'NUEVA COLECCIÓN',
  'STREETWEAR TÁCTICO',
  'ENVÍO A TODO MÉXICO',
  'DISEÑO FUNCIONAL',
  'RENDIMIENTO Y DISCIPLINA',
  'IDENTIDAD PROPIA',
];

const STATIC_PRODUCTS = [
  { _id: 'static-0', name: "Kit Irapuato '67", price: 449, images: ['/images/jersey.png'], category: 'Jerseys', accentColor: '#c83232' },
  { _id: 'static-1', name: 'Kit DWNC', price: 449, images: ['/images/dwnc.png'], category: 'Colaboraciones', accentColor: '#18C8FF' },
  { _id: 'static-2', name: 'Concepto Kit GB', price: 449, images: ['/images/zgb.png'], category: 'Concepto', accentColor: '#e87830' },
  { _id: 'static-3', name: 'Essentials Negro', price: 349, images: ['/images/ess1.png'], category: 'Essentials', accentColor: '#333333' },
  { _id: 'static-4', name: 'Essentials Gris', price: 349, images: ['/images/ess3.png'], category: 'Essentials', accentColor: '#777777' },
  { _id: 'static-5', name: 'Essentials Azul', price: 349, images: ['/images/ess5.png'], category: 'Essentials', accentColor: '#0A6CFF' },
];

export default function HomePage() {
  const [featured, setFeatured] = useState<Product[]>([]);

  useEffect(() => {
    fetch('/api/products?featured=true&limit=6')
      .then((r) => r.json())
      .then((d) => setFeatured(d.products || []))
      .catch(() => {});
  }, []);

  // Build scroll items — use fetched or static
  const scrollProducts = featured.length > 0
    ? featured.map((p) => ({
        ...p,
        accentColor: p.colors?.[0]?.hex || '#0A6CFF',
      }))
    : STATIC_PRODUCTS;

  // Duplicate for seamless infinite scroll
  const duplicatedProducts = [...scrollProducts, ...scrollProducts, ...scrollProducts];

  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center text-center px-4 overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(10,108,255,0.08)_0%,transparent_70%)]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-electric-blue/5 rounded-full blur-[120px]" />

        <div className="relative z-10">
          {/* Hero Logo */}
          <div className="animate-reveal opacity-0">
            <img
              src="/svg/logo.svg"
              alt="Zeuer"
              className="w-[280px] sm:w-[420px] md:w-[560px] lg:w-[640px] mx-auto animate-glow-pulse"
              style={{
                filter: 'drop-shadow(0 0 10px #0A6CFF) drop-shadow(0 0 30px #0A6CFF) drop-shadow(0 0 60px rgba(10,108,255,0.5)) invert(0.3) sepia(1) saturate(10) hue-rotate(200deg) brightness(1.2)',
              }}
            />
          </div>

          <p className="mt-6 text-lg sm:text-xl text-cold-white/80 font-dm-sans tracking-[0.2em] uppercase opacity-0 animate-reveal [animation-delay:0.3s]">
            Técnico. Táctico. Lógico.
          </p>

          {/* CTA Button — black, all caps, glow outline on hover */}
          <div className="mt-8 opacity-0 animate-reveal [animation-delay:0.6s]">
            <Link href="/products">
              <button className="font-unbounded font-semibold text-sm uppercase tracking-wider px-8 py-4 bg-deep-black text-cold-white border-2 border-electric-blue/50 rounded-lg transition-all duration-400 cursor-pointer hover:border-electric-blue hover:shadow-[0_0_20px_rgba(10,108,255,0.5),0_0_40px_rgba(10,108,255,0.2)] hover:text-white active:scale-[0.97]">
                VER COLECCIÓN
              </button>
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-0 animate-reveal [animation-delay:1s]">
          <div className="w-px h-8 bg-gradient-to-b from-transparent to-cold-white/30" />
          <span className="text-[10px] uppercase tracking-[0.3em] text-cold-white/30">Scroll</span>
        </div>
      </section>

      {/* Infinite Marquee Ticker */}
      <section className="border-y border-border overflow-hidden py-4">
        <div className="flex animate-scroll whitespace-nowrap">
          {[...Array(4)].map((_, setIdx) => (
            <div key={setIdx} className="flex items-center shrink-0">
              {MARQUEE_PHRASES.map((phrase, i) => (
                <span key={`${setIdx}-${i}`} className="flex items-center">
                  <span className="font-unbounded text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] text-electric-blue/70 px-6 sm:px-10">
                    {phrase}
                  </span>
                  <span className="text-electric-blue/30 text-xs">◆</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* Featured Products — Infinite Horizontal Scroll */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-[100vw] overflow-hidden">
        <div className="max-w-7xl mx-auto mb-12">
          <h2 className="font-unbounded text-2xl sm:text-3xl font-bold">COLECCIÓN</h2>
        </div>

        <div className="relative overflow-hidden group/scroll">
          <div className="flex gap-6 animate-scroll [animation-duration:40s] hover:[animation-play-state:paused]">
            {duplicatedProducts.map((p, i) => (
              <div key={i} className="flex-shrink-0 w-[280px] sm:w-[320px]">
                <ProductCard
                  id={p._id}
                  name={p.name}
                  price={p.price}
                  image={p.images[0] || '/images/jersey.png'}
                  category={p.category}
                  accentColor={p.accentColor}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="text-center mt-12">
          <Link href="/products">
            <button className="font-unbounded font-semibold text-xs uppercase tracking-wider px-6 py-3 bg-transparent text-cold-white/70 border border-border rounded-lg transition-all duration-300 cursor-pointer hover:border-electric-blue hover:text-cold-white hover:shadow-[0_0_15px_rgba(10,108,255,0.3)]">
              VER TODO
            </button>
          </Link>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <h2 className="font-unbounded text-2xl sm:text-3xl font-bold text-center mb-12">CATEGORÍAS</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { name: 'Jerseys', desc: 'Diseño deportivo profesional', gradient: 'from-electric-blue/20 to-transparent' },
            { name: 'Essentials', desc: 'Lo fundamental para cada día', gradient: 'from-cyan-accent/20 to-transparent' },
            { name: 'Colaboraciones', desc: 'Ediciones especiales', gradient: 'from-electric-blue/10 to-cyan-accent/10' },
          ].map((cat, i) => (
            <Link
              key={i}
              href={`/products?category=${cat.name}`}
              className="group relative bg-surface-dark border border-border rounded-2xl p-8 overflow-hidden transition-all duration-300 hover:border-electric-blue/40 hover:shadow-[0_0_30px_rgba(10,108,255,0.1)]"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${cat.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              <div className="relative z-10">
                <h3 className="font-unbounded text-lg font-semibold mb-2">{cat.name}</h3>
                <p className="text-sm text-muted">{cat.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Brand Statement */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-unbounded text-2xl sm:text-3xl font-bold mb-6">LA MARCA</h2>
          <p className="text-muted leading-relaxed">
            Zeuer nace desde la disciplina y la superación personal.
            No seguimos tendencias, creamos identidad.
            Cada pieza está diseñada con precisión, pensada para quienes
            entienden que el rendimiento empieza desde lo que vistes.
          </p>
        </div>
      </section>
    </>
  );
}
