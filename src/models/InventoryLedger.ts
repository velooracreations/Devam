import mongoose from "mongoose";

const InventoryLedgerSchema = new mongoose.Schema({
  product: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Product',
    required: true 
  },
  barcode: { 
    type: String, 
    required: true 
  },
  transactionType: { 
    type: String, 
    enum: ["STOCK_IN", "STOCK_OUT", "SALES_ORDER", "PURCHASE_ORDER", "STOCK_ADJUSTMENT", "STOCK_RETURN"], 
    required: true 
  },
  quantity: { 
    type: Number, 
    required: true 
  }, // Positive for In, Negative for Out
  openingStock: { 
    type: Number, 
    required: true 
  },
  closingStock: { 
    type: Number, 
    required: true 
  },
  remarks: { 
    type: String 
  },
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User'
  }
}, {
  timestamps: true, // Automatically manages Date and Time
});

export default mongoose.models.InventoryLedger || mongoose.model("InventoryLedger", InventoryLedgerSchema);
