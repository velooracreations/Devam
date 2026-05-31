import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  stock: { type: Number, required: true, default: 0 },
  sku: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  ingredients: { type: String },
  nutritionalInfo: { type: String },
  disclaimer: { type: String },
  moreInfo: { type: String },
  images: [{ type: String }],
  features: [{ type: String }],
  badge: { type: String },
  rating: { type: Number, default: 0 },
  reviews: { type: Number, default: 0 }
}, {
  timestamps: true,
});

export default mongoose.models.Product || mongoose.model("Product", ProductSchema);
