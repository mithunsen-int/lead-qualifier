import connectToDatabase from "@/lib/mongodb";
import LeadModel from "@/models/Lead";
import { Types } from "mongoose";
import { NextRequest, NextResponse } from "next/server";

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

    // Fetch the lead
    const lead = await LeadModel.findById(id);

    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

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
      const externalApiUrl = `${process.env.N8N_WEBHOOK_URL}/webhook-test/reanalysis-lead`;

      const externalApiResponse = await fetch(externalApiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lead,
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

      return NextResponse.json({
        success: true,
        message: "Lead sent for reanalysis successfully",
        data: lead,
      });
    } finally {
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
