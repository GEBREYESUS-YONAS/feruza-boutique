import React, { useState, useEffect, useRef, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

// Firebase Imports
import { auth, db } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, getDocs, addDoc, doc, getDoc, setDoc } from 'firebase/firestore';

// Component Imports
import Auth from './components/Auth';
import Contact from './pages/Contact';

// ============================================================
// ⚠️  CONFIGURATION — fill these in
// ============================================================
const FLW_PUBLIC_KEY = 'YOUR_FLUTTERWAVE_PUBLIC_KEY'; // from dashboard.flutterwave.com
const WHATSAPP_NUMBER = '256700000000';               // your WhatsApp number with country code

// ============================================================
// PACKAGES DATA
// ============================================================
const PACKAGES = [
  {
    id: 'pkg-marry-me',
    name: 'Marry Me',
    tagline: 'Make the moment unforgettable',
    description: 'Red roses, a luxury ring box setup, champagne, personalised message card & rose petal arrangement.',
    price: 'From UGX 350,000',
    image: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=600&q=80',
    emoji: '💍',
  },
  {
    id: 'pkg-birthday',
    name: 'Birthday',
    tagline: 'Celebrate every year in style',
    description: 'Custom cake, balloon arrangement, flowers, birthday card & a curated gift item of your choice.',
    price: 'From UGX 180,000',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=600&q=80',
    emoji: '🎂',
  },
  {
    id: 'pkg-honeymoon',
    name: 'Honeymoon',
    tagline: 'Romance, delivered',
    description: 'Rose petal room setup, luxury candles, chocolate box, perfume duo & a handwritten love note.',
    price: 'From UGX 420,000',
    image: 'https://images.unsplash.com/photo-1529636798458-92182e662485?auto=format&fit=crop&w=600&q=80',
    emoji: '🌹',
  },
  {
    id: 'pkg-anniversary',
    name: 'Anniversary',
    tagline: 'Another year of love',
    description: 'Mixed bouquet, photo frame, luxury candle, chocolates & a personalised anniversary card.',
    price: 'From UGX 220,000',
    image: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=600&q=80',
    emoji: '💑',
  },
  {
    id: 'pkg-welcome',
    name: 'Welcome / Farewell',
    tagline: 'Arrivals & goodbyes done beautifully',
    description: 'Welcome basket with fruits, flowers, a warm message card & a locally crafted gift item.',
    price: 'From UGX 160,000',
    image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=600&q=80',
    emoji: '🎁',
  },
  {
    id: 'pkg-wedding',
    name: 'Wedding',
    tagline: 'Your big day, beautifully adorned',
    description: 'Bridal bouquet, table floral arrangements, gift hampers for the couple & decorative accents.',
    price: 'From UGX 850,000',
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80',
    emoji: '👰',
  },
];

const CHECKLIST_OPTIONS = {
  Flowers: ["Red Roses", "White Lilies", "Mixed Bouquet", "Sunflowers"],
  Items: ["Perfume", "Photo Frame", "Chocolate Box", "Luxury Candle"],
  Cakes: ["Red Velvet", "Chocolate Fudge", "Vanilla Cream", "Fruit Cake"]
};

// ============================================================
// STYLES
// ============================================================
const inputStyle = {
  padding: '12px', border: '1px solid #ddd', borderRadius: '6px',
  fontSize: '14px', outline: 'none', boxSizing: 'border-box', width: '100%',
};
const btnStyle = {
  padding: '14px 20px', background: '#1a1a1a', color: '#fff',
  border: 'none', cursor: 'pointer', fontWeight: 'bold',
  fontSize: '11px', letterSpacing: '1px', borderRadius: '6px', width: '100%',
};


// ============================================================
// LOAD FLUTTERWAVE SCRIPT (once, on mount)
// ============================================================
const useFlutterwaveScript = () => {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (document.getElementById('flw-script')) { setReady(true); return; }
    const script = document.createElement('script');
    script.id = 'flw-script';
    script.src = 'https://checkout.flutterwave.com/v3.js';
    script.onload = () => setReady(true);
    document.body.appendChild(script);
  }, []);
  return ready;
};


// ============================================================
// HEADER
// ============================================================
const Header = ({ user, cart, onCartOpen, onPackagesClick }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
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
      padding: '0 4%', height: '65px',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      borderBottom: '1px solid #eee', background: '#fff',
      position: 'sticky', top: 0, zIndex: 1000,
    }}>
      <Link to="/" style={{ textDecoration: 'none', color: '#000', fontFamily: 'Playfair Display', fontSize: '20px', letterSpacing: '2px', flexShrink: 0 }}>
        FERUZA
      </Link>

      {isSearchOpen && (
        <div style={{ flex: 1, margin: '0 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input autoFocus type="search" placeholder="Search gifts, flowers, cakes..."
            style={{ ...inputStyle, padding: '8px 14px', fontSize: '13px' }} />
          <button onClick={() => setIsSearchOpen(false)}
            style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#999', flexShrink: 0 }}>✕</button>
        </div>
      )}

      {!isSearchOpen && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
          <button onClick={onPackagesClick}
            style={{
              background: '#c5a059', color: '#fff', border: 'none',
              borderRadius: '20px', padding: '7px 14px',
              fontSize: '10px', fontWeight: 'bold', letterSpacing: '1px',
              cursor: 'pointer', flexShrink: 0, marginRight: '4px',
            }}>
            🎁 PACKAGES
          </button>

          <button onClick={() => setIsSearchOpen(true)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', padding: '8px' }}>🔍</button>

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
// CART BOTTOM DRAWER — 3 steps
//   Step 1 → Items list
//   Step 2 → Delivery details (name, email, phone, address, date, slot)
//   Step 3 → Payment choice: Card (Flutterwave) OR WhatsApp
// ============================================================
const CartDrawer = ({ isOpen, onClose, cart, removeFromCart }) => {
  const flwReady = useFlutterwaveScript();

  const [step, setStep] = useState(1);
  const [delivery, setDelivery] = useState({
    name: '', email: '', phone: '', location: '', date: '', time: 'Choose a slot',
  });
  const [errors, setErrors] = useState({});
  const [paymentStatus, setPaymentStatus] = useState(null); // null | 'success' | 'failed'

  const total = cart.reduce((sum, item) => sum + Number(item.price), 0);

  // Reset everything when drawer closes
  useEffect(() => {
    if (!isOpen) {
      const t = setTimeout(() => {
        setStep(1);
        setErrors({});
        setPaymentStatus(null);
      }, 400);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  // Basic validation for step 2
  const validateDelivery = () => {
    const e = {};
    if (!delivery.name.trim()) e.name = 'Required';
    if (!delivery.email.trim() || !/\S+@\S+\.\S+/.test(delivery.email)) e.email = 'Valid email required';
    if (!delivery.phone.trim()) e.phone = 'Required';
    if (!delivery.location.trim()) e.location = 'Required';
    if (!delivery.date) e.date = 'Required';
    if (delivery.time === 'Choose a slot') e.time = 'Please choose a slot';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleProceedToPayment = () => {
    if (validateDelivery()) setStep(3);
  };

  // ── Flutterwave card payment ──
  const handleCardPayment = () => {
    if (!flwReady || !window.FlutterwaveCheckout) {
      alert('Payment is loading, please try again in a moment.');
      return;
    }
    const txRef = `FERUZA-${Date.now()}`;
    window.FlutterwaveCheckout({
      public_key: FLW_PUBLIC_KEY,
      tx_ref: txRef,
      amount: total,
      currency: 'UGX',
      payment_options: 'card,mobilemoneyuganda',
      customer: {
        email: delivery.email,
        phone_number: delivery.phone,
        name: delivery.name,
      },
      customizations: {
        title: 'Feruza Gift Delivery',
        description: cart.map(i => i.name).join(', '),
        logo: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?w=80&h=80&fit=crop',
      },
      meta: {
        delivery_location: delivery.location,
        delivery_date: delivery.date,
        delivery_time: delivery.time,
      },
      callback: (response) => {
        if (response.status === 'successful' || response.status === 'completed') {
          setPaymentStatus('success');
          // Optionally save order to Firestore here
        } else {
          setPaymentStatus('failed');
        }
      },
      onclose: () => {
        // User closed modal without completing — stay on step 3
      },
    });
  };

  // ── WhatsApp order ──
  const handleWhatsApp = () => {
    const itemList = cart.map(i => `- ${i.name}`).join('%0A');
    const msg = [
      `*NEW ORDER: FERUZA*`,
      ``,
      `*Customer:* ${delivery.name}`,
      `*Phone:* ${delivery.phone}`,
      `*Email:* ${delivery.email}`,
      ``,
      `*Items:*`,
      cart.map(i => `- ${i.name}`).join('\n'),
      ``,
      `*Deliver to:* ${delivery.location}`,
      `*Date:* ${delivery.date}`,
      `*Time:* ${delivery.time}`,
      ``,
      `*Total: UGX ${total.toLocaleString()}*`,
    ].join('%0A');
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, '_blank');
  };

  const DRAWER_HEIGHT = step === 2 ? '480px' : '420px';

  const fieldError = (key) => errors[key]
    ? <span style={{ color: '#e74c3c', fontSize: '10px', marginTop: '3px', display: 'block' }}>{errors[key]}</span>
    : null;

  const label = (text) => (
    <label style={{ fontSize: '10px', letterSpacing: '1px', color: '#888', display: 'block', marginBottom: '5px' }}>
      {text}
    </label>
  );

  return (
    <>
      <div style={{
        position: 'fixed', bottom: isOpen ? 0 : '-600px', left: 0, right: 0,
        height: DRAWER_HEIGHT, backgroundColor: '#fff', zIndex: 2000,
        transition: 'bottom 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        borderTop: '2px solid #c5a059', boxShadow: '0 -8px 30px rgba(0,0,0,0.1)',
        borderRadius: '18px 18px 0 0', display: 'flex', flexDirection: 'column',
      }}>

        {/* ── HANDLE + HEADER ── */}
        <div style={{ padding: '10px 20px 0', borderBottom: '1px solid #f5f5f5', flexShrink: 0 }}>
          <div style={{ width: '36px', height: '4px', background: '#e0e0e0', borderRadius: '2px', margin: '0 auto 10px' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {step > 1 && step < 4 && !paymentStatus && (
                <button onClick={() => setStep(s => s - 1)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', fontSize: '20px', padding: 0, lineHeight: 1 }}>←</button>
              )}
              <h2 style={{ margin: 0, fontFamily: 'Playfair Display', fontSize: '18px' }}>
                {paymentStatus === 'success' ? 'Order Confirmed 🎉'
                  : paymentStatus === 'failed' ? 'Payment Failed'
                  : step === 1 ? <>Your Bag {cart.length > 0 && <span style={{ color: '#c5a059', fontSize: '13px' }}>({cart.length})</span>}</>
                  : step === 2 ? 'Delivery Details'
                  : 'How would you like to pay?'}
              </h2>
            </div>
            <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#bbb' }}>✕</button>
          </div>

          {/* STEP INDICATOR */}
          {!paymentStatus && (
            <div style={{ display: 'flex', gap: '6px', paddingBottom: '12px' }}>
              {[1, 2, 3].map(s => (
                <div key={s} style={{
                  flex: 1, height: '3px', borderRadius: '2px',
                  background: step >= s ? '#c5a059' : '#eee',
                  transition: 'background 0.3s',
                }} />
              ))}
            </div>
          )}
        </div>

        {/* ── BODY ── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>

          {/* STEP 1 — Items */}
          {step === 1 && !paymentStatus && (
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
                      style={{ background: 'none', border: 'none', color: '#ccc', cursor: 'pointer', fontSize: '18px' }}>✕</button>
                  </div>
                ))
          )}

          {/* STEP 2 — Delivery form */}
          {step === 2 && !paymentStatus && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1 }}>
                  {label('FULL NAME')}
                  <input type="text" placeholder="Jane Doe" value={delivery.name}
                    onChange={e => { setDelivery({ ...delivery, name: e.target.value }); setErrors({ ...errors, name: '' }); }}
                    style={{ ...inputStyle, borderColor: errors.name ? '#e74c3c' : '#ddd' }} />
                  {fieldError('name')}
                </div>
                <div style={{ flex: 1 }}>
                  {label('PHONE')}
                  <input type="tel" placeholder="+256 700 000 000" value={delivery.phone}
                    onChange={e => { setDelivery({ ...delivery, phone: e.target.value }); setErrors({ ...errors, phone: '' }); }}
                    style={{ ...inputStyle, borderColor: errors.phone ? '#e74c3c' : '#ddd' }} />
                  {fieldError('phone')}
                </div>
              </div>
              <div>
                {label('EMAIL (for payment receipt)')}
                <input type="email" placeholder="you@example.com" value={delivery.email}
                  onChange={e => { setDelivery({ ...delivery, email: e.target.value }); setErrors({ ...errors, email: '' }); }}
                  style={{ ...inputStyle, borderColor: errors.email ? '#e74c3c' : '#ddd' }} />
                {fieldError('email')}
              </div>
              <div>
                {label('DELIVERY LOCATION')}
                <input type="text" placeholder="e.g. Kampala, Kololo — near X landmark" value={delivery.location}
                  onChange={e => { setDelivery({ ...delivery, location: e.target.value }); setErrors({ ...errors, location: '' }); }}
                  style={{ ...inputStyle, borderColor: errors.location ? '#e74c3c' : '#ddd' }} />
                {fieldError('location')}
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1 }}>
                  {label('DATE')}
                  <input type="date" value={delivery.date}
                    onChange={e => { setDelivery({ ...delivery, date: e.target.value }); setErrors({ ...errors, date: '' }); }}
                    style={{ ...inputStyle, borderColor: errors.date ? '#e74c3c' : '#ddd' }} />
                  {fieldError('date')}
                </div>
                <div style={{ flex: 1 }}>
                  {label('TIME SLOT')}
                  <select value={delivery.time}
                    onChange={e => { setDelivery({ ...delivery, time: e.target.value }); setErrors({ ...errors, time: '' }); }}
                    style={{ ...inputStyle, borderColor: errors.time ? '#e74c3c' : '#ddd' }}>
                    <option disabled>Choose a slot</option>
                    <option>Morning (8am–12pm)</option>
                    <option>Afternoon (12pm–5pm)</option>
                    <option>Evening (5pm–9pm)</option>
                  </select>
                  {fieldError('time')}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3 — Payment options */}
          {step === 3 && !paymentStatus && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingTop: '8px' }}>

              {/* Order summary pill */}
              <div style={{ background: '#fdfbf7', border: '1px solid #f0ece3', borderRadius: '8px', padding: '12px 16px', fontSize: '12px', color: '#666' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>{cart.length} item{cart.length > 1 ? 's' : ''} · {delivery.date} · {delivery.time}</span>
                </div>
                <div style={{ fontSize: '11px', color: '#999' }}>📍 {delivery.location}</div>
              </div>

              {/* Card payment button */}
              <button onClick={handleCardPayment}
                style={{
                  ...btnStyle,
                  background: 'linear-gradient(135deg, #1a1a1a 0%, #333 100%)',
                  padding: '18px', fontSize: '13px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
                }}>
                <span style={{ fontSize: '20px' }}>💳</span>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 'bold', letterSpacing: '1px' }}>PAY BY CARD OR MOBILE MONEY</div>
                  <div style={{ fontSize: '10px', opacity: 0.7, fontWeight: 'normal', marginTop: '2px' }}>Visa · Mastercard · MTN · Airtel · Secure checkout</div>
                </div>
              </button>

              {/* Divider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#ccc', fontSize: '11px' }}>
                <div style={{ flex: 1, height: '1px', background: '#eee' }} />
                OR
                <div style={{ flex: 1, height: '1px', background: '#eee' }} />
              </div>

              {/* WhatsApp button */}
              <button onClick={handleWhatsApp}
                style={{
                  ...btnStyle,
                  background: '#25D366',
                  padding: '18px', fontSize: '13px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                }}>
                <span style={{ fontSize: '20px' }}>📲</span>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 'bold', letterSpacing: '1px' }}>ORDER VIA WHATSAPP</div>
                  <div style={{ fontSize: '10px', opacity: 0.85, fontWeight: 'normal', marginTop: '2px' }}>We'll confirm & arrange payment manually</div>
                </div>
              </button>

              <p style={{ textAlign: 'center', fontSize: '10px', color: '#bbb', margin: 0 }}>
                🔒 Card payments are secured by Flutterwave
              </p>
            </div>
          )}

          {/* SUCCESS STATE */}
          {paymentStatus === 'success' && (
            <div style={{ textAlign: 'center', padding: '20px 10px' }}>
              <div style={{ fontSize: '56px', marginBottom: '16px' }}>🎉</div>
              <h3 style={{ fontFamily: 'Playfair Display', margin: '0 0 10px', fontSize: '20px' }}>Payment Confirmed!</h3>
              <p style={{ color: '#666', fontSize: '13px', lineHeight: '1.7', margin: '0 0 20px' }}>
                Thank you, <b>{delivery.name}</b>! Your order is confirmed and will be delivered to <b>{delivery.location}</b> on <b>{delivery.date}</b> ({delivery.time}).
              </p>
              <p style={{ color: '#888', fontSize: '11px' }}>A confirmation will be sent to <b>{delivery.email}</b></p>
            </div>
          )}

          {/* FAILED STATE */}
          {paymentStatus === 'failed' && (
            <div style={{ textAlign: 'center', padding: '20px 10px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>😔</div>
              <h3 style={{ fontFamily: 'Playfair Display', margin: '0 0 10px' }}>Payment Unsuccessful</h3>
              <p style={{ color: '#666', fontSize: '13px', margin: '0 0 20px' }}>Something went wrong with your payment. You can try again or order via WhatsApp.</p>
              <button onClick={() => setPaymentStatus(null)} style={{ ...btnStyle, marginBottom: '10px' }}>TRY AGAIN</button>
              <button onClick={handleWhatsApp} style={{ ...btnStyle, background: '#25D366' }}>ORDER VIA WHATSAPP</button>
            </div>
          )}
        </div>

        {/* ── FOOTER ── */}
        {!paymentStatus && (
          <div style={{ padding: '12px 20px 20px', borderTop: '1px solid #f5f5f5', flexShrink: 0 }}>
            {cart.length > 0 && step !== 3 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '14px' }}>
                <span style={{ color: '#888' }}>Order Total</span>
                <b style={{ color: '#c5a059', fontSize: '15px' }}>UGX {total.toLocaleString()}</b>
              </div>
            )}

            {step === 1 && (
              <button onClick={() => cart.length > 0 && setStep(2)} disabled={cart.length === 0}
                style={{ ...btnStyle, background: cart.length === 0 ? '#ddd' : '#1a1a1a', cursor: cart.length === 0 ? 'not-allowed' : 'pointer' }}>
                PROCEED TO CHECKOUT →
              </button>
            )}

            {step === 2 && (
              <button onClick={handleProceedToPayment} style={btnStyle}>
                CHOOSE PAYMENT METHOD →
              </button>
            )}
          </div>
        )}

        {/* Success close button */}
        {paymentStatus === 'success' && (
          <div style={{ padding: '12px 20px 20px', flexShrink: 0 }}>
            <button onClick={onClose} style={{ ...btnStyle, background: '#c5a059' }}>CLOSE</button>
          </div>
        )}
      </div>

      {/* PAGE SPACER */}
      <div style={{ height: isOpen ? DRAWER_HEIGHT : '0px', transition: 'height 0.4s cubic-bezier(0.4, 0, 0.2, 1)', flexShrink: 0 }} />
    </>
  );
};


// ============================================================
// PACKAGES SECTION
// ============================================================
const PackagesSection = () => (
  <div style={{ padding: '50px 5%', backgroundColor: '#fdfbf7' }}>
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h2 style={{ fontFamily: 'Playfair Display', fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', margin: '0 0 10px' }}>Curated Packages</h2>
        <p style={{ color: '#888', fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase' }}>Thoughtfully assembled for every occasion</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', gap: '24px' }}>
        {PACKAGES.map(pkg => (
          <div key={pkg.id} style={{ background: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 16px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', transition: 'transform 0.3s, box-shadow 0.3s' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 16px rgba(0,0,0,0.06)'; }}>
            <div style={{ height: '200px', overflow: 'hidden', position: 'relative' }}>
              <img src={pkg.image} alt={pkg.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(255,255,255,0.9)', borderRadius: '50%', width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>{pkg.emoji}</div>
            </div>
            <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ fontFamily: 'Playfair Display', fontSize: '18px', margin: '0 0 4px' }}>{pkg.name}</h3>
              <p style={{ fontSize: '10px', letterSpacing: '2px', color: '#c5a059', textTransform: 'uppercase', margin: '0 0 10px' }}>{pkg.tagline}</p>
              <p style={{ fontSize: '12px', color: '#666', lineHeight: '1.7', margin: '0 0 16px', flex: 1 }}>{pkg.description}</p>
              <div style={{ fontWeight: 'bold', color: '#c5a059', fontSize: '13px', marginBottom: '16px' }}>{pkg.price}</div>
              <button onClick={() => window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=Hi! I'm interested in the *${pkg.name} Package* (${pkg.price}). Please share more details.`, '_blank')}
                style={{ ...btnStyle, padding: '12px', fontSize: '10px' }}>
                ENQUIRE ON WHATSAPP
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);


// ============================================================
// CUSTOM ORDER
// ============================================================
const CustomOrder = () => {
  const [selections, setSelections] = useState([]);
  const toggleItem = (item) => setSelections(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', background: '#fff', padding: '40px', border: '1px solid #eee', borderRadius: '8px' }}>
      <h2 style={{ textAlign: 'center', fontFamily: 'Playfair Display', marginTop: 0 }}>Bespoke Builder</h2>
      <p style={{ textAlign: 'center', fontSize: '12px', color: '#888', marginBottom: '30px' }}>Pick any items and we'll put it together for you</p>
      {Object.keys(CHECKLIST_OPTIONS).map(cat => (
        <div key={cat} style={{ marginBottom: '25px' }}>
          <h4 style={{ fontSize: '11px', letterSpacing: '2px', color: '#c5a059', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>{cat.toUpperCase()}</h4>
          {CHECKLIST_OPTIONS[cat].map(opt => (
            <label key={opt} style={{ display: 'block', margin: '12px 0', fontSize: '13px', cursor: 'pointer' }}>
              <input type="checkbox" onChange={() => toggleItem(opt)} checked={selections.includes(opt)} style={{ marginRight: '10px', accentColor: '#c5a059' }} /> {opt}
            </label>
          ))}
        </div>
      ))}
      <button onClick={() => window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=Custom Enq: ${selections.join(', ')}`)}
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
    <div className="product-card" style={{ background: '#fff', textAlign: 'center', paddingBottom: '15px', border: '1px solid #f2f2f2', borderRadius: '8px', position: 'relative', overflow: 'hidden' }}>
      {isOutOfStock && <div style={{ position: 'absolute', top: '10px', left: '10px', background: '#ff4d4d', color: '#fff', padding: '4px 8px', fontSize: '9px', fontWeight: 'bold', zIndex: 10, borderRadius: '3px' }}>SOLD OUT</div>}
      <div style={{ height: '200px', overflow: 'hidden', opacity: isOutOfStock ? 0.5 : 1 }}>
        <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
      <h3 style={{ fontSize: '12px', margin: '12px 8px 4px', fontFamily: 'Playfair Display', textTransform: 'uppercase', letterSpacing: '1px', lineHeight: '1.4' }}>{item.name}</h3>
      <p style={{ color: '#c5a059', fontSize: '12px', fontWeight: 'bold', margin: '0 0 12px' }}>UGX {Number(item.price).toLocaleString()}</p>
      <button onClick={() => !isOutOfStock && addToCart(item)} disabled={isOutOfStock}
        style={{ ...btnStyle, width: '85%', background: isOutOfStock ? '#ccc' : '#1a1a1a', padding: '11px', cursor: isOutOfStock ? 'not-allowed' : 'pointer' }}>
        {isOutOfStock ? 'OUT OF STOCK' : 'ADD TO CART'}
      </button>
    </div>
  );
};


// ============================================================
// HOME PAGE
// ============================================================
const Home = ({ addToCart, searchQuery, showPackages, onPackagesSeen }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('Packages');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const snap = await getDocs(collection(db, "products"));
        setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } finally { setLoading(false); }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    if (showPackages) { setFilter('Packages'); onPackagesSeen(); }
  }, [showPackages, onPackagesSeen]);

  const categories = ['Packages', 'All', 'Flowers', 'Perfumes', 'Photo Frames', 'Cakes', 'Custom'];
  const filteredProducts = products.filter(p => {
    const matchesCategory = filter === 'All' || p.category === filter;
    const matchesSearch = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (loading) return <div style={{ textAlign: 'center', padding: '100px', color: '#888' }}>Loading Collection...</div>;

  return (
    <div style={{ backgroundColor: '#fff', minHeight: '100vh' }}>
      <div style={{ height: '50vh', backgroundImage: 'linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.45)), url("https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=1200&q=80")', backgroundSize: 'cover', backgroundPosition: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: '#fff', textAlign: 'center', padding: '0 20px' }}>
        <h1 style={{ fontFamily: 'Playfair Display', fontSize: 'clamp(1.8rem, 5vw, 3rem)', margin: '0 0 10px' }}>Feruza Gift Delivery</h1>
        <p style={{ letterSpacing: '3px', fontSize: '10px', textTransform: 'uppercase', margin: 0, opacity: 0.85 }}>Luxury Gifting & Florals · Kampala</p>
      </div>

      <div className="no-scrollbar" style={{ display: 'flex', overflowX: 'auto', position: 'sticky', top: '65px', backgroundColor: '#fff', zIndex: 900, borderBottom: '2px solid #f0f0f0', padding: '0 5%' }}>
        {categories.map(cat => (
          <button key={cat} onClick={() => setFilter(cat)}
            style={{ background: 'none', border: 'none', borderBottom: filter === cat ? '2px solid #c5a059' : '2px solid transparent', color: filter === cat ? (cat === 'Packages' ? '#c5a059' : '#1a1a1a') : '#999', padding: '14px 16px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer', whiteSpace: 'nowrap', letterSpacing: '1px', marginBottom: '-2px' }}>
            {cat === 'Packages' ? '🎁 ' : ''}{cat.toUpperCase()}
          </button>
        ))}
      </div>

      <div style={{ padding: '40px 5%' }}>
        {filter === 'Packages' && <PackagesSection />}
        {filter === 'Custom' && <CustomOrder />}
        {filter !== 'Packages' && filter !== 'Custom' && (
          <>
            {searchQuery && <p style={{ textAlign: 'center', fontSize: '12px', color: '#888', marginBottom: '24px' }}>{filteredProducts.length} result{filteredProducts.length !== 1 ? 's' : ''} for "<b>{searchQuery}</b>"</p>}
            <div className="product-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', maxWidth: '1200px', margin: '0 auto' }}>
              {filteredProducts.length === 0
                ? <p style={{ gridColumn: '1/-1', textAlign: 'center', color: '#bbb', padding: '60px 0' }}>No products found.</p>
                : filteredProducts.map(item => <ProductCard key={item.id} item={item} addToCart={addToCart} />)
              }
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
    <div style={{ maxWidth: '500px', margin: '50px auto', padding: '30px', border: '1px solid #eee', background: '#fff', borderRadius: '8px' }}>
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
    <div style={{ maxWidth: '500px', margin: '50px auto', padding: '30px', border: '1px solid #eee', borderRadius: '8px' }}>
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
  const [showPackages, setShowPackages] = useState(false);
  const ADMIN_UID = "PASTE_YOUR_UID_HERE";

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => setUser(u));
    return () => unsub();
  }, []);

  const addToCart = (p) => { setCart(c => [...c, p]); setIsCartOpen(true); };
  const removeFromCart = (i) => { setCart(c => c.filter((_, idx) => idx !== i)); };
  const handlePackagesSeen = useCallback(() => setShowPackages(false), []);

  return (
    <Router>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Montserrat:wght@300;400;500&display=swap');
        * { box-sizing: border-box; }
        body { font-family: 'Montserrat', sans-serif; margin: 0; }
        .product-card:hover { transform: translateY(-4px); transition: 0.3s; box-shadow: 0 8px 20px rgba(0,0,0,0.08); }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        @media (min-width: 600px) { .product-grid { grid-template-columns: repeat(3, 1fr) !important; gap: 20px !important; } }
        @media (min-width: 900px) { .product-grid { grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)) !important; gap: 28px !important; } }
      `}</style>

      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Header user={user} cart={cart} onCartOpen={() => setIsCartOpen(o => !o)} onPackagesClick={() => setShowPackages(true)} />
        <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} cart={cart} removeFromCart={removeFromCart} />

        <div style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Home addToCart={addToCart} searchQuery={searchQuery} showPackages={showPackages} onPackagesSeen={handlePackagesSeen} />} />
            <Route path="/account" element={user ? <UserProfile user={user} /> : <Auth />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/admin" element={user && user.uid === ADMIN_UID ? <AdminPanel /> : <div style={{ padding: '100px', textAlign: 'center', color: '#888' }}>Admin Access Restricted.</div>} />
          </Routes>
        </div>

        <footer style={{ padding: '30px', textAlign: 'center', fontSize: '10px', color: '#aaa', borderTop: '1px solid #eee', letterSpacing: '1px' }}>
          © 2026 FERUZA GIFT DELIVERY · KAMPALA, UGANDA
        </footer>
      </div>
    </Router>
  );
}

export default App;
