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

    const query: Record<
      string,
      boolean | { $gte?: number; $lte?: number } | { $gte?: Date; $lte?: Date }
    > = {};

    // Filter by isQualified boolean
    if (isQualified !== null) {
      query.isQualified = isQualified === "true";
    }

    // Filter by score range
    if (scoreMin !== null || scoreMax !== null) {
      query.leadScore = {};
      if (scoreMin !== null) {
        query.leadScore.$gte = parseFloat(scoreMin!);
      }
      if (scoreMax !== null) {
        query.leadScore.$lte = parseFloat(scoreMax!);
      }
    }

    // Filter by date range
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) {
        query.createdAt.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        query.createdAt.$lte = new Date(dateTo);
      }
    }

    const leads = await LeadModel.find(query).sort({ createdAt: -1 }).exec();

    const stats = {
      total: leads.length,
      qualified: leads.filter((l) => l.isQualified === true).length,
      disqualified: leads.filter((l) => l.isQualified === false).length,
      averageScore:
        leads.length > 0
          ? leads.reduce((sum, l) => sum + l.leadScore, 0) / leads.length
          : 0,
    };

    return NextResponse.json({
      success: true,
      leads,
      stats,
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch leads" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const body = await request.json();

    // Validate required fields
    const requiredFields = [
      "budgetScore",
      "authorityScore",
      "needScore",
      "timelineScore",
      "status",
      "leadScore",
      "isQualified",
      "leadInfo",
    ];

    for (const field of requiredFields) {
      if (!(field in body)) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 },
        );
      }
    }

    // Check for duplicate email
    const existingLead = await LeadModel.findOne({
      "leadInfo.leadEmail": body.leadInfo.leadEmail,
    });

    if (existingLead) {
      return NextResponse.json(
        { error: "Lead with this email already exists" },
        { status: 409 },
      );
    }

    // Create new lead
    const newLead = new LeadModel(body);
    const savedLead = await newLead.save();

    return NextResponse.json(
      {
        success: true,
        message: "Lead created successfully",
        data: savedLead,
      },
      { status: 201 },
    );
  } catch (error: unknown) {
    console.error("POST Error:", error);

    if (
      error &&
      typeof error === "object" &&
      "name" in error &&
      error.name === "ValidationError"
    ) {
      const validationError = error as Record<
        string,
        { errors: Record<string, { message: string }> }
      >;
      const messages = Object.values(validationError.errors || {})
        .map((err) => err.message)
        .join(", ");
      return NextResponse.json({ error: messages }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Failed to create lead" },
      { status: 500 },
    );
  }
}
