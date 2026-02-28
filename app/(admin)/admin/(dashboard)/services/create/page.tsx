'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import RichTextEditor from '@/components/admin/RichTextEditor';
import SEOEditorPanel from '@/components/admin/SEOEditorPanel';
import { createSlug } from '@/lib/utils/stringHelpers';
import { Toaster, toast } from 'sonner';
import AdminPageHeader from '@/components/admin/AdminPageHeader';

export default function CreateServicePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        name: '',
        slug: '',
        content: '',
        seo: {
            title: '',
            description: '',
            canonicalUrl: '',
            noIndex: false
        }
    });

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const name = e.target.value;
        setForm(prev => ({ ...prev, name, slug: createSlug(name) }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name || !form.slug || !form.content) {
            toast.error('Lütfen tüm zorunlu alanları doldurun.');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('/api/admin/services', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });

            const result = await response.json();

            if (response.ok) {
                toast.success('Hizmet alanı başarıyla oluşturuldu.');
                setTimeout(() => router.push('/admin/services'), 1500);
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
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>


            <AdminPageHeader
                title="Yeni Hizmet Ekle"
                backPath="/admin/services"
                actions={
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="btn btn-primary"
                    >
                        {loading ? 'Kaydediliyor...' : 'Kaydet ve Yayınla'}
                    </button>
                }
            />

            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div className="grid grid-2">
                    <div>
                        <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Hizmet Adı <span style={{ color: 'red' }}>*</span></label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={handleNameChange}
                            placeholder="Örn: Boşanma Avukatı"
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
                </div>

                <div>
                    <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Hizmet İçeriği <span style={{ color: 'red' }}>*</span></label>
                    <RichTextEditor content={form.content} onChange={(html) => setForm(prev => ({ ...prev, content: html }))} />
                </div>
            </div>

            <SEOEditorPanel
                seo={form.seo}
                onChange={(seo) => setForm(prev => ({ ...prev, seo }))}
                defaultTitle={form.name}
                defaultDescription={form.content.substring(0, 160).replace(/<[^>]*>/g, '')}
            />
        </div>
    );
}
