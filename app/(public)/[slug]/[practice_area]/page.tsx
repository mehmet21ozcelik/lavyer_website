import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db/prisma';
import { LegalServiceSchema, FAQSchema } from '@/components/seo/SchemaOrg';
import RichTextRenderer from '@/components/ui/RichTextRenderer';

export async function generateStaticParams() {
    try {
        const areas = await prisma.cityPracticeArea.findMany({
            where: { city: { hasPhysicalOffice: true } },
            select: {
                city: { select: { slug: true } },
                practiceArea: { select: { slug: true } }
            }
        });

        return areas.map(area => ({
            slug: area.city.slug,
            practice_area: area.practiceArea.slug
        }));
    } catch (e) {
        console.warn('DB fail static gen');
        return [];
    }
}

export async function generateMetadata({ params }: { params: { slug: string, practice_area: string } }) {
    const data = await prisma.cityPracticeArea.findFirst({
        where: {
            city: { slug: params.slug, hasPhysicalOffice: true },
            practiceArea: { slug: params.practice_area }
        },
        include: { city: true, practiceArea: true, seo: true }
    });

    if (!data) return {};

    const fallbackTitle = `${data.city.name} ${data.practiceArea.name} | Avukatlık Bürosu`;
    const fallbackDesc = `${data.city.name} bölgesinde uzman ${data.practiceArea.name} aramalarınızda profesyonel hukuki danışmanlık hizmeti sunuyoruz.`;

    return {
        title: data.seo?.title || fallbackTitle,
        description: data.seo?.description || fallbackDesc,
        alternates: {
            canonical: data.seo?.canonicalUrl || `https://www.diyarbakiravukat.com/${data.city.slug}/${data.practiceArea.slug}`
        }
    };
}

export default async function PhysicalCityPracticeAreaPage({ params }: { params: { slug: string, practice_area: string } }) {
    const data = await prisma.cityPracticeArea.findFirst({
        where: {
            city: { slug: params.slug, hasPhysicalOffice: true },
            practiceArea: { slug: params.practice_area }
        },
        include: {
            city: true,
            practiceArea: {
                include: {
                    faqs: { orderBy: { order: 'asc' } },
                    blogPosts: {
                        where: { status: 'PUBLISHED' },
                        take: 3,
                        orderBy: { createdAt: 'desc' }
                    }
                }
            }
        }
    });

    if (!data) {
        notFound();
    }

    const { city, practiceArea } = data;
    const content = data.customContent || practiceArea.content;
    const title = `${city.name} ${practiceArea.name}`;

    return (
        <>
            <LegalServiceSchema
                name={`${title} - Hukuk Bürosu`}
                description={`${city.name} bölgesinde uzman ${practiceArea.name} hizmetleri.`}
                url={`https://www.diyarbakiravukat.com/${city.slug}/${practiceArea.slug}`}
                logo="https://www.diyarbakiravukat.com/logo.png"
                telephone="+905551234567"
                address={{
                    streetAddress: "Yenişehir Mahallesi, Adliye Karşısı No:1",
                    addressLocality: "Yenişehir",
                    addressRegion: city.name,
                    postalCode: "21100",
                    addressCountry: "TR"
                }}
            />

            {practiceArea.faqs.length > 0 && <FAQSchema faqs={practiceArea.faqs} />}

            <section className="section-padding" style={{ background: 'var(--primary-color)', color: 'white' }}>
                <div className="container" style={{ textAlign: 'center' }}>
                    <span style={{ display: 'inline-block', background: 'rgba(255,255,255,0.1)', padding: '0.25rem 1rem', borderRadius: '4px', marginBottom: '1rem' }}>
                        Yerel Ofis Hizmeti: {city.name}
                    </span>
                    <h1 style={{ color: 'white' }}>{title}</h1>
                    <p style={{ maxWidth: '800px', margin: '0 auto', fontSize: '1.125rem', color: 'rgba(255,255,255,0.8)' }}>
                        Yerel mahkeme (Diyarbakır Adliyesi) süreçleri ve profesyonel hukuki danışmanlık hizmetlerimizle {city.name} bölgesinde yanınızdayız.
                    </p>
                </div>
            </section>

            <section className="section-padding">
                <div className="container" style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap' }}>
                    <article className="card animate-fade-in" style={{ flex: '1 1 60%', padding: '2rem', background: '#fff' }}>
                        <RichTextRenderer content={content} />

                        {/* Conversion CTA at bottom of content */}
                        <div style={{ marginTop: '3rem', padding: '2rem', background: 'rgba(193, 154, 91, 0.1)', borderRadius: '8px', borderLeft: '4px solid var(--secondary-color)' }}>
                            <h3>{title} İhtiyacınız mı Var?</h3>
                            <p>Hukuki sürecinizi şansa bırakmayın. Uzman kadromuzla hemen iletişime geçerek detaylı bilgi alın.</p>
                            <a href="/iletisim" className="btn btn-primary" style={{ marginTop: '1rem' }}>Hemen Bize Ulaşın</a>
                        </div>
                    </article>

                    <aside style={{ flex: '1 1 30%', minWidth: '300px' }}>
                        <div className="card" style={{ marginBottom: '2rem', background: 'var(--primary-color)', color: 'white' }}>
                            <h3 style={{ color: 'white' }}>İletişim</h3>
                            <p style={{ color: 'rgba(255,255,255,0.7)' }}>Size en iyi şekilde yardımcı olabilmemiz için iletişim numaralarımızdan 7/24 ulaşabilirsiniz.</p>
                            <a href="tel:+905551234567" className="btn btn-primary" style={{ width: '100%', marginBottom: '1rem', background: 'white', color: 'var(--primary-color)' }}>Telefon Et</a>
                            <a href="https://wa.me/905551234567" className="btn btn-secondary" style={{ width: '100%', color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}>Whatsapp'tan Yazın</a>
                        </div>

                        {practiceArea.faqs.length > 0 && (
                            <div className="card" style={{ marginBottom: '2rem' }}>
                                <h3>{city.name} Sıkça Sorulan Sorular</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {practiceArea.faqs.map(faq => (
                                        <details key={faq.id} style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                                            <summary style={{ fontWeight: 600, cursor: 'pointer', padding: '0.5rem 0' }}>{faq.question.replace('{city}', city.name)}</summary>
                                            <p style={{ marginTop: '0.5rem', fontSize: '0.95rem' }}>{faq.answer.replace('{city}', city.name)}</p>
                                        </details>
                                    ))}
                                </div>
                            </div>
                        )}

                        {practiceArea.blogPosts.length > 0 && (
                            <div className="card">
                                <h3>İlgili Makaleler</h3>
                                <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {practiceArea.blogPosts.map(post => (
                                        <li key={post.id}>
                                            <a href={`/blog/${post.slug}`} style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                                                {post.title}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </aside>
                </div>
            </section>
        </>
    );
}
