import React from 'react';

const Contact = () => {
  const styles = {
    page: {
      padding: '100px 20px',
      textAlign: 'center',
      backgroundColor: '#fdfbf7',
      minHeight: '60vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    },
    title: {
      fontFamily: "'Playfair Display', serif",
      fontSize: '3rem',
      color: '#1a1a1a',
      marginBottom: '10px'
    },
    infoBox: {
      maxWidth: '600px',
      marginTop: '40px',
      fontFamily: "'Inter', sans-serif",
      lineHeight: '2',
      color: '#444'
    }
  };

  return (
    <div style={styles.page}>
      <h2 style={styles.title}>Contact Us</h2>
      <p style={{ color: '#c5a059', letterSpacing: '2px', textTransform: 'uppercase' }}>Get in Touch</p>
      
      <div style={styles.infoBox}>
        <p><strong>Boutique Location:</strong> Kampala, Uganda</p>
        <p><strong>Phone / WhatsApp:</strong> +256 700 000 000</p>
        <p><strong>Email:</strong> hello@feruza.com</p>
        <p style={{ marginTop: '30px', fontStyle: 'italic', opacity: 0.7 }}>
          Operating Hours: Mon - Sat, 9:00 AM - 7:00 PM
        </p>
      </div>
    </div>
  );
};

export default Contact;