import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  sizes: string[];
  colors: { name: string; hex: string }[];
  colorImages: Record<string, string[]>;
  stock: number;
  featured: boolean;
  moqEnabled: boolean;
  minOrderQty: number;
  createdAt: Date;
}

const ProductSchema = new Schema<IProduct>({
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  category: { type: String, required: true, trim: true },
  images: [{ type: String }],
  sizes: [{ type: String }],
  colors: [{
    name: { type: String },
    hex: { type: String },
  }],
  stock: { type: Number, default: 0, min: 0 },
  colorImages: { type: Map, of: [String], default: {} },
  featured: { type: Boolean, default: false },
  moqEnabled: { type: Boolean, default: false },
  minOrderQty: { type: Number, default: 1, min: 1 },
  createdAt: { type: Date, default: Date.now },
});

ProductSchema.index({ name: 'text', description: 'text' });

export default mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);
