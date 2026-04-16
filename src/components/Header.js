import React from 'react';
import { Link } from 'react-router-dom'; // Use Link for internal navigation

const Header = () => {
  const linkStyle = {
    margin: '0 15px',
    textDecoration: 'none',
    color: '#1a1a1a',
    fontSize: '12px',
    letterSpacing: '2px',
    textTransform: 'uppercase',
    fontFamily: "'Inter', sans-serif"
  };

  return (
    <nav style={{ padding: '20px 40px', display: 'flex', justifyContent: 'space-between', backgroundColor: '#fdfbf7', borderBottom: '1px solid #eee' }}>
      <Link to="/" style={{ ...linkStyle, fontSize: '24px', fontWeight: 'bold', fontFamily: "'Playfair Display', serif" }}>
        FERUZA
      </Link>
      <div>
        <Link to="/" style={linkStyle}>Home</Link>
        <Link to="/contact" style={linkStyle}>Contact</Link>
      </div>
    </nav>
  );
};

export default Header;