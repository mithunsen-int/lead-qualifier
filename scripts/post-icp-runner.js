#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const BASE = process.env.BASE_URL || "http://localhost:3000";

async function fetchJson(url, options) {
  const res = await fetch(url, options);
  const txt = await res.text();
  try {
    return JSON.parse(txt);
  } catch {
    return txt;
  }
}

async function main() {
  const file = path.resolve(process.cwd(), "icp-data.json");
  if (!fs.existsSync(file)) {
    console.error("icp-data.json not found in project root");
    process.exit(1);
  }

  const raw = fs.readFileSync(file, "utf8");
  const items = JSON.parse(raw);

  // Fetch existing categories
  const catsRes = await fetchJson(`${BASE}/api/icp/categories`);
  const existing = Array.isArray(catsRes?.data) ? catsRes.data : [];
  const map = new Map(existing.map((c) => [c.title, c._id || c.id || c._id]));

  for (const it of items) {
    const title = it.icp_category;
    let catId = map.get(title);
    if (!catId) {
      console.log("Creating category:", title);
      const created = await fetchJson(`${BASE}/api/icp/categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, definition: it.icp_category }),
      });
      if (created && created.data && (created.data._id || created.data.id)) {
        catId = created.data._id || created.data.id;
        map.set(title, catId);
      } else {
        console.error("Failed to create category:", title, created);
        process.exit(1);
      }
    }

    // Post ICP data
    console.log("Posting ICP data:", it.attribute);
    const posted = await fetchJson(`${BASE}/api/icp/data`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        icp_category: catId,
        attribute: it.attribute,
        value: it.value,
        description: it.description,
      }),
    });
    if (!posted || !posted.success) {
      console.error("Failed to post ICP data:", it.attribute, posted);
    }
  }

  console.log("Done");
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
