'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Toaster, toast } from 'sonner';
import AdminPageHeader from '@/components/admin/AdminPageHeader';

export default function AdminCitiesList() {
    const [cities, setCities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCities();
    }, []);

    const fetchCities = async () => {
        try {
            const res = await fetch('/api/admin/cities');
            const data = await res.json();
            if (Array.isArray(data)) setCities(data);
        } catch (e) {
            toast.error('Veriler yüklenemedi');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`"${name}" şehrini silmek istediğinize emin misiniz?`)) return;

        try {
            const res = await fetch(`/api/admin/cities/${id}`, { method: 'DELETE' });
            const result = await res.json();

            if (res.ok) {
                toast.success('Şehir silindi.');
                setCities(prev => prev.filter(c => c.id !== id));
            } else {
                toast.error(result.error || 'Silme işlemi başarısız.');
            }
        } catch (e) {
            toast.error('Bağlantı hatası.');
        }
    };

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <Toaster position="top-right" richColors />

            <AdminPageHeader
                title="Şehirler & Yerel SEO"
                actions={
                    <Link href="/admin/cities/create" className="btn btn-primary">
                        + Yeni Şehir Ekle
                    </Link>
                }
            />

            <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid var(--border-color)' }}>
                            <th style={{ padding: '1rem', fontWeight: 600 }}>Şehir Adı</th>
                            <th style={{ padding: '1rem', fontWeight: 600 }}>Slug</th>
                            <th style={{ padding: '1rem', fontWeight: 600 }}>Yerel Ofis</th>
                            <th style={{ padding: '1rem', fontWeight: 600, textAlign: 'right' }}>İşlemler</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={4} style={{ padding: '2rem', textAlign: 'center' }}>Yükleniyor...</td></tr>
                        ) : cities.length === 0 ? (
                            <tr>
                                <td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: 'gray' }}>Henüz şehir eklenmemiş.</td>
                            </tr>
                        ) : null}
                        {cities.map(city => (
                            <tr key={city.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                <td style={{ padding: '1rem', fontWeight: 500 }}>{city.name}</td>
                                <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>/{city.slug}</td>
                                <td style={{ padding: '1rem' }}>
                                    {city.hasPhysicalOffice ? (
                                        <span style={{ color: '#166534', backgroundColor: '#dcfce7', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600 }}>Fiziksel Ofis</span>
                                    ) : (
                                        <span style={{ color: '#475569', backgroundColor: '#f1f5f9', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem' }}>Sadece Bilgi</span>
                                    )}
                                </td>
                                <td style={{ padding: '1rem', textAlign: 'right', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                    <Link href={`/admin/cities/edit/${city.id}`} style={{ padding: '0.4rem 0.8rem', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>Düzenle</Link>
                                    <button
                                        onClick={() => handleDelete(city.id, city.name)}
                                        style={{ padding: '0.4rem 0.8rem', border: '1px solid #fee2e2', color: '#dc2626', backgroundColor: '#fef2f2', borderRadius: '4px', fontSize: '0.85rem', cursor: 'pointer' }}
                                    >
                                        Sil
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
