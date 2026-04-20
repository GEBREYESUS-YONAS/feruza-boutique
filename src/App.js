import React, { useState, useEffect } from 'react';
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

// --- STYLES ---
const inputStyle = { 
  padding: '12px', border: '1px solid #ddd', borderRadius: '4px',
  fontSize: '14px', outline: 'none', boxSizing: 'border-box'
};

const btnStyle = {
  padding: '12px 20px', background: '#1a1a1a', color: '#fff', 
  border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '11px', letterSpacing: '1px'
};

// --- 1. CUSTOM ORDER (BESPOKE BUILDER) ---
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
      <button onClick={() => window.open(`https://wa.me/256700000000?text=Custom Enq: ${selections.join(', ')}`)} style={{ ...btnStyle, width: '100%', background: '#c5a059', padding: '18px' }}>SEND TO WHATSAPP</button>
    </div>
  );
};

// --- 2. PRODUCT CARD ---
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
      <button onClick={() => !isOutOfStock && addToCart(item)} disabled={isOutOfStock} style={{ ...btnStyle, width: '90%', background: isOutOfStock ? '#ccc' : '#1a1a1a' }}>
        {isOutOfStock ? 'OUT OF STOCK' : 'ADD TO CART'}
      </button>
    </div>
  );
};

// --- 3. HOME PAGE (WITH HERO & FILTER) ---
const Home = ({ addToCart }) => {
  const [products, setProducts] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "products"));
        setProducts(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setLoading(false);
      } catch (error) { setLoading(false); }
    };
    fetchProducts();
  }, []);

  const categories = ["All", "Flowers", "Perfumes", "Photo Frames", "Cakes", "Packages", "Custom"];
  if (loading) return <div style={{ textAlign: 'center', padding: '100px' }}>Loading Collection...</div>;

  return (
    <div style={{ backgroundColor: '#fff', minHeight: '100vh' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Montserrat:wght@300;400;500&display=swap');
        body { font-family: 'Montserrat', sans-serif; margin: 0; }
        .product-card:hover { transform: translateY(-5px); transition: 0.3s; box-shadow: 0 10px 20px rgba(0,0,0,0.05); }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
      
      {/* HERO SECTION */}
      <div style={{ height: '50vh', backgroundImage: 'linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url("https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=1200&q=80")', backgroundSize: 'cover', backgroundPosition: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: '#fff' }}>
        <h1 style={{ fontFamily: 'Playfair Display', fontSize: '3rem', margin: 0 }}>Feruza Gift Delivery</h1>
        <p style={{ letterSpacing: '3px', fontSize: '10px', textTransform: 'uppercase', marginTop: '10px' }}>Luxury Gifting & Florals</p>
      </div>

      {/* STICKY CATEGORY FILTER */}
      <div className="no-scrollbar" style={{ display: 'flex', justifyContent: 'center', gap: '15px', overflowX: 'auto', padding: '20px 15px', position: 'sticky', top: '65px', backgroundColor: '#fff', zIndex: 900, borderBottom: '1px solid #eee' }}>
        {categories.map(cat => (
          <button key={cat} onClick={() => setFilter(cat)} style={{ background: 'none', border: 'none', borderBottom: filter === cat ? '2px solid #c5a059' : '2px solid transparent', color: filter === cat ? '#000' : '#888', padding: '10px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', whiteSpace: 'nowrap' }}>{cat.toUpperCase()}</button>
        ))}
      </div>

      <div style={{ padding: '40px 5%' }}>
        {filter === "Custom" ? <CustomOrder /> : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '30px', maxWidth: '1200px', margin: '0 auto' }}>
            {products.filter(p => filter === "All" || p.category === filter).map(item => <ProductCard key={item.id} item={item} addToCart={addToCart} />)}
          </div>
        )}
      </div>
    </div>
  );
};

// --- 4. CART SIDEBAR (FULL DELIVERY LOGIC) ---
const CartSidebar = ({ isOpen, onClose, cart, removeFromCart }) => {
  const [delivery, setDelivery] = useState({ location: '', time: 'Slot', date: '' });
  const [error, setError] = useState('');
  const total = cart.reduce((sum, item) => sum + Number(item.price), 0);

  const handleWhatsAppCheckout = () => {
    if (cart.length === 0) return;
    if (!delivery.location || delivery.time === 'Slot' || !delivery.date) {
      setError('Complete delivery details first.'); return;
    }
    const itemList = cart.map(item => `- ${item.name}`).join('%0A');
    const message = `*NEW ORDER: FERUZA*%0A%0A*Items:*%0A${itemList}%0A%0A*Delivery:* ${delivery.location}%0A*Date:* ${delivery.date}%0A*Time:* ${delivery.time}%0A%0A*Total: UGX ${total.toLocaleString()}*`;
    window.open(`https://wa.me/256700000000?text=${message}`, '_blank');
  };

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1500, display: isOpen ? 'block' : 'none' }} />
      <div style={{ position: 'fixed', top: 0, right: isOpen ? 0 : '-450px', width: '100%', maxWidth: '400px', height: '100%', backgroundColor: '#fff', zIndex: 2000, transition: '0.4s ease', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontFamily: 'Playfair Display' }}>Bag</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>✕</button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          {cart.map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
              <img src={item.image} alt="" style={{ width: '50px', height: '50px', objectFit: 'cover' }} />
              <div style={{ flex: 1, fontSize: '13px' }}>{item.name}<br/><b>UGX {Number(item.price).toLocaleString()}</b></div>
              <button onClick={() => removeFromCart(i)} style={{ border: 'none', background: 'none', color: '#ccc', cursor: 'pointer' }}>✕</button>
            </div>
          ))}
          {cart.length > 0 && (
            <div style={{ marginTop: '20px', background: '#fdfbf7', padding: '15px', border: '1px solid #f0ece3' }}>
              <h4 style={{ fontSize: '10px', letterSpacing: '1px', marginBottom: '10px' }}>DELIVERY DETAILS</h4>
              {error && <p style={{ color: 'red', fontSize: '10px' }}>{error}</p>}
              <input type="text" placeholder="Delivery Location" onChange={e => setDelivery({...delivery, location: e.target.value})} style={{ ...inputStyle, width: '100%', marginBottom: '10px' }} />
              <div style={{ display: 'flex', gap: '10px' }}>
                <input type="date" onChange={e => setDelivery({...delivery, date: e.target.value})} style={{ ...inputStyle, flex: 1 }} />
                <select onChange={e => setDelivery({...delivery, time: e.target.value})} style={{ ...inputStyle, flex: 1 }}>
                  <option>Slot</option><option>Morning</option><option>Afternoon</option><option>Evening</option>
                </select>
              </div>
            </div>
          )}
        </div>
        <div style={{ padding: '20px', borderTop: '1px solid #eee' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}><b>Total:</b> <b style={{color:'#c5a059'}}>UGX {total.toLocaleString()}</b></div>
          <button onClick={handleWhatsAppCheckout} style={{ ...btnStyle, width: '100%', padding: '15px' }}>ORDER VIA WHATSAPP</button>
        </div>
      </div>
    </>
  );
};

// --- 5. ACCOUNT SETTINGS PAGE ---
const UserProfile = ({ user }) => {
  const [profile, setProfile] = useState({ phone: '', address: '' });
  const [msg, setMsg] = useState('');

  useEffect(() => {
    const fetch = async () => {
      const d = await getDoc(doc(db, "users", user.uid));
      if (d.exists()) setProfile(d.data());
    };
    if (user) fetch();
  }, [user]);

  const save = async (e) => {
    e.preventDefault();
    await setDoc(doc(db, "users", user.uid), profile);
    setMsg('Profile Updated!');
    setTimeout(() => setMsg(''), 3000);
  };

  return (
    <div style={{ maxWidth: '500px', margin: '50px auto', padding: '30px', border: '1px solid #eee', background: '#fff' }}>
      <h2 style={{ fontFamily: 'Playfair Display' }}>Account Settings</h2>
      <p style={{ fontSize: '12px', color: '#666' }}>Email: {user.email}</p>
      <form onSubmit={save} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
        <input type="text" placeholder="Phone" value={profile.phone} onChange={e => setProfile({...profile, phone: e.target.value})} style={inputStyle} required />
        <textarea placeholder="Saved Address" value={profile.address} onChange={e => setProfile({...profile, address: e.target.value})} style={{...inputStyle, height: '80px'}} required />
        <button type="submit" style={btnStyle}>SAVE SETTINGS</button>
      </form>
      {msg && <p style={{ color: 'green', fontSize: '13px', textAlign: 'center' }}>{msg}</p>}
      <button onClick={() => signOut(auth)} style={{ ...btnStyle, background: '#fff', color: 'red', border: '1px solid red', width: '100%', marginTop: '40px' }}>LOGOUT</button>
    </div>
  );
};

// --- 6. ADMIN PANEL ---
const AdminPanel = () => {
  const [form, setForm] = useState({ name: '', price: '', image: '', stock: 1, category: 'Flowers' });
  const [status, setStatus] = useState('');

  const upload = async (e) => {
    e.preventDefault();
    setStatus('Adding...');
    await addDoc(collection(db, "products"), form);
    setStatus('Product Added!');
    setForm({ name: '', price: '', image: '', stock: 1, category: 'Flowers' });
  };

  return (
    <div style={{ maxWidth: '500px', margin: '50px auto', padding: '30px', border: '1px solid #eee' }}>
      <h2 style={{ fontFamily: 'Playfair Display' }}>Admin Panel</h2>
      <form onSubmit={upload} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <input type="text" placeholder="Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} style={inputStyle} required />
        <input type="number" placeholder="Price (UGX)" value={form.price} onChange={e => setForm({...form, price: e.target.value})} style={inputStyle} required />
        <input type="text" placeholder="Image URL" value={form.image} onChange={e => setForm({...form, image: e.target.value})} style={inputStyle} required />
        <input type="number" placeholder="Stock" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} style={inputStyle} required />
        <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} style={inputStyle}>
          <option>Flowers</option><option>Perfumes</option><option>Photo Frames</option><option>Cakes</option><option>Packages</option>
        </select>
        <button type="submit" style={btnStyle}>UPLOAD PRODUCT</button>
        {status && <p style={{ textAlign: 'center', color: '#c5a059' }}>{status}</p>}
      </form>
    </div>
  );
};

// --- MAIN APP ---
function App() {
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const ADMIN_UID = "PASTE_YOUR_UID_HERE";

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => setUser(u));
    return () => unsub();
  }, []);

  const addToCart = (p) => { setCart([...cart, p]); setIsCartOpen(true); };
  const removeFromCart = (i) => { const newCart = [...cart]; newCart.splice(i, 1); setCart(newCart); };

  return (
    <Router>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        
        {/* HEADER */}
        <header style={{ padding: '15px 5%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', background: '#fff', position: 'sticky', top: 0, zIndex: 1000 }}>
          <Link to="/" style={{ textDecoration: 'none', color: '#000', fontSize: '20px', fontWeight: 'bold', fontFamily: 'Playfair Display' }}>FERUZA</Link>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center', fontSize: '11px', fontWeight: 'bold' }}>
            {user ? (
              <>
                <Link to="/account" style={{ textDecoration: 'none', color: '#c5a059' }}>{user.email.split('@')[0].toUpperCase()}</Link>
                <button onClick={() => signOut(auth)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999', fontSize: '10px' }}>LOGOUT</button>
              </>
            ) : (
              <Link to="/account" style={{ textDecoration: 'none', color: '#000' }}>LOGIN</Link>
            )}
            <button onClick={() => setIsCartOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>BAG ({cart.length})</button>
          </div>
        </header>

        <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} cart={cart} removeFromCart={removeFromCart} />

        <div style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Home addToCart={addToCart} />} />
            <Route path="/account" element={user ? <UserProfile user={user} /> : <Auth />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/admin" element={user && user.uid === ADMIN_UID ? <AdminPanel /> : <div style={{padding:'100px', textAlign:'center'}}>Admin Access Restricted.</div>} />
          </Routes>
        </div>

        <footer style={{ padding: '30px', textAlign: 'center', fontSize: '10px', color: '#888', borderTop: '1px solid #eee' }}>© 2026 FERUZA GIFT DELIVERY</footer>
      </div>
    </Router>
  );
}

export default App;