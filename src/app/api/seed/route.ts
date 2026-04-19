import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import User from '@/models/User';
import Order from '@/models/Order';
import { hashPassword } from '@/lib/auth';

const SEED_PRODUCTS = [
  {
    name: "Kit Irapuato '67",
    description: "Un clásico de 1967. Jersey retro con diseño deportivo profesional inspirado en la grandeza histórica del fútbol mexicano.",
    price: 449,
    category: "Jerseys",
    images: ["/images/jersey.png"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: [{ name: "Rojo", hex: "#ff3c3c" }],
    stock: 50,
    featured: true,
  },
  {
    name: "Kit DWNC",
    description: "Recuerda ser quien gustes ser. Colaboración exclusiva con DWNC, diseñada para quienes no se conforman.",
    price: 449,
    category: "Colaboraciones",
    images: ["/images/dwnc.png"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: [{ name: "Cyan", hex: "#18C8FF" }],
    stock: 30,
    featured: true,
  },
  {
    name: "Concepto Kit GB",
    description: "Excelencia académica. Diseño conceptual que fusiona el deporte con la disciplina.",
    price: 449,
    category: "Concepto",
    images: ["/images/zgb.png"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: [{ name: "Blanco", hex: "#ffffff" }],
    stock: 25,
    featured: true,
  },
  {
    name: "Zeuer Essentials Negro",
    description: "Lo fundamental. Camiseta esencial de Zeuer en negro profundo para el día a día.",
    price: 349,
    category: "Essentials",
    images: ["/images/ess1.png"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: [
      { name: "Negro", hex: "#000000" },
    ],
    stock: 100,
    featured: true,
  },
  {
    name: "Zeuer Essentials Gris",
    description: "Lo fundamental. Camiseta esencial de Zeuer en gris para uso versátil.",
    price: 349,
    category: "Essentials",
    images: ["/images/ess3.png"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: [
      { name: "Gris", hex: "#777777" },
    ],
    stock: 80,
    featured: true,
  },
  {
    name: "Zeuer Essentials Azul",
    description: "Lo fundamental. Camiseta esencial de Zeuer en azul eléctrico signature.",
    price: 349,
    category: "Essentials",
    images: ["/images/ess5.png"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: [
      { name: "Azul", hex: "#0A6CFF" },
    ],
    stock: 60,
    featured: true,
  },
];

export async function POST(req: NextRequest) {
  try {
    const { secret, action, email, newPassword } = await req.json();
    if (secret !== process.env.JWT_SECRET) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    await dbConnect();

    // Password reset action
    if (action === 'reset-password' && email && newPassword) {
      const user = await User.findOne({ email });
      if (!user) {
        return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
      }
      user.password = await hashPassword(newPassword);
      await user.save();
      return NextResponse.json({ message: 'Contraseña actualizada' });
    }

    // Seed admin user
    const adminExists = await User.findOne({ email: 'admin@zeuer.com' });
    if (!adminExists) {
      await User.create({
        name: 'Admin Zeuer',
        email: 'admin@zeuer.com',
        password: await hashPassword('admin123'),
        role: 'admin',
      });
    }

    // Seed products
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      await Product.insertMany(SEED_PRODUCTS);
    }

    const products = await Product.countDocuments();
    const users = await User.countDocuments();
    const orders = await Order.countDocuments();

    return NextResponse.json({
      message: 'Seed completado',
      stats: { products, users, orders },
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
