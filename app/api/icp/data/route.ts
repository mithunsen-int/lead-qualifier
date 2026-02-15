import connectToDatabase from "@/lib/mongodb";
import ICPCategory from "@/models/ICPCategory";
import ICPData from "@/models/ICPData";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  await connectToDatabase();
  const url = new URL(req.url);
  const category = url.searchParams.get("category");
  const search = url.searchParams.get("search");

  const filter: any = {};
  if (category) filter.icp_category = category;
  if (search)
    filter.$or = [
      { attribute: { $regex: search, $options: "i" } },
      { value: { $regex: search, $options: "i" } },
    ];

  const data = await ICPData.find(filter)
    .populate("icp_category")
    .sort({ attribute: 1 })
    .lean();
  return NextResponse.json({ success: true, data });
}

export async function POST(req: NextRequest) {
  await connectToDatabase();
  const body = await req.json();
  if (!body || !body.icp_category || !body.attribute || !body.value)
    return NextResponse.json(
      { success: false, error: "Missing fields" },
      { status: 400 },
    );
  try {
    // ensure category exists
    const cat = await ICPCategory.findById(body.icp_category);
    if (!cat)
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 400 },
      );
    const created = await ICPData.create({
      icp_category: body.icp_category,
      attribute: body.attribute,
      value: body.value,
      description: body.description,
    });
    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: (err as Error).message },
      { status: 500 },
    );
  }
}
