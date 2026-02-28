'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Toaster, toast } from 'sonner';

export default function EditCityPage() {
    const router = useRouter();
    const params = useParams();
    const [loading, setLoading] = useState(true);
    const [saveLoading, setSaveLoading] = useState(false);

    const [form, setForm] = useState({
        name: '',
        slug: '',
        hasPhysicalOffice: false
    });

    useEffect(() => {
        if (params.id) {
            fetch(`/api/admin/cities/${params.id}`)
                .then(res => res.json())
                .then(data => {
                    if (data.error) {
                        toast.error('Şehir bulunamadı');
                        router.push('/admin/cities');
                    } else {
                        setForm({
                            name: data.name,
                            slug: data.slug,
                            hasPhysicalOffice: data.hasPhysicalOffice || false
                        });
                    }
                })
                .catch(() => toast.error('Yükleme hatası'))
                .finally(() => setLoading(false));
        }
    }, [params.id, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaveLoading(true);

        try {
            const response = await fetch(`/api/admin/cities/${params.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });

            if (response.ok) {
                toast.success('Şehir bilgileri güncellendi.');
            } else {
                const res = await response.json();
                toast.error(res.error || 'Güncelleme başarısız.');
            }
        } catch (error) {
            toast.error('Bağlantı hatası.');
        } finally {
            setSaveLoading(false);
        }
    };

    if (loading) return <div style={{ padding: '2rem' }}>Yükleniyor...</div>;

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>


            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <a href="/admin/cities" style={{ color: 'var(--text-secondary)' }}>&larr; Geri</a>
                    <h1>Şehri Düzenle</h1>
                </div>
            </div>

            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div>
                    <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Şehir Adı <span style={{ color: 'red' }}>*</span></label>
                    <input
                        type="text"
                        value={form.name}
                        onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                        style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: '4px' }}
                        required
                    />
                </div>

                <div>
                    <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>URL (Slug) <span style={{ color: 'red' }}>*</span></label>
                    <input
                        type="text"
                        value={form.slug}
                        onChange={e => setForm(prev => ({ ...prev, slug: e.target.value }))}
                        style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: '4px', backgroundColor: '#f9fafb' }}
                        required
                    />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.5rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <input
                        type="checkbox"
                        id="hasPhysicalOffice"
                        checked={form.hasPhysicalOffice}
                        onChange={e => setForm(prev => ({ ...prev, hasPhysicalOffice: e.target.checked }))}
                        style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                    />
                    <div>
                        <label htmlFor="hasPhysicalOffice" style={{ fontWeight: 600, cursor: 'pointer', display: 'block' }}>Bu şehirde fiziksel ofisimiz var mı?</label>
                        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                            Bu ayar Phase 1/Phase 2 geçişlerinde kritik rol oynar.
                        </p>
                    </div>
                </div>

                <div style={{ marginTop: '1rem' }}>
                    <button
                        onClick={handleSubmit}
                        disabled={saveLoading}
                        className="btn btn-primary"
                        style={{ width: '100%' }}
                    >
                        {saveLoading ? 'Güncelleniyor...' : 'Değişiklikleri Kaydet'}
                    </button>
                </div>
            </div>
        </div>
    );
}
