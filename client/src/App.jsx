// src/App.jsx
import { Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import POS from "./pages/POS";
import Reports from "./pages/Reports"; // <— NEU

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/pos" element={<POS />} />
      <Route path="/reports" element={<Reports />} /> {/* <— NEU */}
    </Routes>
  );
}
