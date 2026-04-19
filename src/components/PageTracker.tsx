'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

export default function PageTracker() {
  const pathname = usePathname();
  const lastTracked = useRef('');

  useEffect(() => {
    // Don't track admin pages or API routes
    if (pathname.startsWith('/admin') || pathname.startsWith('/api')) return;
    // Don't double-track the same page
    if (lastTracked.current === pathname) return;
    lastTracked.current = pathname;

    // Fire and forget — don't block the page
    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path: pathname,
        referrer: typeof document !== 'undefined' ? document.referrer : '',
      }),
    }).catch(() => {}); // silently fail
  }, [pathname]);

  return null; // renders nothing
}
