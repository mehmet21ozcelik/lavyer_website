import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Hakkımızda | Diyarbakır Avukatlık Bürosu',
    description: 'Diyarbakır Barosu bünyesinde yılların verdiği tecrübe ile müvekkillerine şeffaf, dürüst ve sonuç odaklı avukatlık hizmeti sunan büromuzun kurumsal yapısı.',
    alternates: {
        canonical: 'https://www.diyarbakiravukat.com/hakkimizda'
    }
};

export default function AboutPage() {
    return (
        <>
            <section className="section-padding" style={{ background: '#111827', color: 'white', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'radial-gradient(circle at top right, rgba(59, 130, 246, 0.1), transparent 50%)' }}></div>
                <div className="container" style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
                    <span style={{ display: 'inline-block', background: 'rgba(255,255,255,0.1)', padding: '0.25rem 1rem', borderRadius: '4px', marginBottom: '1rem', color: '#60a5fa', fontWeight: 600, letterSpacing: '1px' }}>
                        KURUMSAL
                    </span>
                    <h1 style={{ color: 'white', marginBottom: '1.5rem', fontSize: '3rem' }}>Hakkımızda</h1>
                    <p style={{ maxWidth: '800px', margin: '0 auto', fontSize: '1.2rem', color: 'rgba(255,255,255,0.8)', lineHeight: 1.8 }}>
                        Haklarınızı korumak, adaleti sağlamak ve uyuşmazlıklara en hızlı, en güvenilir hukuki çözümleri üretmek için Diyarbakır'da yanınızdayız.
                    </p>
                </div>
            </section>

            <section className="section-padding">
                <div className="container">
                    <div className="grid grid-2" style={{ alignItems: 'center' }}>
                        <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
                            <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}>
                                <img
                                    src="https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=800&h=600"
                                    alt="Diyarbakır Avukatlık Bürosu"
                                    style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'cover' }}
                                />
                                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)', padding: '2rem' }}>
                                    <p style={{ color: 'white', margin: 0, fontWeight: 500, fontSize: '1.2rem' }}>Diyarbakır Barosu Sicil No: 12345</p>
                                </div>
                            </div>
                        </div>

                        <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
                            <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', color: 'var(--primary-color)' }}>
                                Vizyonumuz & Misyonumuz
                            </h2>
                            <p style={{ fontSize: '1.1rem', lineHeight: '1.8', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                                Kurulduğumuz günden bu yana, müvekkillerimizin hukuki sorunlarını kendi sorunumuz gibi benimseyerek, <strong>şeffaflık, dürüstlük ve gizlilik prensiplerinden</strong> asla ödün vermeden yolumuza devam ediyoruz.
                            </p>
                            <p style={{ fontSize: '1.1rem', lineHeight: '1.8', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                                Özellikle <a href="/diyarbakir/ceza-avukati" style={{ color: 'var(--primary-color)', textDecoration: 'underline' }}>Ceza Hukuku</a>, <a href="/diyarbakir/bosanma-avukati" style={{ color: 'var(--primary-color)', textDecoration: 'underline' }}>Aile ve Boşanma Hukuku</a> ve <a href="/diyarbakir/is-avukati" style={{ color: 'var(--primary-color)', textDecoration: 'underline' }}>İş Hukuku</a> gibi alanlarda edindiğimiz tecrübe ile Diyarbakır Adliyesi ve çevre illerdeki tüm mahkemelerde müvekkillerimizin hakkını en güçlü şekilde savunuyoruz.
                            </p>

                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', marginTop: '3rem', padding: '2rem', background: '#f9fafb', borderRadius: '12px', borderLeft: '4px solid var(--secondary-color)' }}>
                                <div>
                                    <h4 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--primary-color)' }}>15+</h4>
                                    <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Yıllık Deneyim</span>
                                </div>
                                <div style={{ width: '1px', background: 'var(--border-color)' }}></div>
                                <div>
                                    <h4 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--primary-color)' }}>1000+</h4>
                                    <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Çözülmüş Dosya</span>
                                </div>
                                <div style={{ width: '1px', background: 'var(--border-color)' }}></div>
                                <div>
                                    <h4 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--primary-color)' }}>%100</h4>
                                    <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Gizlilik</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="section-padding" style={{ background: 'var(--primary-color)', color: 'white' }}>
                <div className="container" style={{ textAlign: 'center' }}>
                    <h2 style={{ color: 'white', marginBottom: '2rem', fontSize: '2.5rem' }}>Değerlerimiz</h2>

                    <div className="grid grid-3" style={{ gap: '2rem', marginTop: '3rem' }}>
                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '2.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <h3 style={{ color: 'var(--secondary-color)', marginBottom: '1rem', fontSize: '1.5rem' }}>Şeffaflık</h3>
                            <p style={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.7 }}>
                                Dava süreçlerinizin her aşamasında sizi bilgilendiririz. Sürpriz masraflar ya da belirsiz hukuki risklerle karşılaşmazsınız.
                            </p>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '2.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <h3 style={{ color: 'var(--secondary-color)', marginBottom: '1rem', fontSize: '1.5rem' }}>Çözüm Odaklılık</h3>
                            <p style={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.7 }}>
                                Amacımız davayı uzatmak değil, uyuşmazlıkları sizin lehinize en hızlı ve en az maliyetli şekilde çözüme kavuşturmaktır.
                            </p>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '2.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <h3 style={{ color: 'var(--secondary-color)', marginBottom: '1rem', fontSize: '1.5rem' }}>Erişilebilirlik</h3>
                            <p style={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.7 }}>
                                Avukatınıza ulaşamama sorunu yaşamazsınız. Acil hukuki destek hallerinde 7/24 randevu veya telefon ile iletişim halindeyiz.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="section-padding">
                <div className="container" style={{ textAlign: 'center', maxWidth: '800px' }}>
                    <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>Ofisimiz Nerede?</h2>
                    <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                        Yenişehir Belediyesi ve Diyarbakır Adliyesine yürüme mesafesinde olan ofisimizde sizleri ağırlamaktan mutluluk duyarız.
                    </p>

                    <div style={{ background: '#f9fafb', padding: '2rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                        <p style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '1rem' }}>
                            📍 Yenişehir Mahallesi, Adliye Karşısı No:1, Kat:3 Daire:12 Yenişehir / Diyarbakır
                        </p>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem' }}>
                            <a href="/iletisim" className="btn btn-primary">İletişime Geçin</a>
                            <a href="https://wa.me/905551234567" className="btn btn-secondary">Whatsapp ile Ulaşın</a>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
