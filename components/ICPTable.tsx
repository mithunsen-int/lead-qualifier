"use client";
import React, { useEffect, useMemo, useState } from "react";

interface ICPCategory {
  _id: string;
  title: string;
  definition?: string;
}

interface ICPData {
  _id: string;
  icp_category: ICPCategory | string;
  attribute: string;
  value: string;
  description?: string;
}

export default function ICPTable() {
  const [categories, setCategories] = useState<ICPCategory[]>([]);
  const [data, setData] = useState<ICPData[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [search, setSearch] = useState<string>("");

  const [newCategoryTitle, setNewCategoryTitle] = useState("");
  const [newCategoryDefinition, setNewCategoryDefinition] = useState("");
  const [newData, setNewData] = useState({
    icp_category: "",
    attribute: "",
    value: "",
    description: "",
  });
  const [editingDataId, setEditingDataId] = useState<string | null>(null);
  const [editingDataValues, setEditingDataValues] = useState<any>(null);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(
    null,
  );
  const [editingCategoryTitle, setEditingCategoryTitle] = useState<string>("");
  const [editingCategoryDefinition, setEditingCategoryDefinition] =
    useState<string>("");
  
  // Bulk operations
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [bulkEditValues, setBulkEditValues] = useState({
    icp_category: "",
    description: "",
  });

  useEffect(() => {
    fetch("/api/icp/categories")
      .then((res) => res.json())
      .then((r) => setCategories(r.data || []))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    const params: any = {};
    if (categoryFilter) params.category = categoryFilter;
    if (search) params.search = search;
    const qs = new URLSearchParams(params).toString();
    fetch("/api/icp/data" + (qs ? `?${qs}` : ""))
      .then((res) => res.json())
      .then((r) => setData(r.data || []))
      .catch(() => setData([]));
  }, [categoryFilter, search]);

  // Helpers
  const refreshCategories = async () => {
    const r = await fetch("/api/icp/categories");
    const body = await r.json();
    setCategories(body.data || []);
  };

  const refreshData = async () => {
    const params: any = {};
    if (categoryFilter) params.category = categoryFilter;
    if (search) params.search = search;
    const qs = new URLSearchParams(params).toString();
    const r = await fetch("/api/icp/data" + (qs ? `?${qs}` : ""));
    const body = await r.json();
    setData(body.data || []);
  };

  // Category CRUD
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryTitle) return;
    await fetch("/api/icp/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: newCategoryTitle,
        definition: newCategoryDefinition,
      }),
    });
    setNewCategoryTitle("");
    setNewCategoryDefinition("");
    await refreshCategories();
  };

  const startEditCategory = (c: ICPCategory) => {
    setEditingCategoryId(c._id);
    setEditingCategoryTitle(c.title);
    setEditingCategoryDefinition(c.definition || "");
  };

  const saveEditCategory = async (id: string) => {
    await fetch(`/api/icp/categories/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: editingCategoryTitle,
        definition: editingCategoryDefinition,
      }),
    });
    setEditingCategoryId(null);
    await refreshCategories();
    await refreshData();
  };

  const deleteCategory = async (id: string) => {
    if (!confirm("Delete category and its data?")) return;
    await fetch(`/api/icp/categories/${id}`, { method: "DELETE" });
    await refreshCategories();
    await refreshData();
  };

  // ICP data CRUD
  const handleCreateData = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newData.icp_category || !newData.attribute) return;
    await fetch("/api/icp/data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newData),
    });
    setNewData({ icp_category: "", attribute: "", value: "", description: "" });
    await refreshData();
  };

  const startEditData = (row: ICPData) => {
    setEditingDataId(row._id);
    setEditingDataValues({
      attribute: row.attribute,
      value: row.value,
      description: row.description || "",
      icp_category:
        typeof row.icp_category === "string"
          ? row.icp_category
          : (row.icp_category as any)._id,
    });
  };

  const saveEditData = async (id: string) => {
    await fetch(`/api/icp/data/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editingDataValues),
    });
    setEditingDataId(null);
    setEditingDataValues(null);
    await refreshData();
  };

  const deleteData = async (id: string) => {
    if (!confirm("Delete this ICP data item?")) return;
    await fetch(`/api/icp/data/${id}`, { method: "DELETE" });
    await refreshData();
  };

  // Bulk operations
  const toggleRowSelection = (id: string) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRows(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedRows.size === rows.length && rows.length > 0) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(rows.map((r) => r._id)));
    }
  };

  const bulkDelete = async () => {
    if (selectedRows.size === 0) return;
    if (
      !confirm(
        `Delete ${selectedRows.size} selected item(s)? This cannot be undone.`,
      )
    )
      return;

    for (const id of selectedRows) {
      await fetch(`/api/icp/data/${id}`, { method: "DELETE" });
    }
    setSelectedRows(new Set());
    await refreshData();
  };

  const bulkUpdateCategory = async () => {
    if (selectedRows.size === 0 || !bulkEditValues.icp_category) return;
    for (const id of selectedRows) {
      const rowData = rows.find((r) => r._id === id);
      if (rowData) {
        await fetch(`/api/icp/data/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            icp_category: bulkEditValues.icp_category,
            attribute: rowData.attribute,
            value: rowData.value,
            description: rowData.description,
          }),
        });
      }
    }
    setSelectedRows(new Set());
    setBulkEditValues({ icp_category: "", description: "" });
    await refreshData();
  };

  const bulkUpdateDescription = async () => {
    if (selectedRows.size === 0) return;
    for (const id of selectedRows) {
      const rowData = rows.find((r) => r._id === id);
      if (rowData) {
        await fetch(`/api/icp/data/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            icp_category:
              typeof rowData.icp_category === "string"
                ? rowData.icp_category
                : (rowData.icp_category as any)._id,
            attribute: rowData.attribute,
            value: rowData.value,
            description: bulkEditValues.description,
          }),
        });
      }
    }
    setSelectedRows(new Set());
    setBulkEditValues({ icp_category: "", description: "" });
    await refreshData();
  };

  const rows = useMemo(() => data, [data]);

  return (
    <div>
      <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-3 border rounded">
          <h4 className="font-semibold mb-2">Create Category</h4>
          <form onSubmit={handleCreateCategory} className="flex flex-col gap-2">
            <input
              className="border p-2"
              placeholder="Title"
              value={newCategoryTitle}
              onChange={(e) => setNewCategoryTitle(e.target.value)}
            />
            <input
              className="border p-2"
              placeholder="Definition"
              value={newCategoryDefinition}
              onChange={(e) => setNewCategoryDefinition(e.target.value)}
            />
            <button
              className="px-3 py-2 bg-blue-600 text-white rounded"
              type="submit"
            >
              Create
            </button>
          </form>

          <div className="mt-4">
            <h5 className="font-medium mb-2">Categories</h5>
            <ul className="space-y-2">
              {categories.map((c) => (
                <li
                  key={c._id}
                  className="flex items-start justify-between gap-3"
                >
                  <div className="flex-1">
                    {editingCategoryId === c._id ? (
                      <div className="flex gap-2">
                        <input
                          className="border p-1"
                          value={editingCategoryTitle}
                          onChange={(e) =>
                            setEditingCategoryTitle(e.target.value)
                          }
                        />
                        <input
                          className="border p-1"
                          value={editingCategoryDefinition}
                          onChange={(e) =>
                            setEditingCategoryDefinition(e.target.value)
                          }
                        />
                      </div>
                    ) : (
                      <div>
                        <div className="font-semibold">{c.title}</div>
                        <div className="text-sm text-slate-600">
                          {c.definition}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {editingCategoryId === c._id ? (
                      <>
                        <button
                          className="px-2 py-1 bg-green-600 text-white rounded"
                          onClick={() => saveEditCategory(c._id)}
                        >
                          Save
                        </button>
                        <button
                          className="px-2 py-1 bg-gray-300 rounded"
                          onClick={() => setEditingCategoryId(null)}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className="px-2 py-1 bg-blue-500 text-white rounded"
                          onClick={() => startEditCategory(c)}
                        >
                          Edit
                        </button>
                        <button
                          className="px-2 py-1 bg-red-500 text-white rounded"
                          onClick={() => deleteCategory(c._id)}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="p-3 border rounded">
          <h4 className="font-semibold mb-2">Create ICP Data</h4>
          <form onSubmit={handleCreateData} className="flex flex-col gap-2">
            <select
              className="border p-2"
              value={newData.icp_category}
              onChange={(e) =>
                setNewData({ ...newData, icp_category: e.target.value })
              }
            >
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.title}
                </option>
              ))}
            </select>
            <input
              className="border p-2"
              placeholder="Attribute"
              value={newData.attribute}
              onChange={(e) =>
                setNewData({ ...newData, attribute: e.target.value })
              }
            />
            <input
              className="border p-2"
              placeholder="Value"
              value={newData.value}
              onChange={(e) =>
                setNewData({ ...newData, value: e.target.value })
              }
            />
            <input
              className="border p-2"
              placeholder="Description"
              value={newData.description}
              onChange={(e) =>
                setNewData({ ...newData, description: e.target.value })
              }
            />
            <button
              className="px-3 py-2 bg-green-600 text-white rounded"
              type="submit"
            >
              Create ICP Data
            </button>
          </form>
        </div>
      </div>

      <div className="flex gap-3 mb-4">
        <select
          className="border rounded p-2"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.title}
            </option>
          ))}
        </select>
        <input
          className="border rounded p-2 flex-1"
          placeholder="Search attribute or value"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {selectedRows.size > 0 && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="font-semibold">
              {selectedRows.size} item(s) selected
            </div>
            <div className="flex gap-2 flex-wrap">
              <select
                className="border p-2 rounded"
                value={bulkEditValues.icp_category}
                onChange={(e) =>
                  setBulkEditValues({
                    ...bulkEditValues,
                    icp_category: e.target.value,
                  })
                }
              >
                <option value="">Select category to bulk update</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.title}
                  </option>
                ))}
              </select>
              <button
                className="px-3 py-2 bg-blue-600 text-white rounded"
                onClick={bulkUpdateCategory}
                disabled={!bulkEditValues.icp_category}
              >
                Update Category
              </button>
              <input
                className="border p-2 rounded flex-1 min-w-[200px]"
                placeholder="Bulk update description"
                value={bulkEditValues.description}
                onChange={(e) =>
                  setBulkEditValues({
                    ...bulkEditValues,
                    description: e.target.value,
                  })
                }
              />
              <button
                className="px-3 py-2 bg-purple-600 text-white rounded"
                onClick={bulkUpdateDescription}
              >
                Update Description
              </button>
              <button
                className="px-3 py-2 bg-red-600 text-white rounded"
                onClick={bulkDelete}
              >
                Delete Selected
              </button>
              <button
                className="px-3 py-2 bg-gray-400 text-white rounded"
                onClick={() => {
                  setSelectedRows(new Set());
                  setBulkEditValues({ icp_category: "", description: "" });
                }}
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="overflow-auto border rounded">
        <table className="min-w-full text-left">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-2 w-10">
                <input
                  type="checkbox"
                  checked={
                    selectedRows.size === rows.length && rows.length > 0
                  }
                  onChange={toggleSelectAll}
                  className="w-4 h-4"
                />
              </th>
              <th className="px-4 py-2">Category</th>
              <th className="px-4 py-2">Attribute</th>
              <th className="px-4 py-2">Value</th>
              <th className="px-4 py-2">Description</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr
                key={r._id}
                className={`border-t ${selectedRows.has(r._id) ? "bg-blue-100" : ""}`}
              >
                <td className="px-4 py-2">
                  <input
                    type="checkbox"
                    checked={selectedRows.has(r._id)}
                    onChange={() => toggleRowSelection(r._id)}
                    className="w-4 h-4"
                  />
                </td>
                <td className="px-4 py-2">
                  {typeof r.icp_category === "string"
                    ? r.icp_category
                    : r.icp_category?.title || "N/A"}
                </td>
                <td className="px-4 py-2">
                  {editingDataId === r._id ? (
                    <input
                      className="border p-1 w-full"
                      value={editingDataValues?.attribute || ""}
                      onChange={(e) =>
                        setEditingDataValues({
                          ...editingDataValues,
                          attribute: e.target.value,
                        })
                      }
                    />
                  ) : (
                    r.attribute
                  )}
                </td>
                <td className="px-4 py-2">
                  {editingDataId === r._id ? (
                    <input
                      className="border p-1 w-full"
                      value={editingDataValues?.value || ""}
                      onChange={(e) =>
                        setEditingDataValues({
                          ...editingDataValues,
                          value: e.target.value,
                        })
                      }
                    />
                  ) : (
                    r.value
                  )}
                </td>
                <td className="px-4 py-2">
                  {editingDataId === r._id ? (
                    <input
                      className="border p-1 w-full"
                      value={editingDataValues?.description || ""}
                      onChange={(e) =>
                        setEditingDataValues({
                          ...editingDataValues,
                          description: e.target.value,
                        })
                      }
                    />
                  ) : (
                    r.description || ""
                  )}
                </td>
                <td className="px-4 py-2">
                  {editingDataId === r._id ? (
                    <div className="flex gap-2">
                      <button
                        className="px-2 py-1 bg-green-600 text-white rounded"
                        onClick={() => saveEditData(r._id)}
                      >
                        Save
                      </button>
                      <button
                        className="px-2 py-1 bg-gray-300 rounded"
                        onClick={() => {
                          setEditingDataId(null);
                          setEditingDataValues(null);
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        className="px-2 py-1 bg-blue-500 text-white rounded"
                        onClick={() => startEditData(r)}
                      >
                        Edit
                      </button>
                      <button
                        className="px-2 py-1 bg-red-500 text-white rounded"
                        onClick={() => deleteData(r._id)}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
