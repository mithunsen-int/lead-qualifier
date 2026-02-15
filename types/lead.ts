export type Status =
  | "Qualified"
  | "Disqualified"
  | "Low Priority Lead"
  | "pending";

export interface LeadData {
  success_criteria?: string[];
  lead_type?: string;
  primary_need?: string;
  proposed_solution?: string;
}

export interface LeadInfo {
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
  leadData?: LeadData;
  receiverEmail?: string;
  receiverName?: string;
}

export interface Lead {
  _id?: string;
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
  status: Status;
  leadScore: number;
  isQualified: boolean;
  leadInfo: LeadInfo;
  createdAt?: string; // ISO format date
  updatedAt?: string; // ISO format date
}

export interface LeadsResponse {
  success: boolean;
  leads: Lead[];
  stats?: {
    total: number;
    qualified: number;
    disqualified: number;
    lowPriority: number;
    averageScore: number;
  };
}

export interface AnalyticsData {
  totalLeads: number;
  qualifiedLeads: number;
  disqualifiedLeads: number;
  lowPriorityLeads: number;
  qualificationRate: number;
  averageScore: number;
  leadsByIndustry: Record<string, number>;
  leadsByStatusOverTime: Array<{
    date: string;
    qualified: number;
    disqualified: number;
    lowPriority: number;
  }>;
  topIndustries: Array<{ industry: string; count: number }>;
  scoreDistribution: Array<{ range: string; count: number }>;
}

export interface FilterOptions {
  status?: Status | "all";
  scoreMin?: number;
  scoreMax?: number;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}
