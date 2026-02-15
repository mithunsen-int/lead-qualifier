import mongoose, { Document, Schema } from "mongoose";
import { IICPCategory } from "./ICPCategory";

export interface IICPData extends Document {
  icp_category: mongoose.Types.ObjectId | IICPCategory | string;
  attribute: string;
  value: string;
  description?: string;
}

const ICPDataSchema = new Schema<IICPData>(
  {
    icp_category: {
      type: Schema.Types.ObjectId,
      ref: "ICPCategory",
      required: true,
      index: true,
    },
    attribute: { type: String, required: true, index: true },
    value: { type: String, required: true },
    description: { type: String },
  },
  { timestamps: true },
);

const ICPData =
  mongoose.models.ICPData || mongoose.model<IICPData>("ICPData", ICPDataSchema);

export default ICPData;
