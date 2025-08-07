import { Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import POS from "./pages/POS";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/pos" element={<POS />} />
    </Routes>
  );
}
