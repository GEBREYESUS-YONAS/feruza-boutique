import React from 'react';

const Footer = () => {
  return (
    <footer style={{ 
      backgroundColor: '#1a1a1a', 
      color: '#fdfbf7', 
      padding: '60px 20px', 
      textAlign: 'center',
      marginTop: '50px'
    }}>
      <h2 style={{ fontFamily: "'Playfair Display', serif", letterSpacing: '4px' }}>FERUZA</h2>
      <p style={{ fontSize: '12px', opacity: 0.7, letterSpacing: '1px' }}>
        Luxury Surprise Delivery • Kampala, Uganda
      </p>
      <div style={{ marginTop: '20px', fontSize: '10px', opacity: 0.5 }}>
        © 2026 FERUZA BOUTIQUE. ALL RIGHTS RESERVED.
      </div>
    </footer>
  );
};

export default Footer;