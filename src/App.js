import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';


// Firebase Imports
import { auth, db } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, getDocs, addDoc, doc, getDoc, setDoc } from 'firebase/firestore';

// Component Imports
import Auth from './components/Auth';
import Contact from './pages/Contact';

// --- CONFIGURATION ---
const CHECKLIST_OPTIONS = {
  Flowers: ["Red Roses", "White Lilies", "Mixed Bouquet", "Sunflowers"],
  Items: ["Perfume", "Photo Frame", "Chocolate Box", "Luxury Candle"],
  Cakes: ["Red Velvet", "Chocolate Fudge", "Vanilla Cream", "Fruit Cake"]
};

const inputStyle = {
  padding: '12px', border: '1px solid #ddd', borderRadius: '6px',
  fontSize: '14px', outline: 'none', boxSizing: 'border-box', width: '100%'
};

const btnStyle = {
  padding: '14px 20px', background: '#1a1a1a', color: '#fff',
  border: 'none', cursor: 'pointer', fontWeight: 'bold',
  fontSize: '11px', letterSpacing: '1px', borderRadius: '4px', width: '100%'
};


// ============================================================
// HEADER — Search + Cart always visible, rest in hamburger
// ============================================================
const Header = ({ user, cart, onCartOpen }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const menuRef = useRef(null);

  useEffect(() => {
    const handle = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  const navLinkStyle = {
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '14px 20px', textDecoration: 'none',
    color: '#333', fontSize: '13px', fontWeight: 'bold',
    letterSpacing: '1px', borderBottom: '1px solid #f5f5f5',
  };

  return (
    <header style={{
      padding: '0 5%', height: '65px',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      borderBottom: '1px solid #eee', background: '#fff',
      position: 'sticky', top: 0, zIndex: 1000,
    }}>

      {/* LOGO */}
      <Link to="/" style={{ textDecoration: 'none', color: '#000', fontFamily: 'Playfair Display', fontSize: '22px', letterSpacing: '2px' }}>
        FERUZA
      </Link>

      {/* INLINE SEARCH BAR */}
      {isSearchOpen && (
        <div style={{ flex: 1, margin: '0 15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input autoFocus type="search" placeholder="Search gifts, flowers, cakes..."
            value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            style={{ ...inputStyle, padding: '8px 14px', fontSize: '13px' }} />
          <button onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }}
            style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#999', flexShrink: 0 }}>✕</button>
        </div>
      )}

      {/* RIGHT NAV */}
      {!isSearchOpen && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>

          {/* SEARCH — always visible */}
          <button onClick={() => setIsSearchOpen(true)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', padding: '8px' }}>🔍</button>

          {/* CART — always visible with badge */}
          <button onClick={onCartOpen}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', padding: '8px', position: 'relative' }}>
            🛍️
            {cart.length > 0 && (
              <span style={{
                position: 'absolute', top: '2px', right: '2px',
                background: '#c5a059', color: '#fff', fontSize: '9px', fontWeight: 'bold',
                width: '16px', height: '16px', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{cart.length}</span>
            )}
          </button>

          {/* HAMBURGER */}
          <div ref={menuRef} style={{ position: 'relative' }}>
            <button onClick={() => setMenuOpen(o => !o)}
              style={{
                background: 'none', border: '1px solid #eee', borderRadius: '6px',
                cursor: 'pointer', padding: '6px 10px', fontSize: '18px',
                color: menuOpen ? '#c5a059' : '#555',
              }}>
              {menuOpen ? '✕' : '☰'}
            </button>

            {menuOpen && (
              <div style={{
                position: 'absolute', top: '48px', right: 0, background: '#fff',
                minWidth: '210px', boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                borderRadius: '10px', overflow: 'hidden', border: '1px solid #f0f0f0', zIndex: 2000,
              }}>
                <Link to="/" style={navLinkStyle} onClick={() => setMenuOpen(false)}>🏠 &nbsp; HOME</Link>
                <Link to="/contact" style={navLinkStyle} onClick={() => setMenuOpen(false)}>✉️ &nbsp; CONTACT US</Link>
                <Link to="/account" style={navLinkStyle} onClick={() => setMenuOpen(false)}>
                  👤 &nbsp; {user ? user.email.split('@')[0].toUpperCase() : 'ACCOUNT'}
                </Link>
                {user && (
                  <button onClick={() => { signOut(auth); setMenuOpen(false); }}
                    style={{ ...navLinkStyle, background: 'none', border: 'none', cursor: 'pointer', width: '100%', color: '#e74c3c', borderBottom: 'none' }}>
                    🚪 &nbsp; LOGOUT
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};


// ============================================================
// CART BOTTOM DRAWER — Step 1: Items  |  Step 2: Delivery
// ============================================================
const CartDrawer = ({ isOpen, onClose, cart, removeFromCart }) => {
  const [step, setStep] = useState(1);
  const [delivery, setDelivery] = useState({ location: '', time: 'Slot', date: '' });
  const [error, setError] = useState('');
  const total = cart.reduce((sum, item) => sum + Number(item.price), 0);

  // Reset to step 1 whenever drawer closes
  useEffect(() => {
    if (!isOpen) { const t = setTimeout(() => { setStep(1); setError(''); }, 400); return () => clearTimeout(t); }
  }, [isOpen]);

  const handleWhatsApp = () => {
    if (!delivery.location || delivery.time === 'Slot' || !delivery.date) {
      setError('Please fill in all delivery details.'); return;
    }
    const itemList = cart.map(item => `- ${item.name}`).join('%0A');
    const msg = `*NEW ORDER: FERUZA*%0A%0A*Items:*%0A${itemList}%0A%0A*Deliver to:* ${delivery.location}%0A*Date:* ${delivery.date}%0A*Time:* ${delivery.time}%0A%0A*Total: UGX ${total.toLocaleString()}*`;
    window.open(`https://wa.me/256700000000?text=${msg}`, '_blank');
  };

  const DRAWER_HEIGHT = '400px';

  return (
    <>
      <div style={{
        position: 'fixed', bottom: isOpen ? 0 : '-500px', left: 0, right: 0,
        height: DRAWER_HEIGHT, backgroundColor: '#fff', zIndex: 2000,
        transition: 'bottom 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        borderTop: '2px solid #c5a059', boxShadow: '0 -8px 30px rgba(0,0,0,0.1)',
        borderRadius: '18px 18px 0 0', display: 'flex', flexDirection: 'column',
      }}>

        {/* HANDLE + HEADER */}
        <div style={{ padding: '10px 20px 0', borderBottom: '1px solid #f5f5f5', flexShrink: 0 }}>
          <div style={{ width: '36px', height: '4px', background: '#e0e0e0', borderRadius: '2px', margin: '0 auto 10px' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {step === 2 && (
                <button onClick={() => setStep(1)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', fontSize: '20px', padding: 0 }}>←</button>
              )}
              <h2 style={{ margin: 0, fontFamily: 'Playfair Display', fontSize: '18px' }}>
                {step === 1
                  ? <>Your Bag {cart.length > 0 && <span style={{ color: '#c5a059', fontSize: '13px' }}>({cart.length} item{cart.length > 1 ? 's' : ''})</span>}</>
                  : 'Delivery Details'}
              </h2>
            </div>
            <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#bbb' }}>✕</button>
          </div>
        </div>

        {/* BODY */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '15px 20px' }}>

          {/* STEP 1 — Items list */}
          {step === 1 && (
            cart.length === 0
              ? <div style={{ textAlign: 'center', paddingTop: '40px', color: '#bbb', fontSize: '13px' }}>
                  <div style={{ fontSize: '40px', marginBottom: '10px' }}>🛍️</div>Your bag is empty
                </div>
              : cart.map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px', paddingBottom: '14px', borderBottom: '1px solid #f5f5f5' }}>
                    <img src={item.image} alt="" style={{ width: '52px', height: '52px', objectFit: 'cover', borderRadius: '6px', flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '3px' }}>{item.name}</div>
                      <div style={{ fontSize: '12px', color: '#c5a059', fontWeight: 'bold' }}>UGX {Number(item.price).toLocaleString()}</div>
                    </div>
                    <button onClick={() => removeFromCart(i)}
                      style={{ background: 'none', border: 'none', color: '#ccc', cursor: 'pointer', fontSize: '18px', flexShrink: 0 }}>✕</button>
                  </div>
                ))
          )}

          {/* STEP 2 — Delivery form */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {error && <p style={{ color: '#e74c3c', fontSize: '11px', margin: 0, padding: '8px 12px', background: '#fff5f5', borderRadius: '6px' }}>{error}</p>}

              <div>
                <label style={{ fontSize: '10px', letterSpacing: '1px', color: '#888', display: 'block', marginBottom: '6px' }}>DELIVERY LOCATION</label>
                <input type="text" placeholder="e.g. Kampala, Kololo — near X landmark"
                  value={delivery.location}
                  onChange={e => { setDelivery({ ...delivery, location: e.target.value }); setError(''); }}
                  style={inputStyle} />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '10px', letterSpacing: '1px', color: '#888', display: 'block', marginBottom: '6px' }}>DATE</label>
                  <input type="date" value={delivery.date}
                    onChange={e => { setDelivery({ ...delivery, date: e.target.value }); setError(''); }}
                    style={inputStyle} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '10px', letterSpacing: '1px', color: '#888', display: 'block', marginBottom: '6px' }}>TIME SLOT</label>
                  <select value={delivery.time}
                    onChange={e => { setDelivery({ ...delivery, time: e.target.value }); setError(''); }}
                    style={inputStyle}>
                    <option value="Slot">Choose a slot</option>
                    <option>Morning (8am–12pm)</option>
                    <option>Afternoon (12pm–5pm)</option>
                    <option>Evening (5pm–9pm)</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER — total + CTA */}
        <div style={{ padding: '12px 20px 20px', borderTop: '1px solid #f5f5f5', flexShrink: 0 }}>
          {cart.length > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '14px' }}>
              <span style={{ color: '#888' }}>Order Total</span>
              <b style={{ color: '#c5a059', fontSize: '15px' }}>UGX {total.toLocaleString()}</b>
            </div>
          )}

          {step === 1 ? (
            <button onClick={() => cart.length > 0 && setStep(2)} disabled={cart.length === 0}
              style={{ ...btnStyle, background: cart.length === 0 ? '#ddd' : '#1a1a1a', cursor: cart.length === 0 ? 'not-allowed' : 'pointer' }}>
              PROCEED TO CHECKOUT →
            </button>
          ) : (
            <button onClick={handleWhatsApp} style={{ ...btnStyle, background: '#25D366' }}>
              📲 CONFIRM ORDER ON WHATSAPP
            </button>
          )}
        </div>
      </div>

      {/* PAGE SPACER — pushes content up so drawer never covers it */}
      <div style={{ height: isOpen ? DRAWER_HEIGHT : '0px', transition: 'height 0.4s cubic-bezier(0.4, 0, 0.2, 1)', flexShrink: 0 }} />
    </>
  );
};


// ============================================================
// CUSTOM ORDER
// ============================================================
const CustomOrder = () => {
  const [selections, setSelections] = useState([]);
  const toggleItem = (item) => setSelections(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', background: '#fff', padding: '40px', border: '1px solid #eee' }}>
      <h2 style={{ textAlign: 'center', fontFamily: 'Playfair Display' }}>Bespoke Builder</h2>
      {Object.keys(CHECKLIST_OPTIONS).map(cat => (
        <div key={cat} style={{ marginBottom: '25px' }}>
          <h4 style={{ fontSize: '11px', letterSpacing: '2px', color: '#c5a059', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>{cat.toUpperCase()}</h4>
          {CHECKLIST_OPTIONS[cat].map(opt => (
            <label key={opt} style={{ display: 'block', margin: '12px 0', fontSize: '13px', cursor: 'pointer' }}>
              <input type="checkbox" onChange={() => toggleItem(opt)} checked={selections.includes(opt)} style={{ marginRight: '10px' }} /> {opt}
            </label>
          ))}
        </div>
      ))}
      <button onClick={() => window.open(`https://wa.me/256700000000?text=Custom Enq: ${selections.join(', ')}`)}
        style={{ ...btnStyle, background: '#c5a059', padding: '18px' }}>SEND TO WHATSAPP</button>
    </div>
  );
};


// ============================================================
// PRODUCT CARD
// ============================================================
const ProductCard = ({ item, addToCart }) => {
  const isOutOfStock = item.stock <= 0;
  return (
    <div className="product-card" style={{ background: '#fff', textAlign: 'center', paddingBottom: '15px', border: '1px solid #f2f2f2', position: 'relative' }}>
      {isOutOfStock && <div style={{ position: 'absolute', top: '10px', left: '10px', background: '#ff4d4d', color: '#fff', padding: '5px 10px', fontSize: '10px', fontWeight: 'bold', zIndex: 10 }}>SOLD OUT</div>}
      <div style={{ height: '230px', overflow: 'hidden', opacity: isOutOfStock ? 0.5 : 1 }}>
        <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
      <h3 style={{ fontSize: '13px', margin: '15px 5px 5px', fontFamily: 'Playfair Display', textTransform: 'uppercase', letterSpacing: '1px' }}>{item.name}</h3>
      <p style={{ color: '#c5a059', fontSize: '12px', fontWeight: 'bold', marginBottom: '15px' }}>UGX {Number(item.price).toLocaleString()}</p>
      <button onClick={() => !isOutOfStock && addToCart(item)} disabled={isOutOfStock}
        style={{ ...btnStyle, width: '90%', background: isOutOfStock ? '#ccc' : '#1a1a1a', cursor: isOutOfStock ? 'not-allowed' : 'pointer' }}>
        {isOutOfStock ? 'OUT OF STOCK' : 'ADD TO CART'}
      </button>
    </div>
  );
};


// ============================================================
// HOME PAGE
// ============================================================
const Home = ({ addToCart, searchQuery }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "products"));
        setProducts(querySnapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      } finally { setLoading(false); }
    };
    fetchProducts();
  }, []);

  const categories = ["All", "Flowers", "Perfumes", "Photo Frames", "Cakes", "Packages", "Custom"];
  const filteredProducts = products.filter(p => {
    const matchesCategory = filter === "All" || p.category === filter;
    const matchesSearch = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (loading) return <div style={{ textAlign: 'center', padding: '100px' }}>Loading Collection...</div>;

  return (
    <div style={{ backgroundColor: '#fff', minHeight: '100vh' }}>
      <div style={{ height: '50vh', backgroundImage: 'linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url("https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=1200&q=80")', backgroundSize: 'cover', backgroundPosition: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: '#fff' }}>
        <h1 style={{ fontFamily: 'Playfair Display', fontSize: 'clamp(1.8rem, 5vw, 3rem)', margin: 0, textAlign: 'center', padding: '0 20px' }}>Feruza Gift Delivery</h1>
        <p style={{ letterSpacing: '3px', fontSize: '10px', textTransform: 'uppercase', marginTop: '10px' }}>Luxury Gifting & Florals</p>
      </div>

      <div className="no-scrollbar" style={{ display: 'flex', justifyContent: 'center', gap: '15px', overflowX: 'auto', padding: '20px 15px', position: 'sticky', top: '65px', backgroundColor: '#fff', zIndex: 900, borderBottom: '1px solid #eee' }}>
        {categories.map(cat => (
          <button key={cat} onClick={() => setFilter(cat)}
            style={{ background: 'none', border: 'none', borderBottom: filter === cat ? '2px solid #c5a059' : '2px solid transparent', color: filter === cat ? '#000' : '#888', padding: '10px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', whiteSpace: 'nowrap' }}>
            {cat.toUpperCase()}
          </button>
        ))}
      </div>

      <div style={{ padding: '40px 5%' }}>
        {filter === "Custom" ? <CustomOrder /> : (
          <>
            {searchQuery && <p style={{ textAlign: 'center', fontSize: '12px', color: '#888', marginBottom: '20px' }}>{filteredProducts.length} result{filteredProducts.length !== 1 ? 's' : ''} for "<b>{searchQuery}</b>"</p>}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '30px', maxWidth: '1200px', margin: '0 auto' }}>
              {filteredProducts.map(item => <ProductCard key={item.id} item={item} addToCart={addToCart} />)}
            </div>
          </>
        )}
      </div>
    </div>
  );
};


// ============================================================
// ACCOUNT + ADMIN
// ============================================================
const UserProfile = ({ user }) => {
  const [profile, setProfile] = useState({ phone: '', address: '' });
  const [msg, setMsg] = useState('');
  useEffect(() => {
    const fetchProfile = async () => { const d = await getDoc(doc(db, "users", user.uid)); if (d.exists()) setProfile(d.data()); };
    if (user) fetchProfile();
  }, [user]);
  const save = async (e) => { e.preventDefault(); await setDoc(doc(db, "users", user.uid), profile); setMsg('Profile Updated!'); setTimeout(() => setMsg(''), 3000); };
  return (
    <div style={{ maxWidth: '500px', margin: '50px auto', padding: '30px', border: '1px solid #eee', background: '#fff' }}>
      <h2 style={{ fontFamily: 'Playfair Display' }}>Account Settings</h2>
      <p style={{ fontSize: '12px', color: '#666' }}>Email: {user.email}</p>
      <form onSubmit={save} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
        <input type="text" placeholder="Phone" value={profile.phone} onChange={e => setProfile({ ...profile, phone: e.target.value })} style={inputStyle} required />
        <textarea placeholder="Saved Address" value={profile.address} onChange={e => setProfile({ ...profile, address: e.target.value })} style={{ ...inputStyle, height: '80px' }} required />
        <button type="submit" style={btnStyle}>SAVE SETTINGS</button>
      </form>
      {msg && <p style={{ color: 'green', fontSize: '13px', textAlign: 'center' }}>{msg}</p>}
      <button onClick={() => signOut(auth)} style={{ ...btnStyle, background: '#fff', color: 'red', border: '1px solid red', marginTop: '40px' }}>LOGOUT</button>
    </div>
  );
};

const AdminPanel = () => {
  const [form, setForm] = useState({ name: '', price: '', image: '', stock: 1, category: 'Flowers' });
  const [status, setStatus] = useState('');
  const upload = async (e) => { e.preventDefault(); setStatus('Adding...'); await addDoc(collection(db, "products"), form); setStatus('Product Added!'); setForm({ name: '', price: '', image: '', stock: 1, category: 'Flowers' }); };
  return (
    <div style={{ maxWidth: '500px', margin: '50px auto', padding: '30px', border: '1px solid #eee' }}>
      <h2 style={{ fontFamily: 'Playfair Display' }}>Admin Panel</h2>
      <form onSubmit={upload} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <input type="text" placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={inputStyle} required />
        <input type="number" placeholder="Price (UGX)" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} style={inputStyle} required />
        <input type="text" placeholder="Image URL" value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} style={inputStyle} required />
        <input type="number" placeholder="Stock" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} style={inputStyle} required />
        <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} style={inputStyle}>
          <option>Flowers</option><option>Perfumes</option><option>Photo Frames</option><option>Cakes</option><option>Packages</option>
        </select>
        <button type="submit" style={btnStyle}>UPLOAD PRODUCT</button>
        {status && <p style={{ textAlign: 'center', color: '#c5a059' }}>{status}</p>}
      </form>
    </div>
  );
};


// ============================================================
// MAIN APP
// ============================================================
function App() {
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const ADMIN_UID = "PASTE_YOUR_UID_HERE";

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => setUser(u));
    return () => unsub();
  }, []);

  const addToCart = (p) => { setCart(c => [...c, p]); setIsCartOpen(true); };
  const removeFromCart = (i) => { setCart(c => c.filter((_, idx) => idx !== i)); };

  return (
    <Router>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Montserrat:wght@300;400;500&display=swap');
        * { box-sizing: border-box; }
        body { font-family: 'Montserrat', sans-serif; margin: 0; }
        .product-card:hover { transform: translateY(-5px); transition: 0.3s; box-shadow: 0 10px 20px rgba(0,0,0,0.05); }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>

      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Header user={user} cart={cart} onCartOpen={() => setIsCartOpen(o => !o)} />
        <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} cart={cart} removeFromCart={removeFromCart} />

        <div style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Home addToCart={addToCart} searchQuery={searchQuery} />} />
            <Route path="/account" element={user ? <UserProfile user={user} /> : <Auth />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/admin" element={user && user.uid === ADMIN_UID ? <AdminPanel /> : <div style={{ padding: '100px', textAlign: 'center' }}>Admin Access Restricted.</div>} />
          </Routes>
        </div>

        <footer style={{ padding: '30px', textAlign: 'center', fontSize: '10px', color: '#888', borderTop: '1px solid #eee' }}>
          © 2026 FERUZA GIFT DELIVERY
        </footer>
      </div>
    </Router>
  );
}

export default App;
