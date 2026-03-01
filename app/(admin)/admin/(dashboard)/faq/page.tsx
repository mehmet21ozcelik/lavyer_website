'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Toaster, toast } from 'sonner';
import AdminPageHeader from '@/components/admin/AdminPageHeader';

export default function AdminFAQList() {
    const [faqs, setFaqs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFaqs();
    }, []);

    const fetchFaqs = async () => {
        try {
            const res = await fetch('/api/admin/faq');
            const data = await res.json();
            if (Array.isArray(data)) setFaqs(data);
        } catch (e) {
            toast.error('Veriler yüklenemedi');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string, question: string) => {
        if (!confirm(`"${question}" sorusunu silmek istediğinize emin misiniz?`)) return;

        try {
            const res = await fetch(`/api/admin/faq/${id}`, { method: 'DELETE' });

            if (res.ok) {
                toast.success('Soru silindi.');
                setFaqs(prev => prev.filter(f => f.id !== id));
            } else {
                toast.error('Silme işlemi başarısız.');
            }
        } catch (e) {
            toast.error('Bağlantı hatası.');
        }
    };

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <Toaster position="top-right" richColors />

            <AdminPageHeader
                title="Sıkça Sorulan Sorular"
                actions={
                    <Link href="/admin/faq/create" className="btn btn-primary">
                        + Yeni SSS Ekle
                    </Link>
                }
            />

            <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid var(--border-color)' }}>
                            <th style={{ padding: '1rem', fontWeight: 600 }}>Soru</th>
                            <th style={{ padding: '1rem', fontWeight: 600 }}>Cevap</th>
                            <th style={{ padding: '1rem', fontWeight: 600 }}>Hizmet Alanı</th>
                            <th style={{ padding: '1rem', fontWeight: 600, textAlign: 'right' }}>İşlemler</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={4} style={{ padding: '2rem', textAlign: 'center' }}>Yükleniyor...</td></tr>
                        ) : faqs.length === 0 ? (
                            <tr>
                                <td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: 'gray' }}>Henüz SSS eklenmemiş.</td>
                            </tr>
                        ) : null}
                        {faqs.map(faq => (
                            <tr key={faq.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                <td style={{ padding: '1rem', fontWeight: 500, maxWidth: '200px' }}>{faq.question}</td>
                                <td style={{ padding: '1rem', color: 'var(--text-secondary)', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {faq.answer}
                                </td>
                                <td style={{ padding: '1rem', fontSize: '0.9rem' }}>
                                    {faq.practiceArea ? faq.practiceArea.name : '-'}
                                </td>
                                <td style={{ padding: '1rem', textAlign: 'right', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                    <Link href={`/admin/faq/edit/${faq.id}`} style={{ padding: '0.4rem 0.8rem', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>Düzenle</Link>
                                    <button
                                        onClick={() => handleDelete(faq.id, faq.question)}
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
