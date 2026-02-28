'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (res.ok) {
            router.push('/admin');
        } else {
            setError('Geçersiz e-posta veya şifre.');
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--background-color)' }}>
            <form onSubmit={handleLogin} className="card" style={{ width: '100%', maxWidth: '400px', padding: '2rem' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Yönetici Girişi</h2>

                {error && (
                    <div style={{ background: '#fee2e2', color: '#dc2626', padding: '1rem', borderRadius: '4px', marginBottom: '1rem' }}>
                        {error}
                    </div>
                )}

                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>E-posta</label>
                    <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}
                    />
                </div>

                <div style={{ marginBottom: '2rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Şifre</label>
                    <input
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}
                    />
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Giriş Yap</button>
            </form>
        </div>
    );
}
