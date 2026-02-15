import connectToDatabase from "@/lib/mongodb";
import ICPCategory from "@/models/ICPCategory";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  await connectToDatabase();
  const categories = await ICPCategory.find().sort({ title: 1 }).lean();
  return NextResponse.json({ success: true, data: categories });
}

export async function POST(req: NextRequest) {
  await connectToDatabase();
  const body = await req.json();
  if (!body || !body.title)
    return NextResponse.json(
      { success: false, error: "Missing title" },
      { status: 400 },
    );
  try {
    const created = await ICPCategory.create({
      title: body.title,
      definition: body.definition,
    });
    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: (err as Error).message },
      { status: 500 },
    );
  }
}
