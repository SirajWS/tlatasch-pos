// src/components/ProductManager.jsx
import React, { useMemo, useState, useEffect } from "react";

const STORAGE_CATEGORIES = "tlatasch_categories";

// id helper
const newId = () => "p" + Date.now();

export default function ProductManager({
  products = [],
  categories = [],
  onCategoriesChange, // (updatedList) => void
  onAdd,
  onUpdate,
  onDelete,
}) {
  // eigene Kopie für datalist/select
  const [cats, setCats] = useState(categories);

  useEffect(() => setCats(categories), [categories]);

  // --- Add new category (oben) ---
  const [newCat, setNewCat] = useState("");

  const addCategory = () => {
    const name = (newCat || "").trim();
    if (!name) return;
    // dupes case-insensitive vermeiden
    const exists = cats.some((c) => c.toLowerCase() === name.toLowerCase());
    if (exists) {
      alert("Category already exists.");
      return;
    }
    const updated = [...cats, name];
    setCats(updated);
    // persist + parent informieren
    try {
      localStorage.setItem(STORAGE_CATEGORIES, JSON.stringify(updated));
    } catch {}
    onCategoriesChange?.(updated);
    setNewCat("");
  };

  // --- Suche ---
  const [query, setQuery] = useState("");

  // --- Formular ---
  const [form, setForm] = useState({
    id: "",
    name: "",
    price: "",
    category: cats[0] || "Food",
    active: true,
  });

  useEffect(() => {
    if (!form.category && cats.length) {
      setForm((f) => ({ ...f, category: cats[0] }));
    }
  }, [cats]); // eslint-disable-line

  const isEdit = Boolean(form.id);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        String(p.price).toLowerCase().includes(q) ||
        (p.category || "").toLowerCase().includes(q)
    );
  }, [products, query]);

  const handleChange = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const clearForm = () =>
    setForm({ id: "", name: "", price: "", category: cats[0] || "Food", active: true });

  const handleSubmit = (e) => {
    e?.preventDefault?.();
    const priceNum = Number(form.price);
    if (!form.name.trim()) return alert("Name required.");
    if (Number.isNaN(priceNum) || priceNum < 0) return alert("Price must be >= 0.");
    if (!form.category?.trim()) return alert("Category required.");

    const payload = {
      id: form.id || newId(),
      name: form.name.trim(),
      price: priceNum,
      category: form.category.trim(),
      active: !!form.active,
    };

    if (isEdit) onUpdate?.(payload);
    else onAdd?.(payload);

    clearForm();
  };

  const handleEdit = (p) => {
    setForm({
      id: p.id,
      name: p.name,
      price: String(p.price),
      category: p.category || cats[0] || "Food",
      active: p.active !== false,
    });
    requestAnimationFrame(() => {
      document.getElementById("pm-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Add Category */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="mb-2 font-semibold">Add new category</div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Category name"
            value={newCat}
            onChange={(e) => setNewCat(e.target.value)}
            className="flex-1 px-3 py-2 rounded-lg border border-white/15 bg-transparent"
          />
          <button
            onClick={addCategory}
            className="px-3 py-2 rounded-xl border border-emerald-400/40 text-emerald-300 hover:bg-emerald-500/10"
          >
            Add
          </button>
        </div>
        {!!cats.length && (
          <div className="mt-2 text-xs opacity-70">
            Existing: {cats.join(" • ")}
          </div>
        )}
      </div>

      {/* Product Form */}
      <form id="pm-form" onSubmit={handleSubmit} className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="font-semibold">{isEdit ? "Edit product" : "New product"}</div>
          {isEdit && (
            <button
              type="button"
              onClick={clearForm}
              className="px-3 py-1 rounded-xl border border-white/15 hover:bg-white/10 text-sm"
            >
              Cancel
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 items-center">
          <input
            type="text"
            placeholder="Name"
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
            className="sm:col-span-2 px-3 py-2 rounded-lg border border-white/15 bg-transparent"
          />
          <input
            type="number"
            placeholder="Price (TND)"
            min="0"
            step="0.01"
            value={form.price}
            onChange={(e) => handleChange("price", e.target.value)}
            className="px-3 py-2 rounded-lg border border-white/15 bg-transparent"
          />
          <select
            value={form.category}
            onChange={(e) => handleChange("category", e.target.value)}
            className="px-3 py-2 rounded-lg border border-white/15 bg-transparent"
          >
            {cats.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => handleChange("active", e.target.checked)}
            />
            Active
          </label>
        </div>

        <div className="mt-3">
          <button
            type="submit"
            className="px-3 py-2 rounded-xl border border-emerald-400/40 text-emerald-300 hover:bg-emerald-500/10"
          >
            {isEdit ? "Save changes" : "Add"}
          </button>
        </div>
      </form>

      {/* Search */}
      <input
        type="text"
        placeholder="Suche nach Produkt..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full px-3 py-2 rounded-lg border border-white/15 bg-transparent"
      />

      {/* Product List */}
      <div className="max-h-[60vh] overflow-auto pr-1">
        {filtered.map((p) => (
          <div
            key={p.id}
            className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 p-3 mb-2"
          >
            <div className="min-w-0">
              <div className="font-medium truncate">{p.name}</div>
              <div className="text-xs opacity-70">
                {p.category} • {Number(p.price).toFixed(2)} TND {p.active === false ? "• inactive" : ""}
              </div>
            </div>

            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => handleEdit(p)}
                className="px-3 py-1 rounded-lg border border-white/15 hover:bg-white/10"
              >
                Edit
              </button>
              <button
                onClick={() => {
                  if (confirm(`Delete "${p.name}"?`)) onDelete?.(p.id);
                }}
                className="px-3 py-1 rounded-lg border border-rose-400/40 text-rose-300 hover:bg-rose-500/10"
              >
                Delete
              </button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="py-6 text-center opacity-70 text-sm">Keine Produkte gefunden.</div>
        )}
      </div>
    </div>
  );
}



