import mongoose, { Schema, Document } from 'mongoose';

export interface IPageView extends Document {
  path: string;
  referrer: string;
  userAgent: string;
  country: string;
  device: 'mobile' | 'tablet' | 'desktop';
  createdAt: Date;
}

const PageViewSchema = new Schema<IPageView>({
  path: { type: String, required: true },
  referrer: { type: String, default: '' },
  userAgent: { type: String, default: '' },
  country: { type: String, default: '' },
  device: { type: String, enum: ['mobile', 'tablet', 'desktop'], default: 'desktop' },
  createdAt: { type: Date, default: Date.now },
});

PageViewSchema.index({ createdAt: -1 });
PageViewSchema.index({ path: 1 });

export default mongoose.models.PageView || mongoose.model<IPageView>('PageView', PageViewSchema);
