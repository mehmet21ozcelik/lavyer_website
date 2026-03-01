'use client';
import { useState, useEffect } from 'react';

interface SEOEditorProps {
    seo: {
        title: string;
        description: string;
        canonicalUrl?: string | null;
        ogImage?: string | null;
        noIndex: boolean;
    };
    onChange: (seo: any) => void;
    defaultTitle?: string;
    defaultDescription?: string;
}

export default function SEOEditorPanel({ seo, onChange, defaultTitle, defaultDescription }: SEOEditorProps) {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
        const newData = { ...seo, [name]: val };
        onChange(newData);
    };

    const currentTitle = seo.title || defaultTitle || '';
    const currentDesc = seo.description || defaultDescription || '';

    return (
        <div className="card" style={{ padding: '1.5rem', marginTop: '2rem', borderTop: '4px solid var(--secondary-color)' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>SEO Yönetimi ve Etiketler</h3>

            {/* Google SERP Simulator */}
            <div style={{ padding: '1rem', background: '#f8f9fa', borderRadius: '8px', marginBottom: '2rem', fontFamily: 'Arial, sans-serif' }}>
                <p style={{ fontSize: '0.85rem', color: '#4d5156', marginBottom: '0.25rem' }}>https://www.diyarbakiravukat.com › ...</p>
                <h4 style={{ color: '#1a0dab', fontSize: '1.25rem', fontWeight: 400, margin: '0 0 0.25rem 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {currentTitle || 'Sayfa Başlığı Eksik'}
                </h4>
                <p style={{ color: '#4d5156', fontSize: '0.875rem', lineHeight: 1.4, margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {currentDesc || 'Arama motorları için açıklama girilmedi.'}
                </p>
            </div>

            <div style={{ display: 'grid', gap: '1.5rem' }}>
                <div>
                    <label style={{ display: 'block', fontWeight: 500, marginBottom: '0.5rem' }}>Meta Başlık (Title)</label>
                    <input
                        type="text"
                        name="title"
                        value={seo.title}
                        onChange={handleChange}
                        placeholder={defaultTitle}
                        style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: '4px' }}
                    />
                    <small style={{ color: (seo.title?.length || 0) > 60 ? 'red' : 'gray' }}>{(seo.title?.length || 0)} / 60 karakter</small>
                </div>

                <div>
                    <label style={{ display: 'block', fontWeight: 500, marginBottom: '0.5rem' }}>Meta Açıklama (Description)</label>
                    <textarea
                        name="description"
                        rows={3}
                        value={seo.description}
                        onChange={handleChange}
                        placeholder={defaultDescription}
                        style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: '4px' }}
                    />
                    <small style={{ color: (seo.description?.length || 0) > 160 ? 'red' : 'gray' }}>{(seo.description?.length || 0)} / 160 karakter</small>
                </div>

                <div>
                    <label style={{ display: 'block', fontWeight: 500, marginBottom: '0.5rem' }}>Canonical URL (Opsiyonel)</label>
                    <input
                        type="url"
                        name="canonicalUrl"
                        value={seo.canonicalUrl || ''}
                        onChange={handleChange}
                        placeholder="https://..."
                        style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: '4px' }}
                    />
                </div>

                <div>
                    <label style={{ display: 'block', fontWeight: 500, marginBottom: '0.5rem' }}>Kapak Resmi (og:image) URL'si</label>
                    <input
                        type="url"
                        name="ogImage"
                        value={seo.ogImage || ''}
                        onChange={handleChange}
                        placeholder="https://.../resim.jpg"
                        style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: '4px' }}
                    />
                    <small style={{ color: 'gray', display: 'block', marginTop: '0.25rem' }}>Ana sayfa blog kartlarında ve sosyal medya paylaşımlarında görünecek olan kapak resminin tam URL adresini buraya girin.</small>

                    {seo.ogImage && (
                        <div style={{ marginTop: '0.5rem' }}>
                            <img src={seo.ogImage} alt="Kapak önizleme" style={{ maxWidth: '100%', maxHeight: '120px', borderRadius: '4px', objectFit: 'cover' }} />
                        </div>
                    )}
                </div>

                <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                        <input
                            type="checkbox"
                            name="noIndex"
                            checked={seo.noIndex}
                            onChange={handleChange}
                            style={{ width: '18px', height: '18px' }}
                        />
                        <span style={{ fontWeight: 500 }}>Arama Motorlarına Kapat (noindex)</span>
                    </label>
                </div>
            </div>
        </div>
    );
}
