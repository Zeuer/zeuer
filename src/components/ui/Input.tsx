import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-medium text-cold-white/70 mb-1.5 tracking-wide">{label}</label>
      )}
      <input
        className={`w-full bg-surface-dark border border-border rounded-lg px-4 py-3 text-sm text-cold-white placeholder-muted/50 focus:outline-none focus:border-electric-blue focus:shadow-[0_0_10px_rgba(10,108,255,0.2)] transition-all duration-200 ${error ? 'border-red-500' : ''} ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </div>
  );
}
