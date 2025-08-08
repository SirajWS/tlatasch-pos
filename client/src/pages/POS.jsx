// src/pages/POS.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProductManager from "../components/ProductManager";
import { addSale, getSales } from "../data/salesStore";

const STORAGE_KEY = "tlatasch_products";

const DEFAULT_PRODUCTS = [
  { id: "p1", name: "Chapati Normal", price: 7, category: "Food", active: true },
  { id: "p2", name: "Double Egg", price: 8, category: "Food", active: true },
  { id: "p3", name: "Mozzarella", price: 9, category: "Food", active: true },
  { id: "p4", name: "Jambon & Pepperoni", price: 9, category: "Food", active: true },
  { id: "p5", name: "4 Fromage", price: 4.6, category: "Food", active: true },
  { id: "p6", name: "Escalope", price: 10, category: "Food", active: true },
  { id: "p7", name: "Cola", price: 2.5, category: "Drinks", active: true },
  { id: "p8", name: "Fanta", price: 2.5, category: "Drinks", active: true },
  { id: "p9", name: "Delio", price: 2, category: "Drinks", active: true },
  { id: "p10", name: "Jus", price: 2, category: "Drinks", active: true },
  { id: "p11", name: "Chapati + Softdrink", price: 5.5, category: "Menus", active: true },
  { id: "p12", name: "Duo 2 Chapati + 2 Softdrinks", price: 10.5, category: "Menus", active: true },
  { id: "p13", name: "Combi 13", price: 50, category: "Menus", active: true },
  { id: "p14", name: "Combi 31", price: 113, category: "Menus", active: true },
];

const categories = ["Food", "Drinks", "Menus", "Functions"];

export default function POS() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("Food");
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [showProductManager, setShowProductManager] = useState(false);

  // Load products
  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        setProducts(JSON.parse(raw));
      } catch {
        setProducts(DEFAULT_PRODUCTS);
      }
    } else {
      setProducts(DEFAULT_PRODUCTS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PRODUCTS));
    }
  }, []);

  // Persist products
  useEffect(() => {
    if (products && products.length >= 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    }
  }, [products]);

  // Function buttons (Demo + ChangePayment entfernt)
  const functionButtons = [
    { label: "Products: Add / Edit / Delete", action: "manageProducts" },
    { label: "Open Reports", action: "openReports" },
    { label: "Show Daily Revenue", action: "dailyRevenue" },
    { label: "Reprint Last Receipt", action: "reprintReceipt" },
  ];

  // CRUD hooks
  const addProduct = (p) => setProducts((prev) => [...prev, p]);
  const updateProduct = (p) => setProducts((prev) => prev.map((x) => (x.id === p.id ? p : x)));
  const deleteProduct = (id) => setProducts((prev) => prev.filter((x) => x.id !== id));

  // Visible products
  const visibleProducts = products.filter(
    (p) => p.category === activeCategory && p.active !== false
  );

  // Cart actions
  const handleProductClick = (product) => {
    const exists = cart.find((i) => i.id === product.id);
    if (exists) {
      setCart(cart.map((i) => (i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i)));
    } else {
      setCart([...cart, { id: product.id, name: product.name, price: product.price, quantity: 1 }]);
    }
  };
  const handleIncrement = (id) =>
    setCart(cart.map((i) => (i.id === id ? { ...i, quantity: i.quantity + 1 } : i)));
  const handleDecrement = (id) =>
    setCart(
      cart
        .map((i) => (i.id === id ? { ...i, quantity: Math.max(0, i.quantity - 1) } : i))
        .filter((i) => i.quantity > 0)
    );
  const handleRemoveItem = (id) => setCart(cart.filter((i) => i.id !== id));

  // Totals
  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const discountValue = subtotal * discountPercent;
  const totalWithDiscount = Math.max(0, subtotal - discountValue);

  // Close manager if leaving Functions
  useEffect(() => {
    if (activeCategory !== "Functions" && showProductManager) {
      setShowProductManager(false);
    }
  }, [activeCategory, showProductManager]);

  // Payment
  const handlePayment = (method) => {
    if (cart.length === 0) {
      alert("Cart is empty!");
      return;
    }
    const sale = {
      timestamp: Date.now(),
      cashierPin: "000001", // TODO: dynamisch aus Login
      payment: method,
      items: cart.map((i) => ({
        id: i.id,
        name: i.name,
        price: i.price,
        qty: i.quantity,
      })),
      subtotal,
      discountPercent,
      discountValue,
      total: totalWithDiscount,
    };
    addSale(sale);
    setCart([]);
    setDiscountPercent(0);
    navigate("/receipt", { state: { sale } });
  };

  // Clear cart helper
  const handleClearCart = () => {
    setCart([]);
    setDiscountPercent(0);
  };

  // Reprint last receipt
  const handleReprintLastReceipt = () => {
    const sale = getSales()[0] || null; // neuester Sale
    if (!sale) {
      alert("No previous receipt found.");
      return;
    }
    navigate("/receipt", { state: { sale } });
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-neutral-950 text-gray-100">
      <div className="h-full p-4">
        <div className="h-full flex gap-4">
          {/* LEFT */}
          <section className="flex-1 min-w-0 rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-4 shadow-xl flex flex-col">
            {/* Tabs */}
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => {
                const active = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-4 py-2 rounded-xl font-medium transition border ${
                      active
                        ? "border-emerald-400 text-emerald-300 bg-emerald-400/10"
                        : "border-white/15 hover:bg-white/10"
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            <div className="my-3 h-px bg-white/10" />

            {/* Body */}
            <div className="flex-1 overflow-auto">
              {activeCategory === "Functions" ? (
                showProductManager ? (
                  <>
                    <div className="mb-3 flex items-center justify-between">
                      <div className="text-sm opacity-80">Product Manager</div>
                      <button
                        onClick={() => setShowProductManager(false)}
                        className="px-3 py-1 rounded-xl border border-white/15 hover:bg-white/10"
                      >
                        ← Back to Functions
                      </button>
                    </div>
                    <ProductManager
                      products={products}
                      onAdd={addProduct}
                      onUpdate={updateProduct}
                      onDelete={deleteProduct}
                    />
                  </>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3">
                    {functionButtons.map((btn) => (
                      <button
                        key={btn.action}
                        onClick={() => {
                          if (btn.action === "manageProducts") setShowProductManager(true);
                          else if (btn.action === "openReports") navigate("/reports");
                          else if (btn.action === "reprintReceipt") handleReprintLastReceipt();
                          else if (btn.action === "dailyRevenue") console.log("Daily revenue…");
                          else console.log("Function:", btn.action);
                        }}
                        className="h-16 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 px-4 text-left font-medium shadow transition"
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                )
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                  {visibleProducts.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => handleProductClick(product)}
                      className="group h-24 text-left rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 p-3 shadow transition hover:-translate-y-0.5"
                    >
                      <div className="font-semibold leading-tight truncate">{product.name}</div>
                      <div className="text-sm opacity-80 mt-1">{product.price.toFixed(2)} TND</div>
                      <div className="mt-2 text-[11px] opacity-0 group-hover:opacity-70 transition">
                        Tap to add →
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* RIGHT: Cart */}
          <aside className="w-[420px] rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-4 shadow-xl flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🛒</span>
              <h2 className="text-xl font-bold">Cart</h2>
            </div>

            {/* Items */}
            <div className="space-y-2 overflow-auto pr-1" style={{ maxHeight: "calc(100vh - 240px)" }}>
              {cart.length === 0 && <p className="text-sm text-gray-400">Cart is empty.</p>}
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 p-3"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{item.name}</p>
                    <p className="text-[11px] text-gray-400">{item.price.toFixed(2)} TND</p>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleDecrement(item.id)}
                      className="px-3 h-8 rounded-full border border-white/15 hover:bg-white/10"
                    >
                      –
                    </button>
                    <span className="w-8 text-center select-none text-sm">{item.quantity}</span>
                    <button
                      onClick={() => handleIncrement(item.id)}
                      className="px-3 h-8 rounded-full border border-white/15 hover:bg-white/10"
                    >
                      +
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="px-2 h-8 text-xs rounded-full border border-rose-400/40 text-rose-300 hover:bg-rose-500/10"
                      title="Remove"
                    >
                      ✕
                    </button>
                    <div className="w-20 text-right font-semibold">
                      {(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="mt-4 pt-3 border-t border-white/10">
              <div className="flex items-center gap-2">
                <span className="text-sm opacity-80">Discount:</span>
                <div className="flex rounded-xl overflow-hidden border border-white/12">
                  <button
                    onClick={() => setDiscountPercent(0.1)}
                    className={`px-3 py-1 text-sm border-r border-white/10 ${
                      discountPercent === 0.1 ? "bg-emerald-400/15" : "hover:bg-white/10"
                    }`}
                  >
                    10%
                  </button>
                  <button
                    onClick={() => setDiscountPercent(0.25)}
                    className={`px-3 py-1 text-sm ${
                      discountPercent === 0.25 ? "bg-emerald-400/15" : "hover:bg-white/10"
                    }`}
                  >
                    25%
                  </button>
                </div>
                <button
                  onClick={() => setDiscountPercent(0)}
                  className="ml-auto px-3 py-1 text-xs rounded-xl border border-white/15 hover:bg-white/10"
                >
                  Reset
                </button>
              </div>

              <div className="mt-3 space-y-1 text-sm">
                <div className="flex justify-between opacity-80">
                  <span>Subtotal</span>
                  <span>{subtotal.toFixed(2)} TND</span>
                </div>
                <div className="flex justify-between opacity-80">
                  <span>
                    Discount{discountPercent ? ` (${Math.round(discountPercent * 100)}%)` : ""}
                  </span>
                  <span>-{discountValue.toFixed(2)} TND</span>
                </div>
                <div className="flex justify-between text-base font-semibold pt-2 border-t border-white/10">
                  <span>Total</span>
                  <span>{totalWithDiscount.toFixed(2)} TND</span>
                </div>
              </div>

              {/* Actions: Clear + Payment */}
              <div className="mt-3 grid grid-cols-3 gap-2">
                <button
                  onClick={handleClearCart}
                  className="py-2 rounded-xl border border-rose-400/40 text-rose-300 hover:bg-rose-500/10"
                >
                  Clear
                </button>
                <button
                  onClick={() => handlePayment("CASH")}
                  className="py-2 rounded-xl border border-white/15 hover:bg-white/10"
                >
                  CASH
                </button>
                <button
                  onClick={() => handlePayment("CARD")}
                  className="py-2 rounded-xl border border-white/15 hover:bg-white/10"
                >
                  CARD
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}


