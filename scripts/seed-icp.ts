import connectToDatabase from "@/lib/mongodb";
import ICPCategory from "@/models/ICPCategory";
import ICPData from "@/models/ICPData";
import fs from "fs";
import path from "path";

async function seed() {
  await connectToDatabase();
  const file = path.resolve(process.cwd(), "icp-data.json");
  const raw = fs.readFileSync(file, "utf8");
  const items = JSON.parse(raw);

  for (const it of items) {
    const title = it.icp_category;
    let cat = await ICPCategory.findOne({ title });
    if (!cat)
      cat = await ICPCategory.create({ title, definition: it.icp_category });

    await ICPData.create({
      icp_category: cat._id,
      attribute: it.attribute,
      value: it.value,
      description: it.description,
    });
  }

  console.log("ICP seed complete");
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
