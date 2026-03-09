'use client';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

export default function Sidebar() {
    const router = useRouter();
    const pathname = usePathname();

    const handleLogout = async () => {
        const res = await fetch('/api/auth/logout', { method: 'POST' });
        if (res.ok) {
            router.push('/admin/login');
            router.refresh();
        }
    };

    const navItems = [
        { label: 'Dashboard', href: '/admin' },
        { label: 'Makaleler', href: '/admin/blog' },
        { label: 'Hizmetler', href: '/admin/services' },
        { label: 'Şehirler', href: '/admin/cities' },
        { label: 'SSS', href: '/admin/faq' },
        { label: 'Genel Ayarlar', href: '/admin/settings' },
    ];

    return (
        <aside className="admin-sidebar">
            <h2 style={{ color: 'white', marginBottom: '2rem', fontSize: '1.5rem' }}>HukukPanel</h2>
            <nav style={{ flex: 1 }}>
                <ul className="admin-nav-list">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    style={{
                                        display: 'block',
                                        padding: '0.75rem 1rem',
                                        borderRadius: '6px',
                                        color: isActive ? 'white' : 'rgba(255,255,255,0.7)',
                                        backgroundColor: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
                                        textDecoration: 'none',
                                        transition: 'all 0.2s',
                                        fontWeight: isActive ? 600 : 400
                                    }}
                                >
                                    {item.label}
                                </Link>
                            </li>
                        );
                    })}
                    <li style={{ marginTop: '2rem' }}>
                        <Link href="/" style={{ color: 'var(--accent-color)', display: 'block', textDecoration: 'none', fontSize: '0.9rem' }}>
                            &larr; Siteye Dön
                        </Link>
                    </li>
                </ul>
            </nav>

            <button
                onClick={handleLogout}
                style={{
                    marginTop: 'auto',
                    padding: '0.75rem',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: 'white',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.9rem'
                }}
            >
                Güvenli Çıkış
            </button>
        </aside>
    );
}
