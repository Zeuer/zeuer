import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';
import Product from '@/models/Product';
import User from '@/models/User';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    await dbConnect();

    // Get all orders
    const orders = await Order.find().sort({ createdAt: -1 });
    const products = await Product.find();
    const userCount = await User.countDocuments();

    // Revenue calculations
    const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
    const completedOrders = orders.filter(o => ['confirmed', 'shipped', 'delivered'].includes(o.status));
    const confirmedRevenue = completedOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

    // Orders by status
    const ordersByStatus: Record<string, number> = {};
    for (const o of orders) {
      ordersByStatus[o.status] = (ordersByStatus[o.status] || 0) + 1;
    }

    // Orders over last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentOrders = orders.filter(o => new Date(o.createdAt) >= thirtyDaysAgo);

    // Daily revenue for chart (last 30 days)
    const dailyRevenue: { date: string; revenue: number; count: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayOrders = recentOrders.filter(o => {
        const od = new Date(o.createdAt).toISOString().split('T')[0];
        return od === dateStr;
      });
      dailyRevenue.push({
        date: dateStr,
        revenue: dayOrders.reduce((s, o) => s + (o.total || 0), 0),
        count: dayOrders.length,
      });
    }

    // Top selling products
    const productSales: Record<string, { name: string; qty: number; revenue: number }> = {};
    for (const o of orders) {
      for (const item of o.items) {
        const key = item.productId || item.name;
        if (!productSales[key]) {
          productSales[key] = { name: item.name, qty: 0, revenue: 0 };
        }
        productSales[key].qty += item.quantity;
        productSales[key].revenue += item.price * item.quantity;
      }
    }
    const topProducts = Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Low stock alerts
    const lowStock = products
      .filter(p => p.stock <= 10)
      .map(p => ({ name: p.name, stock: p.stock, _id: p._id }))
      .sort((a, b) => a.stock - b.stock);

    // Orders today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const ordersToday = orders.filter(o => new Date(o.createdAt) >= today).length;

    return NextResponse.json({
      totalRevenue,
      confirmedRevenue,
      avgOrderValue,
      totalOrders: orders.length,
      ordersToday,
      ordersByStatus,
      dailyRevenue,
      topProducts,
      lowStock,
      totalProducts: products.length,
      totalUsers: userCount,
    });
  } catch {
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
