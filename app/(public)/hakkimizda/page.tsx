import { Metadata } from 'next';
import { getSiteSettings } from '@/lib/services/settings.service';
import { buildMetadata } from '@/lib/seo/generateMetadata';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
    return await buildMetadata({
        title: 'Hakkımızda | Diyarbakır Avukatlık Bürosu',
        description: 'Diyarbakır Barosu bünyesinde dürüst ve sonuç odaklı avukatlık hizmeti sunan büromuzun kurumsal yapısı.',
        noIndex: false
    });
}

export default async function AboutPage() {
    const settings = await getSiteSettings();

    return (
        <>
            <section className="section-padding" style={{ background: 'var(--primary-color)', color: 'white', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'radial-gradient(circle at top right, rgba(193, 154, 91, 0.1), transparent 50%)' }}></div>
                <div className="container" style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
                    <span style={{ display: 'inline-block', background: 'rgba(255,255,255,0.1)', padding: '0.25rem 1rem', borderRadius: '4px', marginBottom: '1rem', color: 'var(--secondary-color)', fontWeight: 600, letterSpacing: '1px' }}>
                        KURUMSAL
                    </span>
                    <h1 style={{ color: 'white', marginBottom: '1.5rem', fontSize: '3rem' }}>Hakkımızda</h1>
                    <p style={{ maxWidth: '800px', margin: '0 auto', fontSize: '1.2rem', color: 'rgba(255,255,255,0.8)', lineHeight: 1.8 }}>
                        Haklarınızı korumak, adaleti sağlamak ve uyuşmazlıklara en güvenilir hukuki çözümleri üretmek için Diyarbakır'da yanınızdayız.
                    </p>
                </div>
            </section>

            <section className="section-padding">
                <div className="container">
                    <div className="grid grid-2" style={{ alignItems: 'flex-start', gap: '4rem' }}>
                        <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
                            <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
                                <img
                                    src="https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=800&h=600"
                                    alt="Diyarbakır Avukatlık Bürosu"
                                    style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'cover' }}
                                />
                                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)', padding: '2rem' }}>
                                    <p style={{ color: 'white', margin: 0, fontWeight: 500, fontSize: '1.2rem' }}>Şeffaflık, Gizlilik ve Uzmanlık</p>
                                </div>
                            </div>
                        </div>

                        <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
                            <div
                                className="rich-text-content"
                                dangerouslySetInnerHTML={{ __html: settings?.aboutContent || '<h1>Biz Kimiz?</h1><p>Diyarbakır merkezli hukuk büromuzda müvekkillerimize profesyonel destek sağlıyoruz.</p>' }}
                                style={{ fontSize: '1.1rem', lineHeight: '1.8', color: 'var(--text-secondary)' }}
                            />
                        </div>
                    </div>
                </div>
            </section>

            <section className="section-padding" style={{ background: 'var(--primary-color)', color: 'white' }}>
                <div className="container" style={{ textAlign: 'center' }}>
                    <h2 style={{ color: 'white', marginBottom: '4rem', fontSize: '2.5rem' }}>Temel Değerlerimiz</h2>

                    <div className="grid grid-3" style={{ gap: '2rem' }}>
                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '2.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <h3 style={{ color: 'var(--secondary-color)', marginBottom: '1rem', fontSize: '1.5rem' }}>Şeffaflık</h3>
                            <p style={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.7, fontSize: '1rem' }}>
                                Sürecin her aşamasında sizi bilgilendiririz. Sürprizlerle değil, net ve şeffaf hukuki süreçlerle hizmet veririz.
                            </p>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '2.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <h3 style={{ color: 'var(--secondary-color)', marginBottom: '1rem', fontSize: '1.5rem' }}>Güvenilirlik</h3>
                            <p style={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.7, fontSize: '1rem' }}>
                                Müvekkil gizliliği ve güvenliği bizim için esastır. Hukuk etiğine olan bağlılığımızla güveninizi sarsmayız.
                            </p>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '2.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <h3 style={{ color: 'var(--secondary-color)', marginBottom: '1rem', fontSize: '1.5rem' }}>Ulaşılabilirlik</h3>
                            <p style={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.7, fontSize: '1rem' }}>
                                Avukatınıza ulaşmak hak arama hürriyetinin bir parçasıdır. Her türlü hukuki ihtiyacınızda bize kolayca ulaşırsınız.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="section-padding">
                <div className="container" style={{ textAlign: 'center', maxWidth: '800px' }}>
                    <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>Ofisimiz</h2>
                    <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                        Diyarbakır Adliyesine yürüme mesafesinde olan ofisimizde sizleri ağırlamaktan memnuniyet duyarız.
                    </p>

                    <div style={{ background: 'var(--background-color)', padding: '3rem', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                        <p style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--primary-color)', marginBottom: '2rem' }}>
                            📍 {settings?.address || 'Yenişehir / Diyarbakır'}
                        </p>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <a href="/iletisim" className="btn btn-primary" style={{ padding: '1rem 2rem' }}>Randevu Alın</a>
                            <a href={`https://wa.me/${settings?.whatsappNumber || '905551234567'}`} className="btn btn-secondary" style={{ padding: '1rem 2rem' }}>WhatsApp Mesajı</a>
                        </div>
                    </div>
                </div>
            </section>

            <style dangerouslySetInnerHTML={{
                __html: `
                .rich-text-content h1, .rich-text-content h2, .rich-text-content h3 { color: var(--primary-color); margin-top: 1.5rem; margin-bottom: 1rem; }
                .rich-text-content p { margin-bottom: 1rem; }
                .rich-text-content ul, .rich-text-content ol { padding-left: 2rem; margin-bottom: 1rem; }
                .rich-text-content li { margin-bottom: 0.5rem; }
                .rich-text-content strong { color: var(--primary-color); font-weight: 700; }
            ` }} />
        </>
    );
}
