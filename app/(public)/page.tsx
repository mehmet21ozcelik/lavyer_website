import { LegalServiceSchema } from '@/components/seo/SchemaOrg';
import { prisma } from '@/lib/db/prisma';
import Image from 'next/image';

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

  let latestPosts: any[] = [];
  try {
    latestPosts = await prisma.blogPost.findMany({
      take: 3,
      where: { status: 'PUBLISHED' },
      orderBy: { createdAt: 'desc' },
      select: { id: true, title: true, slug: true, excerpt: true, createdAt: true, practiceArea: true }
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

      {/* Latest Blog Posts using Modern Grid layout */}
      <section className="section-padding" style={{ backgroundColor: '#f9f9fb', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
            <div>
              <span style={{ color: 'var(--secondary-color)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>
                Hukuk Blogu
              </span>
              <h2 style={{ color: 'var(--primary-color)', margin: '0.5rem 0 0', fontFamily: 'var(--font-heading)' }}>
                Güncel Yazılar
              </h2>
            </div>
            <a href="/blog" className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
              Tümünü Gör &rarr;
            </a>
          </div>

          <div className="grid grid-3">
            {latestPosts.map(post => (
              <article key={post.id} className="card" style={{
                display: 'flex', flexDirection: 'column', padding: '1.5rem',
                border: '1px solid var(--border-color)', backgroundColor: 'var(--white)',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
              }}>
                <div style={{
                  width: '100%', height: '180px', backgroundColor: 'var(--border-color)',
                  borderRadius: '4px', marginBottom: '1.5rem', position: 'relative', overflow: 'hidden'
                }}>
                  {(post.seo as any)?.ogImage ? (
                    <Image
                      src={(post.seo as any).ogImage}
                      alt={post.title}
                      fill
                      style={{ objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom right, var(--primary-color), var(--secondary-color))', opacity: 0.1 }} />
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  {post.practiceArea && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--secondary-color)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {post.practiceArea.name}
                    </span>
                  )}
                  <h3 style={{ fontSize: '1.25rem', margin: '0.5rem 0 1rem', fontFamily: 'var(--font-heading)', lineHeight: '1.4' }}>
                    <a href={`/blog/${post.slug}`} style={{ color: 'var(--primary-color)' }}>{post.title}</a>
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6' }}>
                    {post.excerpt && post.excerpt.length > 90 ? `${post.excerpt.substring(0, 90)}...` : post.excerpt}
                  </p>
                </div>
                <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {new Date(post.createdAt).toLocaleDateString('tr-TR')}
                  </span>
                  <a href={`/blog/${post.slug}`} style={{ fontWeight: 600, color: 'var(--secondary-color)', fontSize: '0.9rem' }}>
                    Devamı &rsaquo;
                  </a>
                </div>
              </article>
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
