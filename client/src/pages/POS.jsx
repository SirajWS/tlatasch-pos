// src/pages/POS.jsx
import React, { useState } from 'react';
import FunctionsList from "../components/FunctionsList";

const categories = ['Food', 'Drinks', 'Menus', 'Functions'];

const products = [
  // Food
  { name: 'Chapati Normal', price: 7, category: 'Food' },
  { name: 'Double Egg', price: 8, category: 'Food' },
  { name: 'Mozzarella', price: 9, category: 'Food' },
  { name: 'Jambon & Pepperoni', price: 9, category: 'Food' },
  { name: '4 Fromage', price: 4.6, category: 'Food' },
  { name: 'Escalope', price: 10, category: 'Food' },

  // Drinks
  { name: 'Cola', price: 2.5, category: 'Drinks' },
  { name: 'Fanta', price: 2.5, category: 'Drinks' },
  { name: 'Delio', price: 2, category: 'Drinks' },
  { name: 'Jus', price: 2, category: 'Drinks' },

  // Menus
  { name: 'Chapati + Softdrink', price: 5.5, category: 'Menus' },
  { name: 'Duo 2 Chapati + 2 Softdrinks', price: 10.5, category: 'Menus' },
  { name: 'Combi 13', price: 50, category: 'Menus' },
  { name: 'Combi 31', price: 113, category: 'Menus' },

  // Functions (temporary placeholder products)
  { name: 'Daily Revenue', price: 0, category: 'Functions' },
];

export default function POS() {
  const [activeCategory, setActiveCategory] = useState('Food');
  const [cart, setCart] = useState([]);
  const [discount, setDiscount] = useState(0);

  const handleProductClick = (product) => {
    const exists = cart.find((item) => item.name === product.name);
    if (exists) {
      setCart(
        cart.map((item) =>
          item.name === product.name
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const handleRemoveItem = (name) => {
    setCart(cart.filter((item) => item.name !== name));
  };

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const totalWithDiscount = Math.max(0, total - discount).toFixed(2);
  

  const handleFunctionAction = (action) => {
  switch (action) {
    case "changePayment":
      console.log("Changing payment method...");
      break;
    case "dailyRevenue":
      console.log("Showing daily revenue...");
      break;
    case "reprintReceipt":
      console.log("Reprinting last receipt...");
      break;
    default:
      console.warn("Unknown function:", action);
  }
};


  return (
    <div className="flex h-screen p-4 gap-4 bg-gray-100">
      {/* Left side: Categories & Products */}
      <div className="w-2/3 flex flex-col gap-4">
        <div className="flex gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded font-semibold text-white ${
                activeCategory === cat ? 'bg-blue-700' : 'bg-blue-500'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-3">
          {activeCategory === "Functions" ? (
  <FunctionsList onAction={handleFunctionAction} />
) : (
  products
    .filter((p) => p.category === activeCategory)
    .map((product) => (
      <button
        key={product.name}
        onClick={() => handleProductClick(product)}
        className="bg-blue-500 hover:bg-blue-600 text-white p-4 rounded text-lg font-medium"
      >
        {product.name}
      </button>
    ))
      )}

        </div>
      </div>

      {/* Right side: Cart */}
      <div className="w-1/3 bg-white p-4 rounded shadow flex flex-col justify-between">
        <div>
          <h2 className="text-xl font-bold mb-4">🛒 Cart</h2>
          {cart.map((item) => (
            <div
              key={item.name}
              className="flex justify-between items-center mb-2"
            >
              <div className="flex flex-col">
                <span>
                  {item.name} × {item.quantity}
                </span>
                <span className="text-sm text-gray-500">
                  Unit: {item.price.toFixed(2)} TND
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span>{(item.price * item.quantity).toFixed(2)} TND</span>
                <button
                  onClick={() => handleRemoveItem(item.name)}
                  className="text-red-500 font-bold px-2"
                  title="Remove"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Discount + Total */}
        <div className="mt-4 border-t pt-4">
          <label className="block mb-2 font-medium">
            🎟 Discount (TND):
            <input
              type="number"
              value={discount}
              onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
              className="w-full mt-1 p-2 border rounded"
              min="0"
              step="0.1"
            />
          </label>

          <div className="flex justify-between font-bold text-lg my-4">
            <span>Total:</span>
            <span>{totalWithDiscount} TND</span>
          </div>

          <div className="flex gap-4">
            <button className="w-1/2 bg-gray-800 text-white py-2 rounded">
              CASH
            </button>
            <button className="w-1/2 bg-gray-600 text-white py-2 rounded">
              CARD
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}







