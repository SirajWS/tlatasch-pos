import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Kasse from "./pages/Kasse";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/kasse" element={<Kasse />} />
    </Routes>
  );
}

export default App;
