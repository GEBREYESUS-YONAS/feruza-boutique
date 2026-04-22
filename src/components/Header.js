import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const linkStyle = {
  textDecoration: 'none',
  color: '#1a1a1a',
  fontWeight: '500',
  fontSize: '13px',
  letterSpacing: '1px'
};

const inputStyle = {
  padding: '12px',
  border: '1px solid #ddd',
  borderRadius: '6px',
  fontSize: '14px',
  outline: 'none',
  boxSizing: 'border-box',
  width: '100%',
};

const Header = ({ user, cart, onCartOpen, onPackagesClick, onSearch }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const navStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px 5%',
    backgroundColor: '#fff',
    borderBottom: '1px solid #f2f2f2',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
    gap: '10px',
  };

  const mobileMenuStyle = {
    display: isOpen ? 'flex' : 'none',
    flexDirection: 'column',
    position: 'absolute',
    top: '100%',
    left: 0,
    width: '100%',
    backgroundColor: '#fff',
    padding: '20px 0',
    boxShadow: '0 10px 10px rgba(0,0,0,0.05)',
    textAlign: 'center',
    gap: '20px'
  };

  const handleSearchClose = () => {
    setIsSearchOpen(false);
    onSearch(''); // clear results when closing
  };

  return (
    <nav style={navStyle}>

      {/* Hamburger Icon — hidden when search is open */}
      {!isSearchOpen && (
        <div
          onClick={() => setIsOpen(!isOpen)}
          style={{ cursor: 'pointer', fontSize: '24px', flexShrink: 0 }}
          className="mobile-menu-icon"
        >
          {isOpen ? '✕' : '☰'}
        </div>
      )}

      {/* Brand Logo — hidden when search is open */}
      {!isSearchOpen && (
        <Link
          to="/"
          style={{
            textDecoration: 'none',
            color: '#1a1a1a',
            fontSize: '22px',
            fontWeight: '700',
            letterSpacing: '3px',
            fontFamily: 'Playfair Display',
            flexShrink: 0,
          }}
        >
          FERUZA
        </Link>
      )}

      {/* Search Bar — shown when search is open */}
      {isSearchOpen && (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            autoFocus
            type="search"
            placeholder="Search gifts, flowers, cakes..."
            style={{ ...inputStyle, padding: '8px 14px', fontSize: '13px' }}
            onChange={e => onSearch(e.target.value)}
          />
          <button
            onClick={handleSearchClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '20px',
              cursor: 'pointer',
              color: '#999',
              flexShrink: 0,
            }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Right Icons */}
      {!isSearchOpen && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>

          {/* Packages Button */}
          <button
            onClick={onPackagesClick}
            style={{
              background: '#c5a059',
              color: '#fff',
              border: 'none',
              borderRadius: '20px',
              padding: '7px 14px',
              fontSize: '10px',
              fontWeight: 'bold',
              letterSpacing: '1px',
              cursor: 'pointer',
            }}
          >
            🎁 PACKAGES
          </button>

          {/* Search Icon */}
          <button
            onClick={() => setIsSearchOpen(true)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '20px',
              padding: 0,
            }}
          >
            🔍
          </button>

          {/* Cart Icon */}
          <div onClick={onCartOpen} style={{ position: 'relative', cursor: 'pointer' }}>
            <span style={{ fontSize: '22px' }}>🛒</span>
            {cart && cart.length > 0 && (
              <span style={{
                position: 'absolute',
                top: '-8px',
                right: '-10px',
                backgroundColor: '#c5a059',
                color: 'white',
                borderRadius: '50%',
                padding: '2px 6px',
                fontSize: '10px',
                fontWeight: 'bold',
              }}>
                {cart.length}
              </span>
            )}
          </div>

          {/* User Icon */}
          <Link to="/account" style={{ color: '#1a1a1a', textDecoration: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ fontSize: '20px' }}>👤</span>
              <span style={{ fontSize: '11px', display: 'none' }} className="desktop-text">
                {user ? 'ACCOUNT' : 'LOGIN'}
              </span>
            </div>
          </Link>
        </div>
      )}

      {/* Mobile Dropdown Menu */}
      <div style={mobileMenuStyle}>
