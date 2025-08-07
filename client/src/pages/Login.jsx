import { useState } from "react";
import { useNavigate } from "react-router-dom";

const VALID_PINS = {
  "123456": "Cash Register 1",
  "654321": "Cash Register 2",
  "111111": "Cash Register 3"
};

export default function Login() {
  const [pin, setPin] = useState("");
  const navigate = useNavigate();

  const handleDigit = (digit) => {
    if (pin.length < 6) setPin(pin + digit);
  };

  const handleBackspace = () => {
    setPin(pin.slice(0, -1));
  };

  const handleLogin = () => {
    if (VALID_PINS[pin]) {
      localStorage.setItem("registerID", VALID_PINS[pin]);
      navigate("/pos");
    } else {
      alert("Incorrect PIN");
      setPin("");
    }
  };

  const digits = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="flex flex-col items-center p-6 bg-gray-800 rounded shadow-lg">
        <h1 className="text-4xl font-bold mb-6">Enter PIN</h1>

        <input
          type="password"
          value={pin}
          readOnly
          className="mb-4 text-center text-xl w-48 py-2 rounded bg-gray-700 border border-gray-600"
        />

        <div className="grid grid-cols-3 gap-4 mb-4">
          {digits.map((d) => (
            <button
              key={d}
              onClick={() => handleDigit(d)}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xl py-2 rounded"
            >
              {d}
            </button>
          ))}

          <button
            onClick={handleBackspace}
            className="bg-yellow-500 col-span-2 py-2 rounded"
          >
            ← Backspace
          </button>
          <button
            onClick={handleLogin}
            className="bg-green-600 py-2 rounded"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
