'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import RichTextEditor from '@/components/admin/RichTextEditor';
import SEOEditorPanel from '@/components/admin/SEOEditorPanel';
import { createSlug } from '@/lib/utils/stringHelpers';
import { Toaster, toast } from 'sonner';

export default function EditBlogForm({ post, practiceAreas }: { post: any, practiceAreas: any[] }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        title: post.title || '',
        slug: post.slug || '',
        excerpt: post.excerpt || '',
        content: post.content || '',
        practiceAreaId: post.practiceAreaId || '',
        status: post.status || 'DRAFT',
        seo: {
            title: post.seo?.title || '',
            description: post.seo?.description || '',
            canonicalUrl: post.seo?.canonicalUrl || '',
            noIndex: post.seo?.noIndex || false
        }
    });

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Unlike Create, Edit usually locks slug unless user types. 
        // But let's allow explicit changes for SEO 301 rules
        setForm(prev => ({ ...prev, title: e.target.value }));
    };

    const handleEditorChange = (html: string) => {
        setForm(prev => ({ ...prev, content: html }));
    };

    const handleSubmit = async (e: React.FormEvent, newStatus?: string) => {
        e.preventDefault();
        setLoading(true);

        const payload = { ...form };
        if (newStatus) payload.status = newStatus;

        try {
            const response = await fetch(`/api/admin/blog/${post.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (response.ok) {
                toast.success('Makale başarıyla güncellendi.');
                setTimeout(() => router.refresh(), 1000);
            } else {
                toast.error(result.error || 'Güncelleme hatası.');
            }
        } catch (error) {
            toast.error('Bağlantı hatası.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Emin misiniz? Geri yüklemek için Trash kutusu gerekecek.')) return;
        try {
            setLoading(true);
            const res = await fetch(`/api/admin/blog/${post.id}`, { method: 'DELETE' });
            if (res.ok) {
                toast.success('Makale arşive (Trash) kaldırıldı.');
                router.push('/admin/blog');
            } else toast.error('Silme başarısızıldı.');
        } catch (e) {
            toast.error('Silme başarısızıldı.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginBottom: '2rem' }}>
                <button onClick={() => handleDelete()} disabled={loading} className="btn" style={{ backgroundColor: 'red', color: 'white' }}>
                    Arşive At (Soft Delete)
                </button>
                <button onClick={(e) => handleSubmit(e, 'DRAFT')} disabled={loading} className="btn btn-secondary">
                    Taslak Yap
                </button>
                <button onClick={(e) => handleSubmit(e, 'PUBLISHED')} disabled={loading} className="btn btn-primary">
                    Sayfayı Yayınla / Güncelle
                </button>
            </div>

            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem' }}>
                <div className="grid grid-2">
                    <div>
                        <label style={{ display: 'block', fontWeight: 500, marginBottom: '0.5rem' }}>Makale Başlığı <span style={{ color: 'red' }}>*</span></label>
                        <input
                            type="text"
                            value={form.title}
                            onChange={handleTitleChange}
                            className="form-input"
                            style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: '4px' }}
                            required
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontWeight: 500, marginBottom: '0.5rem' }}>URL (Slug) <span style={{ color: 'red' }}>*</span></label>
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
                    <label style={{ display: 'block', fontWeight: 500, marginBottom: '0.5rem' }}>İlişkili Uzmanlık Alanı</label>
                    <select
                        value={form.practiceAreaId || ''}
                        onChange={e => setForm(prev => ({ ...prev, practiceAreaId: e.target.value }))}
                        style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: '4px', backgroundColor: 'white' }}
                    >
                        <option value="">Seçiniz (Bağımsız Makale)</option>
                        {practiceAreas.map((area: any) => (
                            <option key={area.id} value={area.id}>{area.name}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label style={{ display: 'block', fontWeight: 500, marginBottom: '0.5rem' }}>Kısa Özet (Excerpt)</label>
                    <textarea
                        value={form.excerpt}
                        onChange={e => setForm(prev => ({ ...prev, excerpt: e.target.value }))}
                        rows={2}
                        style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: '4px' }}
                    />
                </div>

                <div>
                    <label style={{ display: 'block', fontWeight: 500, marginBottom: '0.5rem' }}>İçerik Editörü</label>
                    <RichTextEditor content={form.content} onChange={handleEditorChange} />
                </div>
            </div>

            <SEOEditorPanel
                seo={form.seo}
                onChange={(seo) => setForm(prev => ({ ...prev, seo }))}
                defaultTitle={form.title}
                defaultDescription={form.excerpt}
            />

            <div className="card" style={{ marginTop: '2rem' }}>
                <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Revizyon Geçmişi (Versiyonlama)</h3>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                    {post.versions?.map((v: any, idx: number) => (
                        <li key={v.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: idx !== post.versions.length - 1 ? '1px solid #efefef' : 'none' }}>
                            <span>Sürüm {post.versions.length - idx}</span>
                            <span style={{ color: 'gray' }}>{new Date(v.createdAt).toLocaleString('tr-TR')} - {v.updatedBy}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </>
    );
}
