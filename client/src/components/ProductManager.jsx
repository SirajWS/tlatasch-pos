import React, { useMemo, useState } from "react";

const CATS = ["Food", "Drinks", "Menus"];

export default function ProductManager({ products, onAdd, onUpdate, onDelete }) {
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState(null); // product or null
  const [form, setForm] = useState({ name: "", price: "", category: "Food", active: true });

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products
      .filter(p => !q || p.name.toLowerCase().includes(q))
      .sort((a,b)=> a.name.localeCompare(b.name));
  }, [products, query]);

  const startAdd = () => {
    setEditing(null);
    setForm({ name: "", price: "", category: "Food", active: true });
  };

  const startEdit = (p) => {
    setEditing(p);
    setForm({ name: p.name, price: String(p.price), category: p.category, active: !!p.active });
  };

  const submit = (e) => {
    e.preventDefault();
    const priceNum = Number(form.price);
    if (!form.name.trim()) return alert("Name darf nicht leer sein.");
    if (Number.isNaN(priceNum) || priceNum < 0) return alert("Preis ungültig.");
    if (!CATS.includes(form.category)) return alert("Kategorie ungültig.");

    const payload = {
      ...(editing ?? {}),
      name: form.name.trim(),
      price: Math.round(priceNum * 100) / 100,
      category: form.category,
      active: !!form.active,
    };

    if (editing) {
      onUpdate(payload);
    } else {
      onAdd({ ...payload, id: cryptoRandomId() });
    }
    startAdd();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1.2fr,1fr] gap-4">
      {/* Liste */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-3">
        <div className="flex items-center gap-2 mb-3">
          <input
            value={query}
            onChange={(e)=>setQuery(e.target.value)}
            placeholder="Suche nach Produkt…"
            className="w-full bg-transparent border border-white/15 rounded-lg px-3 py-2 outline-none focus:border-emerald-400"
          />
          <button onClick={startAdd}
            className="px-3 py-2 rounded-lg border border-emerald-400/60 hover:bg-emerald-400/10">
            + Neu
          </button>
        </div>

        <div className="max-h-[55vh] overflow-auto space-y-2 pr-1">
          {filtered.length === 0 && <p className="text-sm opacity-70">Keine Produkte gefunden.</p>}
          {filtered.map(p => (
            <div key={p.id || p.name}
              className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/5 p-2">
              <div className="min-w-0">
                <div className="font-medium truncate">
                  {p.name} {p.active === false && <span className="text-xs opacity-60">(inactive)</span>}
                </div>
                <div className="text-xs opacity-70">{p.category} • {p.price.toFixed(2)} TND</div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={()=>startEdit(p)}
                  className="px-3 py-1 text-sm rounded-lg border border-white/15 hover:bg-white/10">
                  Edit
                </button>
                <button onClick={()=>onDelete(p.id ?? p.name)}
                  className="px-3 py-1 text-sm rounded-lg border border-rose-400/40 text-rose-300 hover:bg-rose-500/10">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Formular */}
      <form onSubmit={submit} className="rounded-xl border border-white/10 bg-white/5 p-3 space-y-3">
        <div className="text-lg font-semibold">{editing ? "Produkt bearbeiten" : "Neues Produkt"}</div>

        <label className="block">
          <span className="text-sm opacity-80">Name</span>
          <input
            value={form.name}
            onChange={(e)=>setForm({...form, name: e.target.value})}
            className="mt-1 w-full bg-transparent border border-white/15 rounded-lg px-3 py-2 outline-none focus:border-emerald-400"
            required
          />
        </label>

        <label className="block">
          <span className="text-sm opacity-80">Preis (TND)</span>
          <input
            type="number" step="0.1" min="0"
            value={form.price}
            onChange={(e)=>setForm({...form, price: e.target.value})}
            className="mt-1 w-full bg-transparent border border-white/15 rounded-lg px-3 py-2 outline-none focus:border-emerald-400"
            required
          />
        </label>

        <label className="block">
          <span className="text-sm opacity-80">Kategorie</span>
          <select
            value={form.category}
            onChange={(e)=>setForm({...form, category: e.target.value})}
            className="mt-1 w-full bg-transparent border border-white/15 rounded-lg px-3 py-2 outline-none focus:border-emerald-400"
          >
            {CATS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>

        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.active}
            onChange={(e)=>setForm({...form, active: e.target.checked})}
          />
          <span className="text-sm opacity-80">Aktiv</span>
        </label>

        <div className="flex gap-2 pt-1">
          <button type="submit"
            className="px-4 py-2 rounded-lg border border-emerald-400/60 hover:bg-emerald-400/10">
            {editing ? "Speichern" : "Hinzufügen"}
          </button>
          {editing && (
            <button type="button" onClick={startAdd}
              className="px-4 py-2 rounded-lg border border-white/15 hover:bg-white/10">
              Abbrechen
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

function cryptoRandomId() {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID();
  return "id_" + Math.random().toString(36).slice(2, 10);
}
