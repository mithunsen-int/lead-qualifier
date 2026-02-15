(async () => {
  const base = "http://localhost:3000";
  const uniq = Date.now();
  try {
    const catRes = await fetch(base + "/api/icp/categories", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title: "__testcat" + uniq, definition: "temp" }),
    });
    console.log("cat create status", catRes.status);
    const catBody = await catRes.json().catch(() => null);
    console.log("cat body", catBody);
    const catId = catBody?.data?._id;
    if (!catId) {
      console.log("no catId, abort");
      return;
    }

    const dataRes = await fetch(base + "/api/icp/data", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        icp_category: catId,
        attribute: "test-attr",
        value: "test-val",
        description: "desc",
      }),
    });
    console.log("data create status", dataRes.status);
    const dataBody = await dataRes.json().catch(() => null);
    console.log("data body", dataBody);
    const dataId = dataBody?.data?._id;
    if (!dataId) {
      console.log("no dataId, abort");
      return;
    }

    const patchRes = await fetch(base + "/api/icp/data/" + dataId, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ value: "patched-val", attribute: "patched-attr" }),
    });
    console.log("patch status", patchRes.status);
    const patchBody = await patchRes.json().catch(() => null);
    console.log("patch body", patchBody);
  } catch (err) {
    console.error(err);
  }
})();
