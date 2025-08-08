// src/components/Cart.jsx
import React from "react";

export default function Cart({
  items,
  onIncrement,
  onDecrement,
  onRemove,
  discountPercent = 0,          // 0..0.25 etc.
  onSetDiscountPercent,          // (0 | 0.10 | 0.25)
}) {
  const subtotal = items.reduce((s, it) => s + it.price * it.qty, 0);
  const discountValue = subtotal * discountPercent;
  const total = Math.max(0, subtotal - discountValue);

  return (
    <aside className="w-full lg:w-96 xl:w-[28rem] 
                      border border-gray-700/70 rounded-2xl 
                      bg-neutral-900/60 backdrop-blur p-4 
                      shadow-lg sticky bottom-4 right-4">
      <h2 className="text-xl font-semibold mb-3">Cart</h2>

      {/* Items */}
      <div className="space-y-2 max-h-72 overflow-auto pr-1">
        {items.length === 0 && (
          <p className="text-sm text-gray-400">Cart is empty.</p>
        )}
        {items.map((it) => (
          <div
            key={it.id}
            className="flex items-center justify-between 
                       bg-neutral-800/60 border border-gray-700 
                       rounded-xl px-3 py-2"
          >
            <div className="min-w-0">
              <p className="font-medium truncate">{it.name}</p>
              <p className="text-xs text-gray-400">
                {it.price.toFixed(2)} TND
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onDecrement(it.id)}
                className="px-2 py-1 rounded-lg border border-gray-600 hover:bg-neutral-700"
                aria-label="decrement"
              >
                –
              </button>
              <span className="w-8 text-center select-none">{it.qty}</span>
              <button
                onClick={() => onIncrement(it.id)}
                className="px-2 py-1 rounded-lg border border-gray-600 hover:bg-neutral-700"
                aria-label="increment"
              >
                +
              </button>

              <button
                onClick={() => onRemove(it.id)}
                className="ml-2 text-xs px-2 py-1 rounded-lg border border-red-600 text-red-300 hover:bg-red-900/30"
              >
                Remove
              </button>

              <div className="w-20 text-right font-semibold">
                {(it.price * it.qty).toFixed(2)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Discount */}
      <div className="mt-4 border-t border-gray-700 pt-3">
        <p className="text-sm mb-2">Discount</p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onSetDiscountPercent(0.10)}
            className={`px-3 py-1 rounded-lg border ${
              discountPercent === 0.10
                ? "border-emerald-500"
                : "border-gray-600 hover:bg-neutral-700"
            }`}
          >
            10%
          </button>
          <button
            onClick={() => onSetDiscountPercent(0.25)}
            className={`px-3 py-1 rounded-lg border ${
              discountPercent === 0.25
                ? "border-emerald-500"
                : "border-gray-600 hover:bg-neutral-700"
            }`}
          >
            25%
          </button>
          <button
            onClick={() => onSetDiscountPercent(0)}
            className="ml-auto text-xs px-2 py-1 rounded-lg border border-gray-600 hover:bg-neutral-700"
            title="Reset discount"
          >
            Reset
          </button>
        </div>

        {/* Summary */}
        <div className="mt-3 space-y-1 text-sm">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>{subtotal.toFixed(2)} TND</span>
          </div>
          <div className="flex justify-between">
            <span>Discount{discountPercent ? ` (${Math.round(discountPercent*100)}%)` : ""}:</span>
            <span>-{discountValue.toFixed(2)} TND</span>
          </div>
          <div className="flex justify-between text-base font-semibold border-t border-gray-700 pt-2">
            <span>Total:</span>
            <span>{total.toFixed(2)} TND</span>
          </div>
        </div>

        {/* Pay buttons */}
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button className="py-2 rounded-xl border border-gray-600 hover:bg-neutral-700">
            CASH
          </button>
          <button className="py-2 rounded-xl border border-gray-600 hover:bg-neutral-700">
            CARD
          </button>
        </div>
      </div>
    </aside>
  );
}
