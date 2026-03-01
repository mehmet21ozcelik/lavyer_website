'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Toaster, toast } from 'sonner';
import Link from 'next/link';

export default function AdminFAQEdit({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [services, setServices] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        question: '',
        answer: '',
        order: 0,
        practiceAreaId: ''
    });

    useEffect(() => {
        Promise.all([
            fetch(`/api/admin/faq/${params.id}`).then(res => res.json()),
            fetch('/api/admin/services').then(res => res.json())
        ])
            .then(([faqData, servicesData]) => {
                if (faqData.error) throw new Error(faqData.error);
                setFormData({
                    question: faqData.question || '',
                    answer: faqData.answer || '',
                    order: faqData.order || 0,
                    practiceAreaId: faqData.practiceAreaId || ''
                });

                if (Array.isArray(servicesData)) setServices(servicesData);
            })
            .catch(err => toast.error('Veriler yüklenemedi: ' + err.message))
            .finally(() => setFetching(false));
    }, [params.id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch(`/api/admin/faq/${params.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                toast.success('SSS başarıyla güncellendi');
                setTimeout(() => router.push('/admin/faq'), 1500);
            } else {
                const data = await res.json();
                toast.error(data.error || 'Güncellenirken hata oluştu');
            }
        } catch (error) {
            toast.error('Bağlantı hatası');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return <div style={{ padding: '2rem', textAlign: 'center' }}>Yükleniyor...</div>;

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <Toaster position="top-right" richColors />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.5rem', margin: 0 }}>SSS Düzenle</h1>
                <Link href="/admin/faq" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
                    &larr; Listeye Dön
                </Link>
            </div>

            <div className="card">
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Soru</label>
                        <input
                            type="text"
                            required
                            value={formData.question}
                            onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Cevap</label>
                        <textarea
                            required
                            rows={5}
                            value={formData.answer}
                            onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)', resize: 'vertical' }}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Sıra</label>
                            <input
                                type="number"
                                value={formData.order}
                                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}
                            />
                        </div>

                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Hizmet Alanı (Opsiyonel)</label>
                            <select
                                value={formData.practiceAreaId}
                                onChange={(e) => setFormData({ ...formData, practiceAreaId: e.target.value })}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}
                            >
                                <option value="">-- Genel (Tümü) --</option>
                                {services.map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Güncelleniyor...' : 'Güncelle'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
