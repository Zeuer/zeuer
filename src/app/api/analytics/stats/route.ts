import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import PageView from '@/models/PageView';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    await dbConnect();

    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Total views
    const totalViews = await PageView.countDocuments();
    const viewsToday = await PageView.countDocuments({ createdAt: { $gte: today } });
    const viewsThisWeek = await PageView.countDocuments({ createdAt: { $gte: sevenDaysAgo } });
    const viewsThisMonth = await PageView.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });

    // Daily views for last 30 days (chart data)
    const allViews = await PageView.find({ createdAt: { $gte: thirtyDaysAgo } })
      .select('path device country createdAt')
      .lean();

    const dailyViews: { date: string; views: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const count = allViews.filter(v => {
        const vd = new Date(v.createdAt).toISOString().split('T')[0];
        return vd === dateStr;
      }).length;
      dailyViews.push({ date: dateStr, views: count });
    }

    // Popular pages
    const pathCounts: Record<string, number> = {};
    for (const v of allViews) {
      pathCounts[v.path] = (pathCounts[v.path] || 0) + 1;
    }
    const popularPages = Object.entries(pathCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([path, views]) => ({ path, views }));

    // Device breakdown
    const deviceCounts: Record<string, number> = { mobile: 0, tablet: 0, desktop: 0 };
    for (const v of allViews) {
      deviceCounts[v.device] = (deviceCounts[v.device] || 0) + 1;
    }

    // Country breakdown
    const countryCounts: Record<string, number> = {};
    for (const v of allViews) {
      const c = v.country || 'Desconocido';
      countryCounts[c] = (countryCounts[c] || 0) + 1;
    }
    const topCountries = Object.entries(countryCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([country, views]) => ({ country, views }));

    // Hourly breakdown (last 7 days) for activity heatmap
    const hourCounts = new Array(24).fill(0);
    const weekViews = allViews.filter(v => new Date(v.createdAt) >= sevenDaysAgo);
    for (const v of weekViews) {
      const h = new Date(v.createdAt).getHours();
      hourCounts[h]++;
    }

    // Trend: compare this week vs last week
    const prevWeekStart = new Date(sevenDaysAgo);
    prevWeekStart.setDate(prevWeekStart.getDate() - 7);
    const viewsPrevWeek = await PageView.countDocuments({
      createdAt: { $gte: prevWeekStart, $lt: sevenDaysAgo },
    });
    const weekTrend = viewsPrevWeek > 0
      ? ((viewsThisWeek - viewsPrevWeek) / viewsPrevWeek * 100).toFixed(1)
      : viewsThisWeek > 0 ? '+100' : '0';

    return NextResponse.json({
      totalViews,
      viewsToday,
      viewsThisWeek,
      viewsThisMonth,
      weekTrend: parseFloat(weekTrend as string),
      dailyViews,
      popularPages,
      deviceBreakdown: deviceCounts,
      topCountries,
      hourlyActivity: hourCounts,
    });
  } catch {
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
