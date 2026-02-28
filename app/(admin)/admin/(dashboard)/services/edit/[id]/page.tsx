'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import RichTextEditor from '@/components/admin/RichTextEditor';
import SEOEditorPanel from '@/components/admin/SEOEditorPanel';
import { Toaster, toast } from 'sonner';
import AdminPageHeader from '@/components/admin/AdminPageHeader';

export default function EditServicePage() {
    const router = useRouter();
    const params = useParams();
    const [loading, setLoading] = useState(true);
    const [saveLoading, setSaveLoading] = useState(false);

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

    useEffect(() => {
        if (params.id) {
            fetch(`/api/admin/services/${params.id}`)
                .then(res => res.json())
                .then(data => {
                    if (data.error) {
                        toast.error('Hizmet bulunamadı');
                        router.push('/admin/services');
                    } else {
                        setForm({
                            name: data.name,
                            slug: data.slug,
                            content: data.content || '',
                            seo: data.seo || { title: '', description: '', canonicalUrl: '', noIndex: false }
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
            const response = await fetch(`/api/admin/services/${params.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });

            if (response.ok) {
                toast.success('Hizmet başarıyla güncellendi.');
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
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>


            <AdminPageHeader
                title="Hizmeti Düzenle"
                backPath="/admin/services"
                actions={
                    <button
                        onClick={handleSubmit}
                        disabled={saveLoading}
                        className="btn btn-primary"
                    >
                        {saveLoading ? 'Güncelleniyor...' : 'Değişiklikleri Kaydet'}
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
