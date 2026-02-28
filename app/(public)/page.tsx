import { LegalServiceSchema } from '@/components/seo/SchemaOrg';
import { prisma } from '@/lib/db/prisma';

export const dynamic = 'force-dynamic';

export default async function Home() {
  let practiceAreas: any[] = [];
  try {
    practiceAreas = await prisma.practiceArea.findMany({
      take: 6,
      orderBy: { name: 'asc' },
      select: { id: true, name: true, slug: true, seo: true }
    });
  } catch (e) { }

  return (
    <>
      <LegalServiceSchema
        name="Diyarbakır Avukatlık Bürosu"
        description="Diyarbakır merkezli profesyonel hukuki danışmanlık hizmeti."
        url="https://www.diyarbakiravukat.com"
        logo="https://www.diyarbakiravukat.com/logo.png"
        telephone="+905551234567"
        address={{
          streetAddress: "Yenişehir Mahallesi, Adliye Karşısı No:1",
          addressLocality: "Yenişehir",
          addressRegion: "Diyarbakır",
          postalCode: "21100",
          addressCountry: "TR"
        }}
      />

      {/* Hero Section */}
      <section className="section-padding" style={{ background: 'var(--primary-color)', color: 'white', position: 'relative', overflow: 'hidden' }}>
        <div className="container animate-fade-in" style={{ position: 'relative', zIndex: 10 }}>
          <span style={{ color: 'var(--accent-color)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '1rem', display: 'block' }}>
            Profesyonel Hukuki Çözümler
          </span>
          <h1 style={{ color: 'white' }}>Adaletin Tesisi İçin Yanınızdayız.</h1>
          <p style={{ maxWidth: '600px', fontSize: '1.25rem', color: 'rgba(255,255,255,0.8)', marginBottom: '2rem' }}>
            Diyarbakır'da uzman ekibimizle boşanma, ceza ve iş hukuku başta olmak üzere profesyonel, şeffaf ve sonuç odaklı avukatlık hizmeti sunuyoruz.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
            <a href="/iletisim" className="btn btn-primary" style={{ padding: '1rem 2rem' }}>Ücretsiz Danışın</a>
            <a href="/hizmetler" className="btn btn-secondary" style={{ padding: '1rem 2rem', color: 'white', borderColor: 'white' }}>Uzmanlıklarımız</a>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section style={{ background: 'var(--glass-bg)', borderBottom: '1px solid var(--border-color)', padding: '2rem 0' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '2rem' }}>
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ margin: 0 }}>400+</h3>
            <p style={{ margin: 0, fontSize: '0.875rem' }}>Başarılı Dava</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ margin: 0 }}>Diyarbakır Barosu</h3>
            <p style={{ margin: 0, fontSize: '0.875rem' }}>Sicil Numarası: 12345</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ margin: 0 }}>10+ Yıl</h3>
            <p style={{ margin: 0, fontSize: '0.875rem' }}>Mesleki Tecrübe</p>
          </div>
        </div>
      </section>

      {/* Services Overview */}
      <section className="section-padding">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-lg)' }}>
            <h2>Uzmanlık Alanlarımız</h2>
            <p style={{ maxWidth: '600px', margin: '0 auto' }}>Her hukuki kriz profesyonel bir yaklaşım gerektirir. Uzman avukatlarımızla yanınızdayız.</p>
          </div>
          <div className="grid grid-3">
            {practiceAreas.map(service => (
              <a href={`/${service.slug}`} key={service.id} className="card" style={{ display: 'block', color: 'inherit' }}>
                <h3>{service.name}</h3>
                <p>{service.seo?.description || 'Diyarbakır ve çevre illerde profesyonel hukuki danışmanlık ve dava takip hizmeti.'}</p>
                <div style={{ color: 'var(--secondary-color)', fontWeight: 'bold', marginTop: '1rem' }}>Detaylı İncele &rarr;</div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="section-padding" style={{ background: 'var(--text-primary)', color: 'white', textAlign: 'center' }}>
        <div className="container">
          <h2 style={{ color: 'white' }}>Acil Hukuki Desteğe mi İhtiyacınız Var?</h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '2rem' }}>
            Zaman kaybetmeyin. Profesyonel bir destek almak için hemen bize ulaşın. Whatsapp hattımız 7/24 hizmetinizde.
          </p>
          <a href="https://wa.me/905551234567" className="btn btn-primary" style={{ background: '#25D366', color: 'white' }}>
            Whatsapp'tan Ulaşın
          </a>
        </div>
      </section>
    </>
  );
}
