'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSlug } from '@/lib/utils/stringHelpers';
import { Toaster, toast } from 'sonner';

export default function CreateCityPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        name: '',
        slug: '',
        hasPhysicalOffice: false
    });

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const name = e.target.value;
        setForm(prev => ({ ...prev, name, slug: createSlug(name) }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name || !form.slug) {
            toast.error('Lütfen isim ve slug alanlarını doldurun.');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('/api/admin/cities', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });

            const result = await response.json();

            if (response.ok) {
                toast.success('Şehir başarıyla eklendi.');
                setTimeout(() => router.push('/admin/cities'), 1500);
            } else {
                toast.error(result.error || 'Bir hata oluştu.');
            }
        } catch (error) {
            toast.error('Bağlantı hatası.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>


            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <a href="/admin/cities" style={{ color: 'var(--text-secondary)' }}>&larr; Geri</a>
                    <h1>Yeni Şehir Ekle</h1>
                </div>
            </div>

            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div>
                    <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Şehir Adı <span style={{ color: 'red' }}>*</span></label>
                    <input
                        type="text"
                        value={form.name}
                        onChange={handleNameChange}
                        placeholder="Örn: Diyarbakır"
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
                            İşaretlerseniz bu şehre özel sayfalar "Ticari Hizmet" (LocalBusiness) olarak işaretlenir. İşaretlemezseniz "Bilgilendirme Makalesi" olarak değerlendirilir.
                        </p>
                    </div>
                </div>

                <div style={{ marginTop: '1rem' }}>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="btn btn-primary"
                        style={{ width: '100%' }}
                    >
                        {loading ? 'Kaydediliyor...' : 'Şehri Kaydet'}
                    </button>
                </div>
            </div>
        </div>
    );
}
