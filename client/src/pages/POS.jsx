// src/pages/POS.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ProductManager from "../components/ProductManager";
import { addSale, getSales } from "../data/salesStore";
import AdminPinModal from "../components/AdminPinModal";

const STORAGE_PRODUCTS = "tlatasch_products";
const STORAGE_CATEGORIES = "tlatasch_categories";

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

export default function POS() {
  const navigate = useNavigate();
  const location = useLocation();

  // Products & categories
  const [products, setProducts] = useState([]);
  const [baseCategories, setBaseCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState("Food");

  // Cart & discounts
  const [cart, setCart] = useState([]);
  const [discountPercent, setDiscountPercent] = useState(0);

  // UI state
  const [showProductManager, setShowProductManager] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);

  // Session
  const cashierPin = localStorage.getItem("cashierPin") || "000001";

  // Ensure default admin pin exists
  useEffect(() => {
    if (!localStorage.getItem("adminPin")) {
      localStorage.setItem("adminPin", "999999");
    }
  }, []);

  // Load products
  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_PRODUCTS);
    if (raw) {
      try {
        setProducts(JSON.parse(raw));
      } catch {
        setProducts(DEFAULT_PRODUCTS);
      }
    } else {
      setProducts(DEFAULT_PRODUCTS);
      localStorage.setItem(STORAGE_PRODUCTS, JSON.stringify(DEFAULT_PRODUCTS));
    }
  }, []);

  // Persist products
  useEffect(() => {
    localStorage.setItem(STORAGE_PRODUCTS, JSON.stringify(products));
  }, [products]);

  // Load categories
  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_CATEGORIES);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length) {
          setBaseCategories(parsed);
          if (!parsed.includes(activeCategory) && activeCategory !== "Functions") {
            setActiveCategory(parsed[0]);
          }
          return;
        }
      } catch {}
    }
    const defaults = ["Food", "Drinks", "Menus", "Others"];
    setBaseCategories(defaults);
    localStorage.setItem(STORAGE_CATEGORIES, JSON.stringify(defaults));
  }, []);

  // Coming back from admin to open ProductManager directly
  useEffect(() => {
    if (location.state?.openProductManager) {
      setActiveCategory("Functions");
      setShowProductManager(true);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  // Tabs incl. Functions
  const categories = [...baseCategories, "Functions"];

  // CRUD
  const addProduct = (p) => setProducts((prev) => [...prev, p]);
  const updateProduct = (p) => setProducts((prev) => prev.map((x) => (x.id === p.id ? p : x)));
  const deleteProduct = (id) => setProducts((prev) => prev.filter((x) => x.id !== id));

  const handleCategoriesChange = (list) => {
    setBaseCategories(list);
    localStorage.setItem(STORAGE_CATEGORIES, JSON.stringify(list));
    if (!list.includes(activeCategory) && activeCategory !== "Functions") {
      setActiveCategory(list[0] || "Functions");
    }
  };

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

  // Admin flow
  const openAdmin = () => setShowAdminModal(true);
  const handleAdminSuccess = () => navigate("/admin");

  // Payments
  const handlePayment = (method) => {
    if (cart.length === 0) {
      alert("Cart is empty!");
      return;
    }
    const sale = {
      timestamp: Date.now(),
      cashierPin,
      payment: method,
      items: cart.map((i) => ({ id: i.id, name: i.name, price: i.price, qty: i.quantity })),
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

  const handleClearCart = () => {
    setCart([]);
    setDiscountPercent(0);
  };

  const handleReprintLastReceipt = () => {
    const sale = getSales()[0] || null;
    if (!sale) return alert("No previous receipt found.");
    navigate("/receipt", { state: { sale } });
  };

  const handleLogout = () => {
    setCart([]);
    setDiscountPercent(0);
    localStorage.removeItem("cashierPin");
    navigate("/");
  };

  // Close PM if leaving Functions
  useEffect(() => {
    if (activeCategory !== "Functions" && showProductManager) setShowProductManager(false);
  }, [activeCategory, showProductManager]);

  // Hide cart when ProductManager open
  const showCart = !(activeCategory === "Functions" && showProductManager);

  return (
    <div className="h-screen w-screen overflow-hidden bg-neutral-950 text-gray-100">
      <div className="h-full p-4">
        {/* Top bar */}
        <div className="mb-3 flex items-center justify-between">
          <h1 className="text-lg font-semibold">TLATASCH POS</h1>
          <div className="flex items-center gap-4">
            <span className="text-xs opacity-70">Cashier: {cashierPin}</span>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-xl border border-rose-400/40 text-rose-300 hover:bg-rose-500/10"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="h-[calc(100%-2.5rem)] flex gap-4">
          {/* LEFT */}
          <section className={`${showCart ? "flex-1" : "w-full"} min-w-0 rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-4 shadow-xl flex flex-col relative z-10`}>
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
                      categories={baseCategories}
                      onCategoriesChange={handleCategoriesChange}
                      onAdd={addProduct}
                      onUpdate={updateProduct}
                      onDelete={deleteProduct}
                    />
                  </>
                ) : (
                  // Klickbarer Functions-Layer
                  <div className="relative z-20 pointer-events-auto">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3">
                      <button
                        onClick={(e) => { e.stopPropagation(); openAdmin(); }}
                        className="relative z-30 pointer-events-auto h-16 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 px-4 text-left font-medium shadow transition"
                      >
                        Admin
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleReprintLastReceipt(); }}
                        className="relative z-30 pointer-events-auto h-16 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 px-4 text-left font-medium shadow transition"
                      >
                        Reprint Last Receipt
                      </button>
                    </div>
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
          {showCart && (
            <aside className="w-[420px] rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-4 shadow-xl flex flex-col">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">🛒</span>
                <h2 className="text-xl font-bold">Cart</h2>
              </div>

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
                    <span>Discount{discountPercent ? ` (${Math.round(discountPercent * 100)}%)` : ""}</span>
                    <span>-{discountValue.toFixed(2)} TND</span>
                  </div>
                  <div className="flex justify-between text-base font-semibold pt-2 border-t border-white/10">
                    <span>Total</span>
                    <span>{totalWithDiscount.toFixed(2)} TND</span>
                  </div>
                </div>

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
          )}
        </div>
      </div>

      {/* Admin PIN modal (global, außerhalb Layout) */}
      <AdminPinModal
        open={showAdminModal}
        onClose={() => setShowAdminModal(false)}
        onSuccess={handleAdminSuccess}
      />
    </div>
  );
}
