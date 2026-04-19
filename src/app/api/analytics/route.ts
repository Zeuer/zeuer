import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import PageView from '@/models/PageView';

// POST: track a page view
export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { path, referrer } = await req.json();
    const ua = req.headers.get('user-agent') || '';

    // Detect device type from user agent
    let device: 'mobile' | 'tablet' | 'desktop' = 'desktop';
    if (/tablet|ipad/i.test(ua)) device = 'tablet';
    else if (/mobile|android|iphone/i.test(ua)) device = 'mobile';

    // Try to get country from headers (Vercel adds this)
    const country = req.headers.get('x-vercel-ip-country') || '';

    await PageView.create({ path, referrer, userAgent: ua, device, country });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
