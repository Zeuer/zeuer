import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-border bg-deep-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <img src="/svg/logo.svg" alt="Zeuer" className="w-32 mb-4 opacity-80" />
            <p className="text-sm text-muted max-w-sm">
              Zeuer nace desde la disciplina y la superación personal.
              No seguimos tendencias, creamos identidad.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-unbounded text-xs font-semibold uppercase tracking-wider text-cold-white mb-4">Navegación</h4>
            <ul className="space-y-2">
              <li><Link href="/" className="text-sm text-muted hover:text-cold-white transition-colors">Inicio</Link></li>
              <li><Link href="/products" className="text-sm text-muted hover:text-cold-white transition-colors">Colección</Link></li>
              <li><Link href="/cart" className="text-sm text-muted hover:text-cold-white transition-colors">Carrito</Link></li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="font-unbounded text-xs font-semibold uppercase tracking-wider text-cold-white mb-4">Cuenta</h4>
            <ul className="space-y-2">
              <li><Link href="/login" className="text-sm text-muted hover:text-cold-white transition-colors">Iniciar sesión</Link></li>
              <li><Link href="/register" className="text-sm text-muted hover:text-cold-white transition-colors">Crear cuenta</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted">© 2026 Zeuer. Todos los derechos reservados.</p>
          <p className="text-xs text-muted">Técnico. Táctico. Lógico.</p>
        </div>
      </div>
    </footer>
  );
}
