import connectToDatabase from "@/lib/mongodb";
import ICPData from "@/models/ICPData";
import { NextRequest, NextResponse } from "next/server";

interface ExportedICP {
  icp_category: string;
  attribute: string;
  value: string;
  description: string;
  definition: string;
}

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

  // Transform to export format
  const exported: ExportedICP[] = data.map((item: any) => ({
    icp_category:
      typeof item.icp_category === "string"
        ? item.icp_category
        : item.icp_category?.title || "Unknown",
    attribute: item.attribute,
    value: item.value,
    description: item.description || "",
    definition: item.icp_category?.definition || "",
  }));

  return NextResponse.json({ success: true, data: exported });
}
