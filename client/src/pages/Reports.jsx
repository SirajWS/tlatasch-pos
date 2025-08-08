// src/pages/Reports.jsx
import React, { useMemo, useState } from "react";
import { getSales, exportSalesToCSV } from "../data/salesStore";

function startOfDay(d){ const x=new Date(d); x.setHours(0,0,0,0); return x; }
function endOfDay(d){ const x=new Date(d); x.setHours(23,59,59,999); return x; }
function addDays(d,n){ const x=new Date(d); x.setDate(x.getDate()+n); return x; }

export default function Reports() {
  const [range, setRange] = useState("day");   // 'day' | 'week' | 'month'
  const [anchor, setAnchor] = useState(() => new Date());
  const [payment, setPayment] = useState("ALL"); // ALL|CASH|CARD

  const sales = getSales();

  const { from, to } = useMemo(() => {
    const a = new Date(anchor);
    if (range === "day") {
      return { from: startOfDay(a), to: endOfDay(a) };
    } else if (range === "week") {
      // Montag–Sonntag
      const day = a.getDay(); // 0=So
      const monday = addDays(startOfDay(a), -((day+6)%7));
      return { from: monday, to: endOfDay(addDays(monday, 6)) };
    } else {
      const first = new Date(a.getFullYear(), a.getMonth(), 1);
      const last  = new Date(a.getFullYear(), a.getMonth()+1, 0);
      return { from: startOfDay(first), to: endOfDay(last) };
    }
  }, [range, anchor]);

  const filtered = useMemo(() => {
    return sales.filter(s => {
      const t = new Date(s.timestamp).getTime();
      const okDate = t >= from.getTime() && t <= to.getTime();
      const okPay  = payment === "ALL" ? true : s.payment === payment;
      return okDate && okPay;
    });
  }, [sales, from, to, payment]);

  const totals = useMemo(() => {
    const count   = filtered.length;
    const items   = filtered.reduce((n,s)=> n + (s.items?.reduce((m,i)=>m+(i.qty||0),0)??0), 0);
    const revenue = filtered.reduce((sum,s)=> sum + (s.total||0), 0);
    const avg     = count ? revenue / count : 0;
    return { count, items, revenue, avg };
  }, [filtered]);

  return (
    <div className="h-screen w-screen overflow-hidden bg-neutral-950 text-gray-100">
      <div className="h-full p-4">
        <section className="h-full rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-4 shadow-xl flex flex-col">
          
          {/* Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded-xl overflow-hidden border border-white/12">
              {["day","week","month"].map(r => (
                <button key={r} onClick={()=>setRange(r)}
                  className={`px-3 py-1 text-sm border-r border-white/10 last:border-r-0 ${
                    range===r ? "bg-emerald-400/15" : "hover:bg-white/10"}`}>
                  {r.toUpperCase()}
                </button>
              ))}
            </div>

            <input
              type="date"
              value={formatDateInput(anchor)}
              onChange={(e)=> setAnchor(new Date(e.target.value))}
              className="px-3 py-1 rounded-xl border border-white/15 bg-transparent"
            />

            <div className="flex rounded-xl overflow-hidden border border-white/12 ml-auto">
              {["ALL","CASH","CARD"].map(p => (
                <button key={p} onClick={()=>setPayment(p)}
                  className={`px-3 py-1 text-sm border-r border-white/10 last:border-r-0 ${
                    payment===p ? "bg-white/10" : "hover:bg-white/10"}`}>
                  {p}
                </button>
              ))}
            </div>

            <button
              onClick={()=>exportSalesToCSV(filtered)}
              className="px-3 py-1 rounded-xl border border-white/15 hover:bg-white/10"
            >
              Export CSV
            </button>
          </div>

          <div className="my-3 h-px bg-white/10" />

          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Kpi title="Sales" value={totals.count} />
            <Kpi title="Items" value={totals.items} />
            <Kpi title="Revenue (TND)" value={totals.revenue.toFixed(2)} />
            <Kpi title="Avg / Sale (TND)" value={totals.avg.toFixed(2)} />
          </div>

          <div className="my-3 h-px bg-white/10" />

          {/* Table */}
          <div className="flex-1 overflow-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-white/5 backdrop-blur">
                <tr className="[&>th]:text-left [&>th]:py-2 [&>th]:px-2">
                  <th>Date</th>
                  <th>Time</th>
                  <th>Cashier</th>
                  <th>Payment</th>
                  <th>Items</th>
                  <th>Subtotal</th>
                  <th>Discount</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody className="[&>tr]:border-b [&>tr]:border-white/10">
                {filtered.map(s => {
                  const d = new Date(s.timestamp);
                  const itemCount = s.items?.reduce((n,i)=>n+(i.qty||0),0) ?? 0;
                  return (
                    <tr key={s.id} className="[&>td]:py-2 [&>td]:px-2">
                      <td>{d.toLocaleDateString()}</td>
                      <td>{d.toLocaleTimeString()}</td>
                      <td>{s.cashierPin ?? ""}</td>
                      <td>{s.payment}</td>
                      <td>{itemCount}</td>
                      <td>{(s.subtotal ?? 0).toFixed(2)}</td>
                      <td>{s.discountPercent ? Math.round(s.discountPercent*100)+"%" : "0%"} ({(s.discountValue ?? 0).toFixed(2)})</td>
                      <td className="font-semibold">{(s.total ?? 0).toFixed(2)}</td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr><td colSpan={8} className="py-6 text-center opacity-70">Keine Daten im Zeitraum.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}

function Kpi({ title, value }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
      <div className="text-xs opacity-70">{title}</div>
      <div className="text-xl font-semibold">{value}</div>
    </div>
  );
}

function formatDateInput(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth()+1).padStart(2,"0");
  const da = String(d.getDate()).padStart(2,"0");
  return `${y}-${m}-${da}`;
}
