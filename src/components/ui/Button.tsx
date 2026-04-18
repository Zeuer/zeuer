import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  children: React.ReactNode;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  children,
  className = '',
  ...props
}: ButtonProps) {
  const base = 'font-unbounded font-semibold rounded-lg transition-all duration-300 inline-flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-electric-blue text-white hover:shadow-[0_0_20px_rgba(10,108,255,0.6)] active:scale-[0.97]',
    outline: 'border-2 border-cyan-accent text-cold-white relative overflow-hidden hover:shadow-[0_0_15px_rgba(24,200,255,0.3)] after:absolute after:inset-0 after:w-0 after:bg-gradient-to-r after:from-electric-blue after:to-cyan-accent after:transition-all after:duration-400 hover:after:w-full after:z-0 [&>*]:relative [&>*]:z-10',
    ghost: 'text-cold-white/70 hover:text-cold-white hover:bg-cold-white/5',
  };

  const sizes = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-4 text-base',
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      <span>{children}</span>
    </button>
  );
}
