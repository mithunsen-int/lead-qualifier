import connectToDatabase from "@/lib/mongodb";
import LeadModel from "@/models/Lead";
import { Types } from "mongoose";
import { NextRequest, NextResponse } from "next/server";

// In-memory cache to prevent duplicate reanalysis calls
const reanalysisInProgress = new Map<string, boolean>();
const REANALYSIS_TIMEOUT = 5000; // 5 seconds

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectToDatabase();

    const { id } = await params;

    // Validate MongoDB ObjectId format
    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid lead ID format" },
        { status: 400 },
      );
    }

    // Prevent duplicate reanalysis calls
    if (reanalysisInProgress.get(id)) {
      return NextResponse.json(
        { error: "Reanalysis already in progress for this lead" },
        { status: 409 },
      );
    }

    // Fetch the lead
    const lead = await LeadModel.findById(id);

    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    // Mark as in progress
    reanalysisInProgress.set(id, true);

    try {
      // Log the reanalysis request
      console.log(`[Reanalysis] Starting reanalysis for lead ${id}`);
      console.log(`[Reanalysis] Lead info:`, {
        name: lead.leadInfo.leadName,
        company: lead.leadInfo.companyName,
        email: lead.leadInfo.leadEmail,
      });

      // Call external API for reanalysis
      // You can configure the external API endpoint via environment variables
      const externalApiUrl =
        process.env.LEAD_REANALYSIS_API_URL ||
        "https://api.example.com/reanalyse";

      const externalApiResponse = await fetch(externalApiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.LEAD_REANALYSIS_API_KEY || ""}`,
        },
        body: JSON.stringify({
          leadId: id,
          leadInfo: lead.leadInfo,
          leadScore: lead.leadScore,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!externalApiResponse.ok) {
        const errorText = await externalApiResponse.text();
        console.error(
          `[Reanalysis] External API error: ${externalApiResponse.status}`,
          errorText,
        );
        // Continue even if external API fails - update local reanalysisCount
      }

      // Extract response data if available
      let externalAnalysisData = null;
      if (externalApiResponse.ok) {
        try {
          externalAnalysisData = await externalApiResponse.json();
          console.log(
            `[Reanalysis] External API response:`,
            externalAnalysisData,
          );
        } catch {
          console.warn("[Reanalysis] Failed to parse external API response");
        }
      }

      // Increment reanalysisCount
      lead.reanalysisCount = (lead.reanalysisCount || 0) + 1;

      // Optionally update lead data with external API results
      // This depends on what the external API returns
      if (externalAnalysisData && typeof externalAnalysisData === "object") {
        const analysisData = externalAnalysisData as Record<string, unknown>;
        if (analysisData.budgetScore)
          lead.budgetScore = analysisData.budgetScore;
        if (analysisData.authorityScore)
          lead.authorityScore = analysisData.authorityScore;
        if (analysisData.needScore) lead.needScore = analysisData.needScore;
        if (analysisData.timelineScore)
          lead.timelineScore = analysisData.timelineScore;
        if (analysisData.leadScore) lead.leadScore = analysisData.leadScore;
        if (analysisData.isQualified !== undefined)
          lead.isQualified = analysisData.isQualified;
        if (analysisData.status) lead.status = analysisData.status;
        if (analysisData.overallAssessment)
          lead.overallAssessment = analysisData.overallAssessment;
        if (analysisData.qualificationReason)
          lead.qualificationReason = analysisData.qualificationReason;
        if (analysisData.disQualificationReason)
          lead.disQualificationReason = analysisData.disQualificationReason;
      }

      // Save the updated lead
      const updatedLead = await lead.save();

      console.log(
        `[Reanalysis] Reanalysis completed for lead ${id}. New reanalysisCount: ${updatedLead.reanalysisCount}`,
      );

      return NextResponse.json({
        success: true,
        message: "Lead reanalysed successfully",
        data: updatedLead,
        reanalysisCount: updatedLead.reanalysisCount,
      });
    } finally {
      // Clear the in-progress flag after a timeout
      setTimeout(() => {
        reanalysisInProgress.delete(id);
      }, REANALYSIS_TIMEOUT);
    }
  } catch (error) {
    console.error("[Reanalysis] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to reanalyse lead",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
