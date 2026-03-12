import connectToDatabase from "@/lib/mongodb";
import ICPData from "@/models/ICPData";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  await connectToDatabase();
  const body = await req.json();
  if (!body || !body.id || !body.event)
    return NextResponse.json(
      { success: false, error: "Missing required parameters!" },
      { status: 400 },
    );
  try {
    const icpData = await ICPData.findById(body.id)
      .populate("icp_category")
      .lean();

    if (!icpData) {
      return NextResponse.json(
        { success: false, error: "Not found" },
        { status: 404 },
      );
    }

    // Call external API for syncing to VDB
    const externalApiUrl = `${process.env.N8N_WEBHOOK_URL}/webhook/icp-sync`;

    const externalApiResponse = await fetch(externalApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        event: body.event,
        data: icpData,
      }),
    });

    if (!externalApiResponse.ok) {
      const errorText = await externalApiResponse.text();
      console.error(
        `[ICP Sync] External API error: ${externalApiResponse.status}`,
        errorText,
      );
      return NextResponse.json(
        { success: false, error: "Failed to sync to VDB" },
        { status: 500 },
      );
    }

    // Extract response data if available
    let icpSyncResponse = null;
    if (externalApiResponse.ok) {
      try {
        icpSyncResponse = await externalApiResponse.json();
        console.log(`[ICP Sync] External API response:`, icpSyncResponse);
      } catch {
        console.warn("[ICP Sync] Failed to parse external API response");
      }
    }

    return NextResponse.json(
      { success: true, data: icpSyncResponse },
      { status: 201 },
    );
  } catch (err) {
    return NextResponse.json(
      { success: false, error: (err as Error).message },
      { status: 500 },
    );
  }
}
