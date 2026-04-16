import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// 1. Import your custom components
import Header from './components/Header';
import Footer from './components/Footer';
import Contact from './pages/Contact';

// 2. Data for the Home Page (The "Database")
const GIFTS = [
  { id: 1, name: "Golden Bloom Bouquet", price: 7770000, image: "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?w=500" },
  { id: 2, name: "Luxury Chocolate Box", price: 85000, image: "https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=500" },
  { id: 3, name: "Premium Fruit Basket", price: 120000, image: "https://images.unsplash.com/photo-1543157145-f78c636d023d?w=500" },
  { id: 4, name: "Premium Perfume", price: 250000, image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=500" }
];

// 3. The Home Page Component (The Grid)
const Home = () => {
  const formatPrice = (price) => "UGX " + Number(price).toLocaleString();

  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      backgroundColor: '#fdfbf7',
      paddingBottom: '100px'
    },
    heroSection: { padding: '80px 20px', textAlign: 'center' },
    title: { fontSize: '4rem', color: '#1a1a1a', letterSpacing: '0.4em', textTransform: 'uppercase', margin: '0', fontFamily: "'Playfair Display', serif" },
    subtitle: { color: '#c5a059', letterSpacing: '0.5em', textTransform: 'uppercase', fontSize: '0.75rem', marginTop: '15px' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px', padding: '20px', maxWidth: '1200px', width: '100%' }
  };

  return (
    <main style={styles.container}>
      <div style={styles.heroSection}>
        <h1 style={styles.title}>FERUZA</h1>
        <p style={styles.subtitle}>The Art of Surprising • Kampala</p>
      </div>
      <div style={styles.grid}>
        {GIFTS.map((gift) => (
          <div key={gift.id} style={{ backgroundColor: 'white', padding: '15px', border: '1px solid #eee' }}>
            <img src={gift.image} alt={gift.name} style={{ width: '100%', height: '250px', objectFit: 'cover' }} />
            <h3 style={{ fontFamily: 'serif', marginTop: '15px' }}>{gift.name}</h3>
            <p style={{ color: '#c5a059', fontWeight: 'bold' }}>{formatPrice(gift.price)}</p>
            <button 
              onClick={() => window.open(`https://wa.me/256700000000?text=I'd like to order ${gift.name}`, '_blank')}
              style={{ width: '100%', padding: '12px', background: '#1a1a1a', color: 'white', border: 'none', cursor: 'pointer', marginTop: '10px', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '1.5px' }}
            >
              Order via WhatsApp
            </button>
          </div>
        ))}
      </div>
    </main>
  );
};

// 4. The Main App (Traffic Controller)
function App() {
  return (
    <Router>
      <div style={{ backgroundColor: '#fdfbf7', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* Header stays at the top of every page */}
        <Header />
        
        {/* Routes decides which content to show in the middle */}
        <div style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </div>

        {/* Footer stays at the bottom of every page */}
        <Footer />
        
        {/* Floating WhatsApp Chat Button */}
        <a 
          href="https://wa.me/256700000000"
          style={{ position: 'fixed', bottom: '20px', right: '20px', backgroundColor: '#25D366', color: 'white', padding: '15px 20px', borderRadius: '50px', textDecoration: 'none', fontWeight: 'bold', zIndex: 1000 }}
        >
          💬 Chat with us
        </a>
      </div>
    </Router>
  );
}

export default App;
