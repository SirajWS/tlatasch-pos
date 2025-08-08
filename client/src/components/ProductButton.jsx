// src/components/ProductButton.jsx
import React from "react";

export default function ProductButton({ product, onClick }) {
  return (
    <button
      onClick={onClick}
      className="h-20 sm:h-24 text-left
                 rounded-2xl border border-gray-700 
                 bg-neutral-800/60 hover:bg-neutral-700 
                 p-3 shadow transition"
    >
      <div className="font-semibold leading-tight">{product.name}</div>
      <div className="text-sm opacity-80 mt-1">{product.price.toFixed(2)} TND</div>
    </button>
  );
}
