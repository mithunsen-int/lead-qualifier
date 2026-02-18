import connectToDatabase from "@/lib/mongodb";
import ICPData from "@/models/ICPData";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, context: any) {
  await connectToDatabase();
  const params = await context?.params;
  const id = params?.id;
  const item = await ICPData.findById(id).populate("icp_category").lean();
  if (!item)
    return NextResponse.json(
      { success: false, error: "Not found" },
      { status: 404 },
    );
  return NextResponse.json({ success: true, data: item });
}

export async function PATCH(req: NextRequest, context: any) {
  await connectToDatabase();
  const body = await req.json();
  try {
    const params = await context?.params;
    const id = params?.id;
    const updated = await ICPData.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true },
    ).lean();
    if (!updated)
      return NextResponse.json(
        { success: false, error: "Not found" },
        { status: 404 },
      );
    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: (err as Error).message },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest, context: any) {
  await connectToDatabase();
  try {
    const params = await context?.params;
    const id = params?.id;
    const deleted = await ICPData.findByIdAndDelete(id).lean();
    if (!deleted)
      return NextResponse.json(
        { success: false, error: "Not found" },
        { status: 404 },
      );
    return NextResponse.json({ success: true, data: deleted });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: (err as Error).message },
      { status: 500 },
    );
  }
}
