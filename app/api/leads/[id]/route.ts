import connectToDatabase from "@/lib/mongodb";
import LeadModel from "@/models/Lead";
import { Types } from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
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

    const lead = await LeadModel.findById(id);

    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: lead,
    });
  } catch (error) {
    console.error("GET [id] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch lead" },
      { status: 500 },
    );
  }
}

export async function PATCH(
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

    const body = await request.json();

    const updatedLead = await LeadModel.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!updatedLead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Lead updated successfully",
      data: updatedLead,
    });
  } catch (error: unknown) {
    console.error("PATCH [id] Error:", error);

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
      { error: "Failed to update lead" },
      { status: 500 },
    );
  }
}

export async function DELETE(
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

    const deletedLead = await LeadModel.findByIdAndDelete(id);

    if (!deletedLead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Lead deleted successfully",
    });
  } catch (error) {
    console.error("DELETE [id] Error:", error);
    return NextResponse.json(
      { error: "Failed to delete lead" },
      { status: 500 },
    );
  }
}
