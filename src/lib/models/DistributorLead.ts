import mongoose, { Schema, Document } from 'mongoose';

export interface IDistributorLead extends Document {
  firstName: string;
  lastName: string;
  businessName: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  productsOfInterest: string;
  message?: string;
  createdAt: Date;
}

const DistributorLeadSchema: Schema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  businessName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  productsOfInterest: { type: String, required: true },
  message: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.DistributorLead || mongoose.model<IDistributorLead>('DistributorLead', DistributorLeadSchema);
