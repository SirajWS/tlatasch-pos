// src/components/CategoryTabs.jsx (Skizze)
export default function CategoryTabs({ active, onChange }) {
  const cats = ["Food", "Drinks", "Menus", "Functions"];
  return (
    <div className="flex flex-wrap gap-2">
      {cats.map((c) => (
        <button
          key={c}
          onClick={() => onChange(c)}
          className={`px-4 py-2 rounded-xl border ${
            active === c
              ? "border-emerald-500"
              : "border-gray-600 hover:bg-neutral-800"
          }`}
        >
          {c}
        </button>
      ))}
    </div>
  );
}
