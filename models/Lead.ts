import mongoose, { Document, Schema } from "mongoose";

export interface ILeadData {
  success_criteria?: string[];
  lead_type?: string;
  primary_need?: string;
  proposed_solution?: string;
}

export interface ILeadInfo {
  leadName: string;
  leadPhone?: string;
  leadEmail: string;
  companyName: string;
  jobTitle: string;
  companyWebsite?: string;
  leadIndustry?: string;
  coSize: string;
  techTeamSize: string;
  revenue?: string | number;
  location?: string;
  businessModel?: string;
  monthlyBudget?: string;
  techStack?: string[];
  opportunity_type?: string;
  timeline?: string;
  leadData?: ILeadData;
  receiverEmail?: string;
  receiverName?: string;
}

export interface ILead extends Document {
  budgetScore: number;
  budgetEvidence?: string;
  authorityScore: number;
  authorityEvidence?: string;
  needScore: number;
  needEvidence?: string;
  timelineScore: number;
  timelineEvidence?: string;
  overallAssessment?: string;
  qualificationReason?: string;
  disQualificationReason?: string;
  recommendedAction?: string;
  finalStatus: string;
  status: "Qualified" | "Disqualified" | "Low Priority Lead" | "pending";
  leadScore: number;
  isQualified: boolean;
  leadInfo: ILeadInfo;
  createdAt: Date;
  updatedAt: Date;
}

const leadDataSchema = new Schema<ILeadData>(
  {
    success_criteria: [String],
    lead_type: String,
    primary_need: String,
    proposed_solution: String,
  },
  { _id: false },
);

const leadInfoSchema = new Schema<ILeadInfo>(
  {
    leadName: { type: String, required: true },
    leadPhone: String,
    leadEmail: { type: String, required: true, lowercase: true },
    companyName: { type: String, required: true },
    jobTitle: String,
    companyWebsite: String,
    leadIndustry: String,
    coSize: String,
    techTeamSize: String,
    revenue: mongoose.Schema.Types.Mixed,
    location: String,
    businessModel: String,
    monthlyBudget: String,
    techStack: [String],
    opportunity_type: String,
    timeline: String,
    leadData: leadDataSchema,
    receiverEmail: String,
    receiverName: String,
  },
  { _id: false },
);

const leadSchema = new Schema<ILead>(
  {
    budgetScore: {
      type: Number,
      required: true,
      min: 0,
      max: 10,
      index: true,
    },
    budgetEvidence: String,
    authorityScore: {
      type: Number,
      required: true,
      min: 0,
      max: 10,
      index: true,
    },
    authorityEvidence: String,
    needScore: {
      type: Number,
      required: true,
      min: 0,
      max: 10,
      index: true,
    },
    needEvidence: String,
    timelineScore: {
      type: Number,
      required: true,
      min: 0,
      max: 10,
      index: true,
    },
    timelineEvidence: String,
    overallAssessment: String,
    qualificationReason: String,
    disQualificationReason: String,
    recommendedAction: String,
    finalStatus: {
      type: String,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["Qualified", "Disqualified", "Low Priority Lead", "pending"],
      required: true,
      default: "pending",
      index: true,
    },
    leadScore: {
      type: Number,
      required: true,
      min: 0,
      max: 10,
      index: true,
    },
    isQualified: {
      type: Boolean,
      required: true,
      default: false,
      index: true,
    },
    leadInfo: {
      type: leadInfoSchema,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// Compound index for common filtering queries
leadSchema.index({ status: 1, createdAt: -1 });
leadSchema.index({ leadScore: -1, createdAt: -1 });
leadSchema.index({ "leadInfo.leadEmail": 1 }, { unique: true });

// Prevent model recompilation in Next.js dev mode
const Lead = mongoose.models.Lead || mongoose.model<ILead>("Lead", leadSchema);

export default Lead;
