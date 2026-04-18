'use client';

import React, { useEffect, useState } from 'react';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/users');
        const data = await res.json();
        setUsers(data.users || []);
      } catch { /* ignore */ }
      setLoading(false);
    }
    load();
  }, []);

  async function toggleRole(id: string, currentRole: string) {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        setUsers(users.map((u) => u._id === id ? { ...u, role: newRole } : u));
      }
    } catch { /* ignore */ }
  }

  return (
    <div>
      <h1 className="font-unbounded text-2xl font-bold mb-8">Usuarios</h1>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => <div key={i} className="bg-surface-dark rounded-xl h-16 animate-pulse" />)}
        </div>
      ) : (
        <div className="bg-surface-dark border border-border rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-4 py-3 text-xs font-unbounded uppercase tracking-wider text-muted">Nombre</th>
                  <th className="text-left px-4 py-3 text-xs font-unbounded uppercase tracking-wider text-muted">Email</th>
                  <th className="text-left px-4 py-3 text-xs font-unbounded uppercase tracking-wider text-muted">Rol</th>
                  <th className="text-left px-4 py-3 text-xs font-unbounded uppercase tracking-wider text-muted">Fecha</th>
                  <th className="text-right px-4 py-3 text-xs font-unbounded uppercase tracking-wider text-muted">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id} className="border-b border-border last:border-0 hover:bg-surface-elevated/50 transition-colors">
                    <td className="px-4 py-3 font-medium">{u.name}</td>
                    <td className="px-4 py-3 text-muted">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-md text-xs font-medium ${u.role === 'admin' ? 'bg-electric-blue/20 text-electric-blue' : 'bg-surface-elevated text-muted'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted text-xs">{new Date(u.createdAt).toLocaleDateString('es-MX')}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => toggleRole(u._id, u.role)}
                        className="px-3 py-1.5 rounded-lg text-xs bg-surface-elevated border border-border hover:border-electric-blue/30 transition-colors"
                      >
                        {u.role === 'admin' ? 'Hacer usuario' : 'Hacer admin'}
                      </button>
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
