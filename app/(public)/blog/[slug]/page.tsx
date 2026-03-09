import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db/prisma';
import { getBlogPostMetadata } from '@/lib/seo/generateMetadata';
import { ArticleSchema } from '@/components/seo/SchemaOrg';
import RichTextRenderer from '@/components/ui/RichTextRenderer';
import Link from 'next/link';

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

import { getPostBySlug, getLatestPosts } from '@/lib/services/blog.service';

export async function generateMetadata({ params }: { params: { slug: string } }) {
    return getBlogPostMetadata(params.slug);
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
    const post = await getPostBySlug(params.slug);

    if (!post || post.status !== 'PUBLISHED') {
        notFound();
    }

    // Fetch recent posts for the sidebar
    const allRecentPosts = await getLatestPosts(6);
    const recentPosts = allRecentPosts.filter(p => p.id !== post.id).slice(0, 5);

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

            <div style={{ backgroundColor: '#f9f9fb', borderBottom: '1px solid var(--border-color)', padding: '1rem 0' }}>
                <div className="container">
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0 }}>
                        <Link href="/" style={{ color: 'var(--text-secondary)' }}>Anasayfa</Link>
                        <span style={{ margin: '0 0.5rem' }}>/</span>
                        <Link href="/blog" style={{ color: 'var(--text-secondary)' }}>Blog</Link>
                        <span style={{ margin: '0 0.5rem' }}>/</span>
                        <span style={{ color: 'var(--primary-color)', fontWeight: 600 }}>{title}</span>
                    </p>
                </div>
            </div>

            <section className="container section-padding" style={{ display: 'flex', flexWrap: 'wrap', gap: '3rem', alignItems: 'flex-start' }}>

                {/* Left Column: Main Content */}
                <article style={{ flex: '1 1 65%', minWidth: '300px', backgroundColor: 'var(--white)', padding: '2.5rem', borderRadius: '8px', border: '1px solid var(--border-color)', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                    <header style={{ marginBottom: '2.5rem', paddingBottom: '2rem', borderBottom: '1px solid var(--border-color)' }}>
                        {post.practiceArea && (
                            <span style={{
                                color: 'var(--white)',
                                backgroundColor: 'var(--secondary-color)',
                                padding: '0.25rem 0.75rem',
                                borderRadius: '4px',
                                fontSize: '0.8rem',
                                fontWeight: 600,
                                textTransform: 'uppercase',
                                letterSpacing: '1px',
                                display: 'inline-block',
                                marginBottom: '1rem'
                            }}>
                                {post.practiceArea.name}
                            </span>
                        )}
                        <h1 style={{ fontSize: '2.5rem', margin: '0 0 1rem 0', fontFamily: 'var(--font-heading)', color: 'var(--primary-color)', wordBreak: 'break-word', overflowWrap: 'break-word' }}>{title}</h1>
                        <div style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.95rem' }}>
                            <time dateTime={createdAt.toISOString()} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                {new Date(createdAt).toLocaleDateString('tr-TR')}
                            </time>
                            <span>&bull;</span>
                            <span>Diyarbakır Avukat</span>
                        </div>
                    </header>

                    {/* Blog Content Renderer */}
                    <div style={{ lineHeight: '1.8', color: 'var(--text-primary)', fontSize: '1.05rem' }}>
                        <RichTextRenderer content={content} />
                    </div>

                    {/* Content Strategy (Cluster Model): Automatic linking block */}
                    {post.practiceArea && post.practiceArea.cities && post.practiceArea.cities.length > 0 && (
                        <div style={{ padding: '2rem', background: 'var(--background-color)', borderRadius: '8px', borderLeft: '4px solid var(--secondary-color)', marginTop: '4rem' }}>
                            <h3 style={{ color: 'var(--primary-color)', marginBottom: '1rem' }}>Bu Konuda Hukuki Desteğe mi İhtiyacınız Var?</h3>
                            <p style={{ color: 'var(--text-secondary)' }}>Makamımız, <strong>{post.practiceArea.name}</strong> alanında uzman avukat kadrosuyla müvekkillerine şeffaf ve profesyonel destek sağlamaktadır.</p>

                            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                {/* 1. Physical Local Pillar Link */}
                                {post.practiceArea.cities.filter((cpa: any) => cpa.city.hasPhysicalOffice).map((cpa: any) => (
                                    <a key={cpa.id} href={`/${cpa.city.slug}/${post.practiceArea?.slug}`} className="btn btn-primary" style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}>
                                        {cpa.city.name} {post.practiceArea?.name} Desteği
                                    </a>
                                ))}

                                {/* 2. National Authority Link */}
                                <a href={`/${post.practiceArea.slug}`} className="btn btn-secondary" style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}>
                                    Genel {post.practiceArea.name} Bilgileri
                                </a>
                            </div>
                        </div>
                    )}
                </article>

                {/* Right Column: Sidebar */}
                <aside style={{ flex: '1 1 30%', minWidth: '280px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>



                    {/* Quick Access / Services */}
                    <div style={{ backgroundColor: 'var(--white)', padding: '2rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                        <h3 style={{ fontSize: '1.25rem', borderBottom: '2px solid var(--secondary-color)', paddingBottom: '0.5rem', marginBottom: '1.5rem', color: 'var(--primary-color)' }}>
                            Hızlı Erişim
                        </h3>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <li><Link href="/" style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span style={{ color: 'var(--secondary-color)' }}>&bull;</span> Anasayfa</Link></li>
                            <li><Link href="/hizmetler" style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span style={{ color: 'var(--secondary-color)' }}>&bull;</span> Çalışma Alanlarımız</Link></li>
                            <li><Link href="/iletisim" style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span style={{ color: 'var(--secondary-color)' }}>&bull;</span> İletişim</Link></li>
                        </ul>
                    </div>

                    {/* Recent Posts Widget */}
                    {recentPosts.length > 0 && (
                        <div style={{ backgroundColor: 'var(--white)', padding: '2rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                            <h3 style={{ fontSize: '1.25rem', borderBottom: '2px solid var(--secondary-color)', paddingBottom: '0.5rem', marginBottom: '1.5rem', color: 'var(--primary-color)' }}>
                                Son Yazılar
                            </h3>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {recentPosts.map((rp) => (
                                    <li key={rp.id} style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                                        <Link href={`/blog/${rp.slug}`} style={{ color: 'var(--primary-color)', fontWeight: 500, lineHeight: '1.4', display: 'block', marginBottom: '0.25rem' }}>
                                            {rp.title}
                                        </Link>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                            {new Date(rp.createdAt).toLocaleDateString('tr-TR')}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                </aside>
            </section>
        </>
    );
}
