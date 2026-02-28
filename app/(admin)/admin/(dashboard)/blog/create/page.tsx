'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import RichTextEditor from '@/components/admin/RichTextEditor';
import SEOEditorPanel from '@/components/admin/SEOEditorPanel';
import { createSlug } from '@/lib/utils/stringHelpers';
import { Toaster, toast } from 'sonner';

export default function CreateBlogPost() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [practiceAreas, setPracticeAreas] = useState<any[]>([]);

    const [form, setForm] = useState({
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        practiceAreaId: '',
        status: 'DRAFT',
        seo: {
            title: '',
            description: '',
            canonicalUrl: '',
            noIndex: false
        }
    });

    // Basic API call to fetch existing areas for cluster relation mapping
    useEffect(() => {
        fetch('/api/admin/services').then(res => res.json()).then(data => {
            if (Array.isArray(data)) setPracticeAreas(data);
        }).catch(e => console.error(e));
    }, []);

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const title = e.target.value;
        setForm(prev => ({ ...prev, title, slug: createSlug(title) }));
    };

    const handleEditorChange = (html: string) => {
        setForm(prev => ({ ...prev, content: html }));
    };

    const handleSubmit = async (e: React.FormEvent, isDraft: boolean) => {
        e.preventDefault();
        setLoading(true);

        const payload = { ...form, status: isDraft ? 'DRAFT' : 'PUBLISHED' };

        try {
            const response = await fetch('/api/admin/blog', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (response.ok) {
                toast.success(`Makale başarıyla ${isDraft ? 'taslak olarak kaydedildi' : 'yayınlandı'}.`);
                setTimeout(() => router.push('/admin/blog'), 1500);
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
        <>

            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h1>Yeni Makale Ekle</h1>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button
                            onClick={(e) => handleSubmit(e, true)}
                            disabled={loading}
                            className="btn btn-secondary"
                        >
                            Taslak Kaydet
                        </button>
                        <button
                            onClick={(e) => handleSubmit(e, false)}
                            disabled={loading}
                            className="btn btn-primary"
                        >
                            Yayınla
                        </button>
                    </div>
                </div>

                <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
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
                        <label style={{ display: 'block', fontWeight: 500, marginBottom: '0.5rem' }}>İlişkili Uzmanlık Alanı (Content Cluster) </label>
                        <select
                            value={form.practiceAreaId}
                            onChange={e => setForm(prev => ({ ...prev, practiceAreaId: e.target.value }))}
                            style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: '4px', backgroundColor: 'white' }}
                        >
                            <option value="">Seçiniz (Bağımsız Makale)</option>
                            {practiceAreas.map((area: any) => (
                                <option key={area.id} value={area.id}>{area.name}</option>
                            ))}
                        </select>
                        <small style={{ color: 'var(--text-secondary)' }}>Eğer bu makale bir hizmetin alt konusuysa onu seçin. Hizmet sayfasında ilgili makaleler arasında gösterilecektir.</small>
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
                        <label style={{ display: 'block', fontWeight: 500, marginBottom: '0.5rem' }}>İçerik <span style={{ color: 'red' }}>*</span></label>
                        <RichTextEditor content={form.content} onChange={handleEditorChange} />
                    </div>
                </div>

                {/* SEO Management Tool */}
                <SEOEditorPanel
                    seo={form.seo}
                    onChange={(seo) => setForm(prev => ({ ...prev, seo }))}
                    defaultTitle={form.title}
                    defaultDescription={form.excerpt}
                />

                <div style={{ marginTop: '2rem', padding: '2rem', background: 'var(--glass-bg)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <h3>Canlı Önizleme (Live Preview)</h3>
                    <p style={{ color: 'gray', marginBottom: '1rem' }}>Makalenizin sitede nasıl görüneceğini simüle eder.</p>

                    <div style={{ padding: '2rem', border: '1px dashed #ccc', borderRadius: '4px', minHeight: '300px', backgroundColor: 'white' }}>
                        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{form.title || 'Başlık Yazınız...'}</h1>
                        <div
                            style={{ lineHeight: 1.8, fontSize: '1.1rem' }}
                            dangerouslySetInnerHTML={{ __html: form.content || '<p style="color:gray;">İçerik bekleniyor...</p>' }}
                        />
                    </div>
                </div>

            </div>
        </>
    );
}
