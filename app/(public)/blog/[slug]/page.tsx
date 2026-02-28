import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db/prisma';
import { getBlogPostMetadata } from '@/lib/seo/generateMetadata';
import { ArticleSchema } from '@/components/seo/SchemaOrg';
import RichTextRenderer from '@/components/ui/RichTextRenderer';

export const revalidate = 3600;

export async function generateStaticParams() {
    try {
        const posts = await prisma.blogPost.findMany({
            where: { status: 'PUBLISHED' },
            select: { slug: true }
        });
        return posts.map(post => ({ slug: post.slug }));
    } catch (e) {
        console.warn("DB connection failed during build, skipping static param generation.");
        return [];
    }
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
    return getBlogPostMetadata(params.slug);
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
    const post = await prisma.blogPost.findUnique({
        where: { slug: params.slug },
        include: {
            practiceArea: {
                include: {
                    cities: { include: { city: true } }
                }
            },
            seo: true
        }
    });

    if (!post || post.status !== 'PUBLISHED') {
        notFound();
    }

    const { title, content, seo, excerpt, createdAt, updatedAt } = post;

    return (
        <>
            <ArticleSchema
                title={seo?.title || title}
                description={seo?.description || excerpt || title}
                image={seo?.ogImage || undefined}
                datePublished={createdAt.toISOString()}
                dateModified={updatedAt.toISOString()}
                authorName="Diyarbakır Avukatlık Bürosu"
                url={`https://www.diyarbakiravukat.com/blog/${post.slug}`}
            />

            <article className="container section-padding" style={{ maxWidth: '800px', margin: '0 auto' }}>
                <header style={{ marginBottom: '3rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '2rem' }}>
                    {post.practiceArea && (
                        <span style={{ color: 'var(--secondary-color)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>
                            {post.practiceArea.name}
                        </span>
                    )}
                    <h1 style={{ fontSize: '3rem', margin: '1rem 0' }}>{title}</h1>
                    <div style={{ color: 'var(--text-secondary)' }}>
                        <time dateTime={createdAt.toISOString()}>
                            {new Date(createdAt).toLocaleDateString('tr-TR')}
                        </time>
                    </div>
                </header>

                <RichTextRenderer content={content} />

                {/* Content Strategy (Cluster Model): Automatic linking block */}
                {post.practiceArea && (
                    <aside style={{ marginTop: '5rem', padding: '2rem', background: 'var(--primary-color)', color: 'white', borderRadius: '8px', textAlign: 'center' }}>
                        <h3 style={{ color: 'white', marginBottom: '1rem' }}>Profesyonel Hukuki Destek</h3>
                        <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '1.5rem', fontSize: '1.1rem' }}>
                            Diyarbakır'da {post.practiceArea.name.toLowerCase()} alanıyla ilgili davalarınızda uzman ekibimizden profesyonel destek almak için ilgili sayfamızı inceleyebilirsiniz.
                        </p>
                        <a href={`/diyarbakir-${post.practiceArea.slug}`} className="btn btn-secondary" style={{ backgroundColor: 'white', color: 'var(--primary-color)', borderColor: 'white' }}>
                            Diyarbakır {post.practiceArea.name} Detayları
                        </a>
                    </aside>
                )}
                {post.practiceArea && post.practiceArea.cities && post.practiceArea.cities.length > 0 && (
                    <div style={{ padding: '2rem', background: 'var(--glass-bg)', borderRadius: '8px', borderLeft: '4px solid var(--primary-color)', marginTop: '3rem' }}>
                        <h3>Bu Konuda Hukuki Desteğe mi İhtiyacınız Var?</h3>
                        <p>Makamımız, <strong>{post.practiceArea.name}</strong> alanında uzman avukat kadrosuyla müvekkillerine şeffaf ve profesyonel destek sağlamaktadır.</p>

                        <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                            {/* 1. Physical Local Pillar Link (Strategy Phase 1) */}
                            {post.practiceArea.cities.filter((cpa: any) => cpa.city.hasPhysicalOffice).map((cpa: any) => (
                                <a key={cpa.id} href={`/${cpa.city.slug}/${post.practiceArea?.slug}`} className="btn btn-primary">
                                    {cpa.city.name} {post.practiceArea?.name} Desteği Alın
                                </a>
                            ))}

                            {/* 2. National Authority Link (Strategy Phase 2) */}
                            <a href={`/${post.practiceArea.slug}`} className="btn btn-secondary">
                                Tüm Türkiye Genel {post.practiceArea.name} Bilgileri
                            </a>
                        </div>
                    </div>
                )}
            </article>
        </>
    );
}
