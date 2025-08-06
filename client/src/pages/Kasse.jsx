import React, { useState } from 'react';

const kategorien = ['Food', 'Drinks', 'Menüs', 'Function'];

const produkte = [
  // Food
  { name: 'Chapati Normal', preis: 7, kategorie: 'Food' },
  { name: 'Double Egg', preis: 8, kategorie: 'Food' },
  { name: 'Mozzarella', preis: 9, kategorie: 'Food' },
  { name: 'Jambon & Pepperoni', preis: 9, kategorie: 'Food' },
  { name: '4 Fromage', preis: 4.6, kategorie: 'Food' },
  { name: 'Escalope', preis: 10, kategorie: 'Food' },

  // Drinks
  { name: 'Cola', preis: 2.5, kategorie: 'Drinks' },
  { name: 'Fanta', preis: 2.5, kategorie: 'Drinks' },
  { name: 'Delio', preis: 2, kategorie: 'Drinks' },
  { name: 'Jus', preis: 2, kategorie: 'Drinks' },

  // Menüs
  { name: 'Chapati + Softdrink', preis: 5.5, kategorie: 'Menüs' },
  { name: 'Duo 2 Chapati + 2 Softdrinks', preis: 10.5, kategorie: 'Menüs' },
  { name: 'Combi 13', preis: 50, kategorie: 'Menüs' },
  { name: 'Combi 31', preis: 113, kategorie: 'Menüs' },

  // Function
  { name: 'Tagesumsatz', preis: 0, kategorie: 'Function' },
];

export default function Kasse() {
  const [aktiveKategorie, setAktiveKategorie] = useState('Food');
  const [warenkorb, setWarenkorb] = useState([]);
  const [rabatt, setRabatt] = useState(0);

  const handleProduktClick = (produkt) => {
    const vorhanden = warenkorb.find((item) => item.name === produkt.name);
    if (vorhanden) {
      setWarenkorb(
        warenkorb.map((item) =>
          item.name === produkt.name
            ? { ...item, menge: item.menge + 1 }
            : item
        )
      );
    } else {
      setWarenkorb([...warenkorb, { ...produkt, menge: 1 }]);
    }
  };

  const handleRemoveItem = (name) => {
    setWarenkorb(warenkorb.filter((item) => item.name !== name));
  };

  const gesamt = warenkorb.reduce(
    (sum, item) => sum + item.preis * item.menge,
    0
  );

  const gesamtMitRabatt = Math.max(0, gesamt - rabatt).toFixed(2);

  return (
    <div className="flex h-screen p-4 gap-4 bg-gray-100">
      {/* Linke Seite: Kategorien und Produkte */}
      <div className="w-2/3 flex flex-col gap-4">
        <div className="flex gap-2">
          {kategorien.map((kat) => (
            <button
              key={kat}
              onClick={() => setAktiveKategorie(kat)}
              className={`px-4 py-2 rounded font-semibold text-white ${
                aktiveKategorie === kat ? 'bg-blue-700' : 'bg-blue-500'
              }`}
            >
              {kat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-3">
          {produkte
            .filter((p) => p.kategorie === aktiveKategorie)
            .map((produkt) => (
              <button
                key={produkt.name}
                onClick={() => handleProduktClick(produkt)}
                className="bg-blue-500 hover:bg-blue-600 text-white p-4 rounded text-lg font-medium"
              >
                {produkt.name}
              </button>
            ))}
        </div>
      </div>

      {/* Rechte Seite: Warenkorb */}
      <div className="w-1/3 bg-white p-4 rounded shadow flex flex-col justify-between">
        <div>
          <h2 className="text-xl font-bold mb-4">🛒 Warenkorb</h2>
          {warenkorb.map((item) => (
            <div
              key={item.name}
              className="flex justify-between items-center mb-2"
            >
              <div className="flex flex-col">
                <span>
                  {item.name} × {item.menge}
                </span>
                <span className="text-sm text-gray-500">
                  Einzelpreis: {item.preis.toFixed(2)} TND
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span>{(item.preis * item.menge).toFixed(2)} TND</span>
                <button
                  onClick={() => handleRemoveItem(item.name)}
                  className="text-red-500 font-bold px-2"
                  title="Entfernen"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Rabatt + Gesamt */}
        <div className="mt-4 border-t pt-4">
          <label className="block mb-2 font-medium">
            🎟 Rabatt (TND):
            <input
              type="number"
              value={rabatt}
              onChange={(e) => setRabatt(parseFloat(e.target.value) || 0)}
              className="w-full mt-1 p-2 border rounded"
              min="0"
              step="0.1"
            />
          </label>

          <div className="flex justify-between font-bold text-lg my-4">
            <span>Gesamt:</span>
            <span>{gesamtMitRabatt} TND</span>
          </div>

          <div className="flex gap-4">
            <button className="w-1/2 bg-gray-800 text-white py-2 rounded">
              BAR
            </button>
            <button className="w-1/2 bg-gray-600 text-white py-2 rounded">
              KARTE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}







