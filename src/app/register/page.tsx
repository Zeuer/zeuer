'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    setLoading(true);
    const result = await register(name, email, password);
    if (result.success) {
      router.push('/');
    } else {
      setError(result.error || 'Error al registrarse');
    }
    setLoading(false);
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-surface-dark border border-border rounded-2xl p-8">
          <h1 className="font-unbounded text-2xl font-bold text-center mb-2">Crear Cuenta</h1>
          <p className="text-sm text-muted text-center mb-8">Únete a Zeuer</p>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3 mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Nombre"
              type="text"
              placeholder="Tu nombre"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              label="Email"
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Contraseña"
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
            <Button type="submit" fullWidth disabled={loading}>
              {loading ? 'Creando...' : 'Crear cuenta'}
            </Button>
          </form>

          <p className="text-sm text-muted text-center mt-6">
            ¿Ya tienes cuenta?{' '}
            <Link href="/login" className="text-electric-blue hover:text-cyan-accent transition-colors">
              Ingresar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
