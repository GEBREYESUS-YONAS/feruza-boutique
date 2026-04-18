import React, { useState } from 'react';
import { auth } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';

const Auth = ({ user }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                await createUserWithEmailAndPassword(auth, email, password);
            }
        } catch (err) {
            setError(err.message);
        }
    };

    if (user) {
        return (
            <div style={{ textAlign: 'center', padding: '20px' }}>
                <p>Welcome, <strong>{user.email}</strong></p>
                <button onClick={() => signOut(auth)} style={{ padding: '8px 15px', background: '#1a1a1a', color: '#white', border: 'none', cursor: 'pointer' }}>
                    Logout
                </button>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '400px', margin: '50px auto', padding: '30px', background: '#fff', border: '1px solid #eee' }}>
            <h2 style={{ fontFamily: 'Playfair Display, serif', textAlign: 'center' }}>
                {isLogin ? 'Login to Feruza' : 'Create an Account'}
            </h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
                <input 
                    type="email" placeholder="Email" value={email} 
                    onChange={(e) => setEmail(e.target.value)} required 
                    style={{ padding: '12px', border: '1px solid #ddd' }}
                />
                <input 
                    type="password" placeholder="Password" value={password} 
                    onChange={(e) => setPassword(e.target.value)} required 
                    style={{ padding: '12px', border: '1px solid #ddd' }}
                />
                <button type="submit" style={{ padding: '15px', background: '#c5a059', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
                    {isLogin ? 'LOGIN' : 'SIGN UP'}
                </button>
            </form>
            {error && <p style={{ color: 'red', fontSize: '12px', marginTop: '10px' }}>{error}</p>}
            <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px' }}>
                {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
                <span onClick={() => setIsLogin(!isLogin)} style={{ color: '#c5a059', cursor: 'pointer', fontWeight: 'bold' }}>
                    {isLogin ? 'Sign Up' : 'Login'}
                </span>
            </p>
        </div>
    );
};

export default Auth;