'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

export default function Header() {
  const { itemCount } = useCart();
  const { user, logout, isAdmin } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 w-full z-50 backdrop-blur-md bg-deep-black/80 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <img
              src="/svg/logo-simple.svg"
              alt="Zeuer"
              className="w-10 h-10 sm:w-12 sm:h-12 transition-all duration-300 group-hover:scale-110"
              style={{
                filter: 'drop-shadow(0 0 6px #0A6CFF) drop-shadow(0 0 12px rgba(10,108,255,0.5))',
              }}
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-sm font-medium text-cold-white/70 hover:text-cold-white transition-colors">
              Inicio
            </Link>
            <Link href="/products" className="text-sm font-medium text-cold-white/70 hover:text-cold-white transition-colors">
              Colección
            </Link>
            <Link href="/cart" className="relative text-sm font-medium text-cold-white/70 hover:text-cold-white transition-colors">
              Carrito
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-4 w-5 h-5 bg-electric-blue rounded-full text-[10px] flex items-center justify-center text-white font-bold">
                  {itemCount}
                </span>
              )}
            </Link>
            {isAdmin && (
              <Link href="/admin" className="text-sm font-medium text-cyan-accent hover:text-electric-blue transition-colors">
                Admin
              </Link>
            )}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-4">
            {/* User menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 text-sm text-cold-white/80 hover:text-cold-white transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-electric-blue/20 border border-electric-blue/40 flex items-center justify-center text-xs font-bold text-electric-blue">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:inline">{user.name}</span>
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 top-12 w-48 bg-surface-dark border border-border rounded-xl py-2 shadow-lg shadow-black/50">
                    {isAdmin && (
                      <Link
                        href="/admin"
                        className="block px-4 py-2 text-sm text-cold-white/70 hover:text-cold-white hover:bg-surface-elevated transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        Panel Admin
                      </Link>
                    )}
                    <button
                      onClick={() => { logout(); setUserMenuOpen(false); }}
                      className="w-full text-left px-4 py-2 text-sm text-cold-white/70 hover:text-cold-white hover:bg-surface-elevated transition-colors"
                    >
                      Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="text-sm font-medium text-cold-white/70 hover:text-cold-white transition-colors hidden sm:inline"
              >
                Iniciar sesión
              </Link>
            )}

            {/* Mobile cart icon */}
            <Link href="/cart" className="md:hidden relative p-2">
              <svg className="w-6 h-6 text-cold-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {itemCount > 0 && (
                <span className="absolute top-0 right-0 w-5 h-5 bg-electric-blue rounded-full text-[10px] flex items-center justify-center text-white font-bold">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <div className="w-5 flex flex-col gap-1">
                <span className={`h-0.5 bg-cold-white transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
                <span className={`h-0.5 bg-cold-white transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
                <span className={`h-0.5 bg-cold-white transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-surface-dark border-t border-border animate-fade-in">
          <nav className="flex flex-col px-6 py-4 gap-4">
            <Link href="/" className="text-sm text-cold-white/80 hover:text-cold-white transition-colors" onClick={() => setMenuOpen(false)}>Inicio</Link>
            <Link href="/products" className="text-sm text-cold-white/80 hover:text-cold-white transition-colors" onClick={() => setMenuOpen(false)}>Colección</Link>
            <Link href="/cart" className="text-sm text-cold-white/80 hover:text-cold-white transition-colors" onClick={() => setMenuOpen(false)}>Carrito ({itemCount})</Link>
            {isAdmin && <Link href="/admin" className="text-sm text-cyan-accent" onClick={() => setMenuOpen(false)}>Admin</Link>}
            {!user && <Link href="/login" className="text-sm text-electric-blue" onClick={() => setMenuOpen(false)}>Iniciar sesión</Link>}
            {user && (
              <button onClick={() => { logout(); setMenuOpen(false); }} className="text-left text-sm text-cold-white/60">
                Cerrar sesión
              </button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
