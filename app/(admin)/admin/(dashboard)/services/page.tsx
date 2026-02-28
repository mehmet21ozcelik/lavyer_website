'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Toaster, toast } from 'sonner';
import AdminPageHeader from '@/components/admin/AdminPageHeader';

export default function AdminServicesList() {
    const [areas, setAreas] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        try {
            const res = await fetch('/api/admin/services');
            const data = await res.json();
            if (Array.isArray(data)) setAreas(data);
        } catch (e) {
            toast.error('Veriler yüklenemedi');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`"${name}" alanını silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`)) return;

        try {
            const res = await fetch(`/api/admin/services/${id}`, { method: 'DELETE' });
            const result = await res.json();

            if (res.ok) {
                toast.success('Hizmet alanı silindi.');
                setAreas(prev => prev.filter(a => a.id !== id));
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
                title="Hizmet Alanları"
                actions={
                    <Link href="/admin/services/create" className="btn btn-primary">
                        + Yeni Hizmet Ekle
                    </Link>
                }
            />

            <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid var(--border-color)' }}>
                            <th style={{ padding: '1rem', fontWeight: 600 }}>Hizmet Adı</th>
                            <th style={{ padding: '1rem', fontWeight: 600 }}>Slug</th>
                            <th style={{ padding: '1rem', fontWeight: 600 }}>İlişkili Blog / Şehir</th>
                            <th style={{ padding: '1rem', fontWeight: 600, textAlign: 'right' }}>İşlemler</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={4} style={{ padding: '2rem', textAlign: 'center' }}>Yükleniyor...</td></tr>
                        ) : areas.length === 0 ? (
                            <tr>
                                <td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: 'gray' }}>Henüz hizmet alanı eklenmemiş.</td>
                            </tr>
                        ) : null}
                        {areas.map(area => (
                            <tr key={area.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                <td style={{ padding: '1rem', fontWeight: 500 }}>{area.name}</td>
                                <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>/{area.slug}</td>
                                <td style={{ padding: '1rem', fontSize: '0.9rem' }}>
                                    {area._count?.blogPosts} Makale / {area._count?.cities} Şehir
                                </td>
                                <td style={{ padding: '1rem', textAlign: 'right', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                    <Link href={`/admin/services/edit/${area.id}`} style={{ padding: '0.4rem 0.8rem', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>Düzenle</Link>
                                    <button
                                        onClick={() => handleDelete(area.id, area.name)}
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
