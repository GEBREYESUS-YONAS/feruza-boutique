import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Contact from './pages/Contact';

// --- DATABASE ---
const PRODUCTS = [
  { id: 1, name: "Red Rose Bouquet", price: 120000, category: "Flowers", image: "https://images.unsplash.com/photo-1548094990-c16ca90f1f0d?w=500" },
  { id: 2, name: "Oud Royale Perfume", price: 350000, category: "Perfumes", image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=500" },
  { id: 3, name: "Vintage Gold Frame", price: 45000, category: "Photo Frames", image: "https://images.unsplash.com/photo-1583847268964-b28dc2f51ac9?w=500" },
  { id: 4, name: "Red Velvet Bliss", price: 180000, category: "Cakes", image: "https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?w=500" },
  { id: 5, name: "The Celebration Box", price: 500000, category: "Packages", image: "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=500", desc: "Flowers + Cake + Perfume" }
];

const CHECKLIST_OPTIONS = {
  Flowers: ["Red Roses", "White Lilies", "Mixed Bouquet", "Sunflowers"],
  Items: ["Perfume", "Photo Frame", "Chocolate Box", "Luxury Candle"],
  Cakes: ["Red Velvet", "Chocolate Fudge", "Vanilla Cream", "Fruit Cake"]
};

// --- HOME PAGE ---
const Home = () => {
  const [filter, setFilter] = useState("All");
  const categories = ["All", "Flowers", "Perfumes", "Photo Frames", "Cakes", "Packages", "Custom"];

  const filteredItems = filter === "All" ? PRODUCTS : PRODUCTS.filter(p => p.category === filter);

  return (
    <div className="fade-in" style={{ padding: '40px 20px', backgroundColor: '#fdfbf7' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Montserrat:wght@300;500&display=swap');
        .fade-in { animation: fadeIn 1.2s ease-in; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .product-card { transition: transform 0.3s ease, box-shadow 0.3s ease; }
        .product-card:hover { transform: translateY(-5px); box-shadow: 0 10px 20px rgba(0,0,0,0.05); }
        body { font-family: 'Montserrat', sans-serif; }
        h1, h2, h3 { font-family: 'Playfair Display', serif; }
      `}</style>

      {/* Category Bar */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap', marginBottom: '50px' }}>
        {categories.map(cat => (
          <button key={cat} onClick={() => setFilter(cat)} style={{
            background: 'none', border: 'none', borderBottom: filter === cat ? '2px solid #c5a059' : 'none',
            color: filter === cat ? '#c5a059' : '#888', cursor: 'pointer', padding: '10px', fontWeight: '500', 
            textTransform: 'uppercase', fontSize: '12px', letterSpacing: '2px', transition: '0.3s'
          }}>{cat}</button>
        ))}
      </div>

      {filter === "Custom" ? <CustomOrder /> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '40px', maxWidth: '1200px', margin: '0 auto' }}>
          {filteredItems.map(item => (
            <div key={item.id} className="product-card" style={{ background: 'white', padding: '20px', textAlign: 'center' }}>
              <div style={{ overflow: 'hidden', height: '300px', marginBottom: '15px' }}>
                <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <h3 style={{ fontSize: '1.4rem', marginBottom: '10px' }}>{item.name}</h3>
              {item.desc && <p style={{ fontSize: '13px', color: '#888', fontStyle: 'italic' }}>{item.desc}</p>}
              <p style={{ color: '#c5a059', fontWeight: 'bold', fontSize: '18px', margin: '15px 0' }}>UGX {item.price.toLocaleString()}</p>
              <button 
                onClick={() => window.open(`https://wa.me/256700000000?text=Hello Feruza, I am interested in the ${item.name}`, '_blank')}
                style={{ width: '100%', padding: '15px', background: '#1a1a1a', color: 'white', border: 'none', cursor: 'pointer', letterSpacing: '1px', textTransform: 'uppercase', fontSize: '11px' }}
              >Order via WhatsApp</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// --- CUSTOM ORDER (PART 2: CHECKLIST) ---
const CustomOrder = () => {
  const [selections, setSelections] = useState([]);
  const [note, setNote] = useState("");

  const toggleItem = (item) => {
    setSelections(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
  };

  const handleSend = () => {
    const message = `Hello Feruza, I want to build a custom package with: \n- ${selections.join('\n- ')} \n\nAdditional Note: ${note}`;
    window.open(`https://wa.me/00447456329886?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="fade-in" style={{ maxWidth: '800px', margin: '0 auto', background: 'white', padding: '40px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
      <h2 style={{ textAlign: 'center', fontSize: '2.5rem', marginBottom: '10px' }}>Build Your Box</h2>
      <p style={{ textAlign: 'center', color: '#888', marginBottom: '40px' }}>Select the items you'd like to include in your bespoke gift.</p>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '30px' }}>
        {Object.keys(CHECKLIST_OPTIONS).map(cat => (
          <div key={cat}>
            <h4 style={{ borderBottom: '1px solid #c5a059', paddingBottom: '10px', textTransform: 'uppercase', fontSize: '13px' }}>{cat}</h4>
            {CHECKLIST_OPTIONS[cat].map(opt => (
              <label key={opt} style={{ display: 'block', margin: '10px 0', fontSize: '14px', cursor: 'pointer' }}>
                <input type="checkbox" onChange={() => toggleItem(opt)} checked={selections.includes(opt)} style={{ marginRight: '10px', accentColor: '#c5a059' }} />
                {opt}
              </label>
            ))}
          </div>
        ))}
      </div>

      <div style={{ marginTop: '40px' }}>
        <h4 style={{ textTransform: 'uppercase', fontSize: '13px' }}>Special Instructions</h4>
        <textarea 
          placeholder="E.g. Delivery date, specific colors, or a message for the card..."
          style={{ width: '100%', padding: '15px', marginTop: '10px', border: '1px solid #ddd', fontFamily: 'inherit' }}
          rows="4"
          onChange={(e) => setNote(e.target.value)}
        />
        <button 
          onClick={handleSend}
          disabled={selections.length === 0}
          style={{ width: '100%', padding: '20px', background: selections.length > 0 ? '#c5a059' : '#ccc', color: 'white', border: 'none', cursor: 'pointer', marginTop: '30px', fontWeight: 'bold', fontSize: '16px', textTransform: 'uppercase', transition: '0.3s' }}
        >Send My Selection to WhatsApp</button>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Header />
        <div style={{ flex: 1 }}><Routes>
          <Route path="/" element={<Home />} />
          <Route path="/contact" element={<Contact />} />
        </Routes></div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
