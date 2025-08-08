// src/data/salesStore.js
const SALES_KEY = "tlatasch_sales";

// Sale:
// { id, timestamp, cashierPin, payment:'CASH'|'CARD',
//   items:[{id,name,price,qty}], subtotal, discountPercent, discountValue, total }

export function getSales() {
  try { return JSON.parse(localStorage.getItem(SALES_KEY)) ?? []; }
  catch { return []; }
}

export function addSale(sale) {
  const all = getSales();
  const rec = { id: makeId(), ...sale };
  localStorage.setItem(SALES_KEY, JSON.stringify([rec, ...all]));
  return rec;
}

export function clearSales() {
  localStorage.setItem(SALES_KEY, JSON.stringify([]));
}

export function exportSalesToCSV(rows) {
  const header = [
    "id","date","time","cashier","payment","itemsCount",
    "subtotal","discountPercent","discountValue","total"
  ];
  const lines = [header.join(",")];

  for (const s of rows) {
    const d = new Date(s.timestamp);
    const cells = [
      s.id,
      d.toLocaleDateString(),
      d.toLocaleTimeString(),
      s.cashierPin ?? "",
      s.payment ?? "",
      s.items?.reduce((n,i)=>n+(i.qty||0),0) ?? 0,
      (s.subtotal ?? 0).toFixed(2),
      s.discountPercent ? Math.round(s.discountPercent*100) + "%" : "0%",
      (s.discountValue ?? 0).toFixed(2),
      (s.total ?? 0).toFixed(2),
    ];
    lines.push(cells.map(csvEscape).join(","));
  }

  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "sales_export.csv"; a.click();
  URL.revokeObjectURL(url);
}

function csvEscape(v) {
  const s = String(v ?? "");
  return /[",\n]/.test(s) ? `"${s.replaceAll('"','""')}"` : s;
}
function makeId() {
  if (window.crypto?.randomUUID) return crypto.randomUUID();
  return "id_" + Math.random().toString(36).slice(2, 10);
}
