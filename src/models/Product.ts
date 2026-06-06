import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
  // Core Info
  name: { type: String, required: true },
  category: { type: String, required: true }, // e.g., "01", "02"
  weight: { type: String }, // e.g., "1kg", "500g"
  
  // Barcode & SKU System
  sku: { type: String, required: true, unique: true }, // e.g., "001"
  barcode: { type: String, required: true, unique: true }, // Auto-generated AAA BB CCC DD EEE C
  
  // Pricing
  mrp: { type: Number, required: true, default: 0 },
  costPrice: { type: Number, required: true, default: 0 },
  sellingPrice: { type: Number, required: true, default: 0 },
  taxPercentage: { type: Number, required: true, default: 0 }, // GST
  
  // Inventory Tracking
  stockQuantity: { type: Number, required: true, default: 0 }, // Available Stock
  reservedStock: { type: Number, required: true, default: 0 }, // In cart / pending order
  minimumStock: { type: Number, required: true, default: 10 },
  openingStock: { type: Number, default: 0 },
  
  // Manufacturing / Traceability
  batchNumber: { type: String },
  manufacturingDate: { type: Date },
  expiryDate: { type: Date },
  
  // Meta Details
  status: { type: String, enum: ["ACTIVE", "INACTIVE", "OUT_OF_STOCK"], default: "ACTIVE" },
  images: [{ type: String }],
  description: { type: String, required: true },
  ingredients: { type: String },
  nutritionalInfo: { type: String },
  disclaimer: { type: String },
  moreInfo: { type: String },
  features: [{ type: String }],
  badge: { type: String },
  rating: { type: Number, default: 0 },
  reviews: { type: Number, default: 0 },

  // Audit
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, {
  timestamps: true,
});

export default mongoose.models.Product || mongoose.model("Product", ProductSchema);
