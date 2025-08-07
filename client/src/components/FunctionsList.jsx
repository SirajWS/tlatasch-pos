// src/components/FunctionsList.jsx
import React from "react";

export default function FunctionsList({ onAction }) {
  const functions = [
    { label: "Change Payment Method", action: "changePayment" },
    { label: "Show Daily Revenue", action: "dailyRevenue" },
    { label: "Reprint Last Receipt", action: "reprintReceipt" },
  ];

  return (
    <div className="flex flex-col gap-3">
      {functions.map((func) => (
        <button
          key={func.action}
          onClick={() => onAction(func.action)}
          className="bg-gray-800 text-white px-4 py-3 rounded hover:bg-gray-700 font-medium"
        >
          {func.label}
        </button>
      ))}
    </div>
  );
}
