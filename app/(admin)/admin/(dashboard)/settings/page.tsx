'use client';

import { useState, useEffect } from 'react';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { useRouter } from 'next/navigation';
import RichTextEditor from '@/components/admin/RichTextEditor';

export default function SettingsPage() {
    const router = useRouter();
    const [settings, setSettings] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetch('/api/admin/settings')
            .then(res => res.json())
            .then(data => {
                setSettings(data || {});
                setLoading(false);
            });
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch('/api/admin/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings),
            });
            if (res.ok) {
                alert('Ayarlar başarıyla kaydedildi.');
                router.refresh();
            }
        } catch (error) {
            alert('Bir hata oluştu.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div>Yükleniyor...</div>;

    const inputStyle = {
        width: '100%',
        padding: '0.75rem',
        borderRadius: '6px',
        border: '1px solid var(--border-color)',
        marginBottom: '1rem',
        fontSize: '1rem'
    };

    const labelStyle = {
        display: 'block',
        marginBottom: '0.5rem',
        fontWeight: 600,
        fontSize: '0.9rem',
        color: 'var(--text-primary)'
    };

    return (
        <div>
            <AdminPageHeader title="Site Ayarları" />

            <form onSubmit={handleSave} className="card" style={{ padding: '2rem', maxWidth: '800px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                    {/* SEO & Genel Ayarlar */}
                    <div>
                        <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>SEO & Genel</h3>

                        <label style={labelStyle}>Site Başlığı (Title)</label>
                        <input
                            style={inputStyle}
                            value={settings?.title || ''}
                            onChange={e => setSettings({ ...settings, title: e.target.value })}
                            placeholder="Örn: Lavyer Hukuk Bürosu | Diyarbakır Avukat"
                        />

                        <label style={labelStyle}>Site Açıklaması (Meta Description)</label>
                        <textarea
                            style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }}
                            value={settings?.description || ''}
                            onChange={e => setSettings({ ...settings, description: e.target.value })}
                            placeholder="Site genelinde kullanılacak SEO açıklaması..."
                        />

                        <label style={labelStyle}>Logo Metni</label>
                        <input
                            style={inputStyle}
                            value={settings?.logoText || ''}
                            onChange={e => setSettings({ ...settings, logoText: e.target.value })}
                        />

                        <label style={labelStyle}>Baro Sicil No</label>
                        <input
                            style={inputStyle}
                            value={settings?.registrationNo || ''}
                            onChange={e => setSettings({ ...settings, registrationNo: e.target.value })}
                        />
                    </div>

                    {/* İletişim Bilgileri */}
                    <div>
                        <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>İletişim Bilgileri</h3>

                        <label style={labelStyle}>Telefon</label>
                        <input
                            style={inputStyle}
                            value={settings?.phone || ''}
                            onChange={e => setSettings({ ...settings, phone: e.target.value })}
                        />

                        <label style={labelStyle}>E-posta</label>
                        <input
                            style={inputStyle}
                            value={settings?.email || ''}
                            onChange={e => setSettings({ ...settings, email: e.target.value })}
                        />

                        <label style={labelStyle}>WhatsApp Numarası (Uluslararası Format)</label>
                        <input
                            style={inputStyle}
                            value={settings?.whatsappNumber || ''}
                            onChange={e => setSettings({ ...settings, whatsappNumber: e.target.value })}
                            placeholder="905551234567"
                        />

                        <label style={labelStyle}>Adres</label>
                        <textarea
                            style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }}
                            value={settings?.address || ''}
                            onChange={e => setSettings({ ...settings, address: e.target.value })}
                        />
                    </div>
                </div>

                {/* Sosyal Medya */}
                <div style={{ marginTop: '2rem' }}>
                    <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Sosyal Medya Linkleri</h3>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                        <div>
                            <label style={labelStyle}>Facebook URL</label>
                            <input
                                style={inputStyle}
                                value={settings?.facebookUrl || ''}
                                onChange={e => setSettings({ ...settings, facebookUrl: e.target.value })}
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>Instagram URL</label>
                            <input
                                style={inputStyle}
                                value={settings?.instagramUrl || ''}
                                onChange={e => setSettings({ ...settings, instagramUrl: e.target.value })}
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>Twitter / X URL</label>
                            <input
                                style={inputStyle}
                                value={settings?.twitterUrl || ''}
                                onChange={e => setSettings({ ...settings, twitterUrl: e.target.value })}
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>LinkedIn URL</label>
                            <input
                                style={inputStyle}
                                value={settings?.linkedinUrl || ''}
                                onChange={e => setSettings({ ...settings, linkedinUrl: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                {/* Hakkımızda İçeriği */}
                <div style={{ marginTop: '2rem' }}>
                    <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Hakkımızda Sayfası İçeriği</h3>
                    <div style={{ backgroundColor: 'white' }}>
                        <RichTextEditor
                            content={settings?.aboutContent || ''}
                            onChange={(html) => setSettings({ ...settings, aboutContent: html })}
                        />
                    </div>
                </div>

                <div style={{ marginTop: '3rem', borderTop: '1px solid var(--border-color)', paddingTop: '2rem', textAlign: 'right' }}>
                    <button
                        type="submit"
                        disabled={saving}
                        className="btn btn-primary"
                        style={{ padding: '0.75rem 2.5rem', fontSize: '1rem' }}
                    >
                        {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                    </button>
                </div>
            </form>
        </div>
    );
}
