import mongoose, { Document, Schema } from "mongoose";

export interface IICPCategory extends Document {
  title: string;
  definition?: string;
}

const ICPCategorySchema = new Schema<IICPCategory>(
  {
    title: { type: String, required: true, unique: true, index: true },
    definition: { type: String },
  },
  { timestamps: true },
);

const ICPCategory =
  mongoose.models.ICPCategory ||
  mongoose.model<IICPCategory>("ICPCategory", ICPCategorySchema);

export default ICPCategory;
