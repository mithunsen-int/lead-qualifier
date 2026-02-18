import connectToDatabase from "@/lib/mongodb";
import LeadModel from "@/models/Lead";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    // Extract query parameters for filtering
    const searchParams = request.nextUrl.searchParams;
    const isQualified = searchParams.get("isQualified");
    const scoreMin = searchParams.get("scoreMin");
    const scoreMax = searchParams.get("scoreMax");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const status = searchParams.get("status");
    const limit = searchParams.get("limit");
    const offset = searchParams.get("offset");

    const query: Record<
      string,
      | boolean
      | { $gte?: number; $lte?: number }
      | { $gte?: Date; $lte?: Date }
      | string
    > = {};

    // Filter by isQualified boolean
    if (isQualified !== null) {
      query.isQualified = isQualified === "true";
    }

    // Filter by score range
    if (scoreMin !== null || scoreMax !== null) {
      query.leadScore = {};
      if (scoreMin !== null) {
        (query.leadScore as Record<string, number>).$gte = parseFloat(
          scoreMin!,
        );
      }
      if (scoreMax !== null) {
        (query.leadScore as Record<string, number>).$lte = parseFloat(
          scoreMax!,
        );
      }
    }

    // Filter by date range
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) {
        (query.createdAt as Record<string, Date>).$gte = new Date(dateFrom);
      }
      if (dateTo) {
        (query.createdAt as Record<string, Date>).$lte = new Date(dateTo);
      }
    }

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Fetch leads with pagination
    const skip = offset ? parseInt(offset) : 0;
    const take = limit ? parseInt(limit) : 1000; // Default limit of 1000

    const leads = await LeadModel.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(take)
      .exec();

    // Format response to match the exact structure of output.json
    const formattedData = leads.map((lead) => ({
      budgetScore: lead.budgetScore,
      budgetEvidence: lead.budgetEvidence || "",
      authorityScore: lead.authorityScore,
      authorityEvidence: lead.authorityEvidence || "",
      needScore: lead.needScore,
      needEvidence: lead.needEvidence || "",
      timelineScore: lead.timelineScore,
      timelineEvidence: lead.timelineEvidence || "",
      overallAssessment: lead.overallAssessment || "",
      qualificationReason: lead.qualificationReason || "",
      disQualificationReason: lead.disQualificationReason || "",
      recommendedAction: lead.recommendedAction || "",
      finalStatus: lead.finalStatus,
      status: lead.status,
      leadScore: lead.leadScore,
      isQualified: lead.isQualified,
      leadInfo: {
        leadName: lead.leadInfo.leadName,
        leadPhone: lead.leadInfo.leadPhone || "",
        companyName: lead.leadInfo.companyName,
        jobTitle: lead.leadInfo.jobTitle || "",
        leadEmail: lead.leadInfo.leadEmail,
        companyWebsite: lead.leadInfo.companyWebsite || "",
        leadIndustry: lead.leadInfo.leadIndustry || "",
        coSize: lead.leadInfo.coSize,
        techTeamSize: lead.leadInfo.techTeamSize,
        revenue: lead.leadInfo.revenue || "",
        location: lead.leadInfo.location || "",
        businessModel: lead.leadInfo.businessModel || "",
        monthlyBudget: lead.leadInfo.monthlyBudget || "",
        techStack: lead.leadInfo.techStack || [],
        opportunity_type: lead.leadInfo.opportunity_type || "",
        timeline: lead.leadInfo.timeline || "",
        leadData: lead.leadInfo.leadData || {
          success_criteria: [],
          lead_type: "",
          primary_need: "",
          proposed_solution: "",
        },
        receiverEmail: lead.leadInfo.receiverEmail || "",
        receiverName: lead.leadInfo.receiverName || "",
      },
    }));

    return NextResponse.json({
      ok: true,
      data: formattedData,
    });
  } catch (error) {
    console.error("Export API Error:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to export leads" },
      { status: 500 },
    );
  }
}
