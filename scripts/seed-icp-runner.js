#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

const MONGODB_URI = process.env.MONGODB_URI || "";
if (!MONGODB_URI) {
  console.error(
    "Please set MONGODB_URI environment variable before running this script",
  );
  process.exit(1);
}

async function run() {
  await mongoose.connect(MONGODB_URI, { bufferCommands: false });
  const db = mongoose.connection.db;

  const file = path.resolve(process.cwd(), "icp-data.json");
  if (!fs.existsSync(file)) {
    console.error("icp-data.json not found in project root");
    process.exit(1);
  }

  const raw = fs.readFileSync(file, "utf8");
  const items = JSON.parse(raw);

  const categoriesColl = db.collection("icpcategories");
  const dataColl = db.collection("icpdatas");

  for (const it of items) {
    const title = it.icp_category;
    let cat = await categoriesColl.findOne({ title });
    if (!cat) {
      const now = new Date();
      const res = await categoriesColl.insertOne({
        title,
        definition: it.icp_category,
        createdAt: now,
        updatedAt: now,
      });
      cat = { _id: res.insertedId, title };
      console.log("Created category", title);
    }

    const doc = {
      icp_category: cat._id,
      attribute: it.attribute,
      value: it.value,
      description: it.description,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await dataColl.insertOne(doc);
    console.log("Inserted ICP data:", it.attribute);
  }

  console.log("ICP seed complete");
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
