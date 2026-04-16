import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Contact from './pages/Contact';

// --- DATABASE: ALL ITEMS ---
const PRODUCTS = [
  { id: 1, name: "Red Rose Bouquet", price: 120000, category: "Flowers", image: "https://images.unsplash.com/photo-1548094990-c16ca90f1f0d?w=500" },
  { id: 2, name: "Oud Royale Perfume", price: 350000, category: "Perfumes", image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=500" },
  { id: 3, name: "Vintage Gold Frame", price: 45000, category: "Photo Frames", image: "https://images.unsplash.com/photo-1583847268964-b28dc2f51ac9?w=500" },
  { id: 4, name: "Red Velvet Bliss", price: 180000, category: "Cakes", image: "https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?w=500" },
  { id: 5, name: "The Celebration Box", price: 500000, category: "Packages", image: "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=500", desc: "Flowers + Cake + Perfume" },
  { id: 6, name: "Sweet Love Bundle", price: 250000, category: "Packages", image: "https://images.unsplash.com/photo-1549462980-6a03471c2475?w=500", desc: "Flowers + Photo Frame" }
];

// --- HOME PAGE COMPONENT ---
const Home = () => {
  const [filter, setFilter] = useState("All");
  const categories = ["All", "Flowers", "Perfumes", "Photo Frames", "Cakes", "Packages", "Custom"];

  const filteredItems = filter === "All" ? PRODUCTS : PRODUCTS.filter(p => p.category === filter);

  return (
    <div style={{ padding: '40px 20px', backgroundColor: '#fdfbf7' }}>
      {/* Category Bar */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', flexWrap: 'wrap', marginBottom: '40px' }}>
        {categories.map(cat => (
          <button key={cat} onClick={() => setFilter(cat)} style={{
            background: 'none', border: 'none', borderBottom: filter === cat ? '2px solid #c5a059' : 'none',
            color: filter === cat ? '#c5a059' : '#333', cursor: 'pointer', padding: '10px', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '12px'
          }}>{cat}</button>
        ))}
      </div>

      {filter === "Custom" ? <CustomOrder /> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '30px', maxWidth: '1200px', margin: '0 auto' }}>
          {filteredItems.map(item => (
            <div key={item.id} style={{ background: 'white', border: '1px solid #eee', padding: '15px', textAlign: 'center' }}>
              <img src={item.image} alt={item.name} style={{ width: '100%', height: '250px', objectFit: 'cover' }} />
              <h3 style={{ fontFamily: 'serif', margin: '15px 0 5px' }}>{item.name}</h3>
              {item.desc && <p style={{ fontSize: '12px', color: '#777' }}>{item.desc}</p>}
              <p style={{ color: '#c5a059', fontWeight: 'bold' }}>UGX {item.price.toLocaleString()}</p>
              <button 
                onClick={() => window.open(`https://wa.me/256700000000?text=Hello Feruza, I want to order the ${item.name}`, '_blank')}
                style={{ width: '100%', padding: '12px', background: '#1a1a1a', color: 'white', border: 'none', cursor: 'pointer', marginTop: '10px' }}
              >Order via WhatsApp</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// --- CUSTOM ORDER COMPONENT ---
const CustomOrder = () => {
  const [details, setDetails] = useState("");
  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center', padding: '40px', background: 'white', border: '1px solid #eee' }}>
      <h2 style={{ fontFamily: 'serif' }}>Custom Gift Package</h2>
      <p>Tell us exactly what you want (e.g., Pink roses with a chocolate cake and a specific perfume).</p>
      <textarea 
        rows="5" 
        style={{ width: '100%', padding: '15px', marginTop: '20px', border: '1px solid #ddd' }}
        placeholder="Type your dream gift details here..."
        onChange={(e) => setDetails(e.target.value)}
      />
      <button 
        onClick={() => window.open(`https://wa.me/256700000000?text=Custom Order Inquiry: ${details}`, '_blank')}
        style={{ width: '100%', padding: '15px', background: '#c5a059', color: 'white', border: 'none', cursor: 'pointer', marginTop: '20px', fontWeight: 'bold' }}
      >Send Custom Request to WhatsApp</button>
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
