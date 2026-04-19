import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    await dbConnect();

    const query = user.role === 'admin' ? {} : { userId: user.userId };
    const orders = await Order.find(query).sort({ createdAt: -1 });
    return NextResponse.json({ orders });
  } catch {
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();

    await dbConnect();
    const body = await req.json();

    if (!body.items || body.items.length === 0) {
      return NextResponse.json({ error: 'El carrito está vacío' }, { status: 400 });
    }

    // Guest orders require at least a phone number
    if (!user && !body.guestPhone) {
      return NextResponse.json({ error: 'Se requiere un número de teléfono para pedidos sin cuenta' }, { status: 400 });
    }

    const order = await Order.create({
      userId: user?.userId || undefined,
      guestEmail: body.guestEmail || undefined,
      guestPhone: body.guestPhone || undefined,
      items: body.items,
      total: body.total,
      paymentMethod: body.paymentMethod || 'paypal',
      paymentId: body.paymentId || '',
      shippingAddress: body.shippingAddress || {},
    });

    return NextResponse.json(order, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
