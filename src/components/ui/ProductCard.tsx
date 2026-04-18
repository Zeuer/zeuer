import Link from 'next/link';

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  image: string;
  category?: string;
  accentColor?: string;
}

export default function ProductCard({ id, name, price, image, category, accentColor }: ProductCardProps) {
  const bgColor = accentColor || '#0A6CFF';

  return (
    <Link href={`/products/${id}`} className="group block">
      <div className="relative bg-surface-dark rounded-2xl overflow-hidden border border-border transition-all duration-500 hover:border-electric-blue/40 hover:shadow-[0_0_30px_rgba(10,108,255,0.15)]">
        {/* Image container with hover effect */}
        <div className="relative aspect-square overflow-hidden bg-surface-elevated">
          {/* Colored backdrop that appears on hover */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[65%] h-[65%] rounded-3xl opacity-0 group-hover:opacity-60 transition-all duration-700 ease-out scale-75 group-hover:scale-100 blur-sm"
            style={{ backgroundColor: bgColor }}
          />

          {/* Product image with zoom on hover */}
          <img
            src={image}
            alt={name}
            className="relative z-10 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
            loading="lazy"
          />
        </div>

        {/* Info */}
        <div className="p-4">
          {category && (
            <span className="text-[10px] uppercase tracking-widest text-electric-blue font-medium">{category}</span>
          )}
          <h3 className="font-unbounded text-sm font-semibold text-cold-white mt-1 truncate">{name}</h3>
          <p className="text-sm text-muted mt-1">${price.toLocaleString('es-MX')} MXN</p>
        </div>
      </div>
    </Link>
  );
}
