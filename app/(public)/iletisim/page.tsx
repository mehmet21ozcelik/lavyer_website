import { Metadata } from 'next';
import { getSiteSettings } from '@/lib/services/settings.service';
import { buildMetadata } from '@/lib/seo/generateMetadata';

export async function generateMetadata(): Promise<Metadata> {
    return await buildMetadata({
        title: 'İletişim | Diyarbakır Avukatlık Bürosu',
        description: 'Hukuki süreçlerinizde profesyonel destek almak için bize ulaşın. Diyarbakır merkezli avukatlık ofisimiz hizmetinizdedir.',
        noIndex: false
    });
}

export default async function ContactPage() {
    const settings = await getSiteSettings();

    return (
        <section className="section-padding" style={{ minHeight: '80vh', backgroundColor: 'var(--background-color)' }}>
            <div className="container" style={{ maxWidth: '1000px', margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <h1 style={{ color: 'var(--text-primary)' }}>İletişim</h1>
                    <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>Hızlı ve güvenilir hukuki danışmanlık.</p>
                </div>

                <div className="grid grid-2">
                    {/* Contact Details */}
                    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        <div>
                            <h3 style={{ borderBottom: '2px solid var(--secondary-color)', paddingBottom: '0.5rem', display: 'inline-block' }}>Adres</h3>
                            <p style={{ marginTop: '1rem' }}>{settings?.address || 'Yenişehir Mahallesi, Adliye Karşısı No:1, Yenişehir / Diyarbakır'}</p>
                        </div>

                        <div>
                            <h3 style={{ borderBottom: '2px solid var(--secondary-color)', paddingBottom: '0.5rem', display: 'inline-block' }}>Telefon</h3>
                            <p style={{ marginTop: '1rem', fontWeight: 600, fontSize: '1.2rem' }}>
                                <a href={`tel:${settings?.phone?.replace(/\s+/g, '') || '+905551234567'}`} style={{ color: 'var(--primary-color)' }}>
                                    {settings?.phone || '+90 555 123 45 67'}
                                </a>
                            </p>
                        </div>

                        <div>
                            <h3 style={{ borderBottom: '2px solid var(--secondary-color)', paddingBottom: '0.5rem', display: 'inline-block' }}>E-Posta</h3>
                            <p style={{ marginTop: '1rem' }}>
                                <a href={`mailto:${settings?.email || 'info@diyarbakiravukat.com'}`} style={{ color: 'var(--primary-color)' }}>
                                    {settings?.email || 'info@diyarbakiravukat.com'}
                                </a>
                            </p>
                        </div>

                        <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
                            <a href={`https://wa.me/${settings?.whatsappNumber || '905551234567'}`} className="btn btn-primary" style={{ background: '#25D366', width: '100%', textAlign: 'center' }}>WhatsApp Üzerinden Ulaşın</a>
                        </div>
                    </div>

                    {/* Contact Form Placeholder */}
                    <div className="card">
                        <h3 style={{ marginBottom: '1.5rem' }}>Bize Mesaj Gönderin</h3>
                        <form style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Ad Soyad</label>
                                <input type="text" style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)', fontFamily: 'inherit' }} required />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Telefon Numaranız</label>
                                <input type="tel" style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)', fontFamily: 'inherit' }} required />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Mesajınız</label>
                                <textarea rows={5} style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)', fontFamily: 'inherit', resize: 'vertical' }} required></textarea>
                            </div>

                            <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>Gönder</button>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
}
