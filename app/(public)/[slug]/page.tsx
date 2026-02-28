import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db/prisma';
import { ArticleSchema } from '@/components/seo/SchemaOrg';
import RichTextRenderer from '@/components/ui/RichTextRenderer';

// This is a dynamic route that handles:
// 1. National Pillar Pages: e.g. /bosanma-avukati  (Phase 2)
// 2. Informational City Pages: e.g. /bosanma-davasi-ankara (Phase 3)
// We do NOT use LocalBusiness schema here.

export async function generateStaticParams() {
    try {
        // 1. National slugs
        const areas = await prisma.practiceArea.findMany({ select: { slug: true } });
        const nationalPaths = areas.map(area => ({ slug: area.slug }));

        // 2. Informational non-physical city slugs
        const infoCities = await prisma.cityPracticeArea.findMany({
            where: { city: { hasPhysicalOffice: false } },
            select: {
                city: { select: { slug: true } },
                practiceArea: { select: { slug: true } }
            }
        });

        // We establish a convention: /bosanma-davasi-ankara or /bosanma-avukati-ankara. 
        // For backwards compatibility and logic, we use {practiceArea}-{city}
        const infoPaths = infoCities.map(cpa => ({
            slug: `${cpa.practiceArea.slug}-${cpa.city.slug}`
        }));

        return [...nationalPaths, ...infoPaths];
    } catch (e) {
        return [];
    }
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
    // Check if it's a National page purely by slug
    const nationalArea = await prisma.practiceArea.findUnique({
        where: { slug: params.slug },
        include: { seo: true }
    });

    if (nationalArea) {
        return {
            title: nationalArea.seo?.title || `${nationalArea.name} | Türkiye Geneli Hukuki Rehber`,
            description: nationalArea.seo?.description || `Uzman ${nationalArea.name} kadromuzla hazırladığımız kapsamlı ve emsal kararlı hukuki rehber.`
        };
    }

    // Otherwise, check informational city logic (slug: practiceAreaSlug-citySlug)
    // We reverse extract by splitting.
    const parts = params.slug.split('-');
    const citySlug = parts.pop(); // last part is city
    const practiceAreaSlug = parts.join('-');

    const infoArea = await prisma.cityPracticeArea.findFirst({
        where: {
            city: { slug: citySlug, hasPhysicalOffice: false },
            practiceArea: { slug: practiceAreaSlug }
        },
        include: { city: true, practiceArea: true, seo: true }
    });

    if (infoArea) {
        return {
            title: infoArea.seo?.title || `${infoArea.city.name} ${infoArea.practiceArea.name} | Bilgi Rehberi`,
            description: infoArea.seo?.description || `${infoArea.city.name} bölgesindeki ${infoArea.practiceArea.name} davaları, süreçler ve hukuki haklarınız hakkında detaylı bilgi.`
        }
    }

    return {};
}

export default async function NationalOrInfoPage({ params }: { params: { slug: string } }) {
    // 1. Determine if National Page
    const nationalArea = await prisma.practiceArea.findUnique({
        where: { slug: params.slug },
        include: {
            faqs: { orderBy: { order: 'asc' } },
            blogPosts: {
                where: { status: 'PUBLISHED' },
                take: 5,
                orderBy: { createdAt: 'desc' }
            }
        }
    });

    if (nationalArea) {
        return renderNationalPage(nationalArea, params.slug);
    }

    // 2. Determine if Informational Local Page
    const parts = params.slug.split('-');
    const citySlug = parts.pop();
    const practiceAreaSlug = parts.join('-');

    if (!citySlug || !practiceAreaSlug) return notFound();

    const infoArea = await prisma.cityPracticeArea.findFirst({
        where: {
            city: { slug: citySlug, hasPhysicalOffice: false },
            practiceArea: { slug: practiceAreaSlug }
        },
        include: {
            city: true,
            practiceArea: true
        }
    });

    if (infoArea) {
        return renderInformationalCityPage(infoArea, params.slug);
    }

    notFound();
}

function renderNationalPage(area: any, originalUrl: string) {
    // Phase 2: National Authority Page (Deep Legal Guide)
    return (
        <>
            {/* National Authority gets Article/Educational Schema instead of commercial LocalBusiness schema */}
            <ArticleSchema
                title={`${area.name} | Kapsamlı Hukuki Rehber ve Emsal Kararlar`}
                description={area.content.substring(0, 150)}
                datePublished={new Date(area.createdAt).toISOString()}
                dateModified={new Date().toISOString()}
                authorName="Av. Mehmet Lavyer"
                url={`https://www.diyarbakiravukat.com/${originalUrl}`}
            />

            <section className="section-padding" style={{ background: '#111827', color: 'white' }}>
                <div className="container" style={{ textAlign: 'center' }}>
                    <span style={{ display: 'inline-block', background: 'rgba(255,255,255,0.1)', padding: '0.25rem 1rem', borderRadius: '4px', marginBottom: '1rem', color: '#60a5fa' }}>
                        Ulusal Hukuki Rehber
                    </span>
                    <h1 style={{ color: 'white' }}>{area.name} - Yasal Mevzuat ve Yargıtay Emsalleri</h1>
                    <p style={{ maxWidth: '800px', margin: '0 auto', fontSize: '1.125rem', color: 'rgba(255,255,255,0.7)' }}>
                        Türkiye genelinde geçerli {area.name} süreçleri, dava şartları, mevzuat analizleri ve güncel içtihatlar hakkında detaylı rehber.
                    </p>
                </div>
            </section>

            <section className="section-padding">
                <div className="container">
                    <article className="card" style={{ padding: '3rem', fontSize: '1.1rem', lineHeight: '1.8' }}>
                        <RichTextRenderer content={area.content} />
                    </article>

                    {/* Educational CTA instead of "Hire me locally" */}
                    <div style={{ marginTop: '2rem', padding: '2rem', background: '#f9fafb', borderLeft: '4px solid #3b82f6', borderRadius: '8px' }}>
                        <h3 style={{ marginTop: 0 }}>Daha Fazla Bilgiye Mi İhtiyacınız Var?</h3>
                        <p>Mevzuat ve Yargıtay kararları olayların spesifik koşullarına göre değişkenlik gösterir. Kendi dosyanızdaki özel durumlarla ilgili danışmanlık talep edebilirsiniz.</p>
                        <a href="/iletisim" className="btn btn-secondary" style={{ marginTop: '1rem' }}>Soru Sorun</a>
                    </div>
                </div>
            </section>
        </>
    );
}

function renderInformationalCityPage(infoArea: any, originalUrl: string) {
    // Phase 3: Controlled Visibility (NO fake local schemas, pure information)
    const { city, practiceArea } = infoArea;
    const content = infoArea.customContent || practiceArea.content;
    const title = `${city.name} Bölgesinde ${practiceArea.name} Süreçleri`;

    return (
        <>
            {/* Pure Article Schema to avoid Doorway Page Penalties */}
            <ArticleSchema
                title={title}
                description={content.substring(0, 150)}
                datePublished={new Date().toISOString()}
                dateModified={new Date().toISOString()}
                authorName="Av. Mehmet Lavyer"
                url={`https://www.diyarbakiravukat.com/${originalUrl}`}
            />

            <section className="section-padding" style={{ background: '#f3f4f6', color: '#1f2937' }}>
                <div className="container" style={{ textAlign: 'center' }}>
                    <span style={{ display: 'inline-block', background: '#e5e7eb', padding: '0.25rem 1rem', borderRadius: '4px', marginBottom: '1rem', color: '#4b5563', fontSize: '0.9rem' }}>
                        Bilgilendirme Makalesi
                    </span>
                    <h1 style={{ color: '#111827' }}>{title}</h1>
                    <p style={{ maxWidth: '800px', margin: '0 auto', fontSize: '1.125rem' }}>
                        {city.name} ve çevre illerindeki hukuki süreçler, ikamet koşulları ve dava açma prosedürleri hakkında genel bilgilendirme kılavuzu.
                    </p>
                </div>
            </section>

            <section className="section-padding">
                <div className="container" style={{ maxWidth: '900px' }}>

                    {/* Penalty Warning for transparency and SEO Authority */}
                    <div style={{ background: '#fffbeb', color: '#92400e', padding: '1rem 1.5rem', borderRadius: '8px', marginBottom: '2rem', border: '1px solid #fef3c7' }}>
                        <strong style={{ display: 'block', marginBottom: '0.5rem' }}>Önemli Not:</strong>
                        Büromuzun ana ofisi <strong>Diyarbakır</strong>'dadır. Bu sayfa {city.name} bölgesindeki vatandaşlarımızın hukuki hakları konusunda bilgilendirilmesi amacıyla (Mevzuata dayalı olarak) hazırlanmıştır.
                    </div>

                    <article className="card" style={{ padding: '2rem', fontSize: '1.05rem', lineHeight: '1.8' }}>
                        <RichTextRenderer content={content} />
                    </article>
                </div>
            </section>
        </>
    );
}
