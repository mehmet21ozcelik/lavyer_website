import { prisma } from '@/lib/db/prisma';
import Image from 'next/image';
import Link from 'next/link';

export const revalidate = 3600; // ISR Support

export const metadata = {
    title: 'Hukuk Blogu | Diyarbakır Avukatlık Bürosu',
    description: 'Hukuki gelişmeler, emsal kararlar ve makaleler.'
};

export default async function BlogPage({
    searchParams
}: {
    searchParams: { page?: string }
}) {
    const currentPage = Number(searchParams.page) || 1;
    const postsPerPage = 6;

    let posts: any[] = [];
    let totalPosts = 0;

    try {
        totalPosts = await prisma.blogPost.count({
            where: { status: 'PUBLISHED' }
        });

        posts = await prisma.blogPost.findMany({
            take: postsPerPage,
            skip: (currentPage - 1) * postsPerPage,
            where: { status: 'PUBLISHED' },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                title: true,
                slug: true,
                excerpt: true,
                createdAt: true,
                practiceArea: true,
                seo: true
            }
        });
    } catch (e) { console.warn('DB skipped.'); }

    const totalPages = Math.ceil(totalPosts / postsPerPage);

    return (
        <section className="section-padding" style={{ minHeight: '80vh', backgroundColor: 'var(--background-color)' }}>
            <div className="container">
                {/* Header & Breadcrumb */}
                <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                        <Link href="/" style={{ color: 'var(--text-secondary)' }}>Anasayfa</Link> <span style={{ margin: '0 0.5rem' }}>/</span> <span style={{ color: 'var(--primary-color)', fontWeight: 600 }}>Blog</span>
                    </p>
                    <h1 style={{ color: 'var(--primary-color)', fontFamily: 'var(--font-heading)' }}>Hukuk Blogu</h1>
                    <p style={{ maxWidth: '700px', margin: '0 auto', fontSize: '1.1rem', color: 'var(--text-secondary)' }}>
                        Uzman avukatlarımız tarafından kaleme alınan güncel hukuki makaleler, Yargıtay kararları ve hukuki süreçlerle ilgili faydalı bilgiler.
                    </p>
                </div>

                {/* Modern Grid Layout */}
                <div className="grid grid-3" style={{ gap: '2rem' }}>
                    {posts.map(post => (
                        <article key={post.id} className="card" style={{
                            display: 'flex',
                            flexDirection: 'column',
                            padding: '1.5rem',
                            border: '1px solid var(--border-color)',
                            backgroundColor: 'var(--white)',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
                        }}>
                            <div style={{
                                width: '100%',
                                height: '200px',
                                backgroundColor: 'var(--border-color)',
                                borderRadius: '4px',
                                marginBottom: '1.5rem',
                                position: 'relative',
                                overflow: 'hidden'
                            }}>
                                {(post.seo as any)?.ogImage ? (
                                    <Image
                                        src={(post.seo as any).ogImage}
                                        alt={post.title}
                                        fill
                                        style={{ objectFit: 'cover' }}
                                        sizes="(max-width: 768px) 100vw, 30vw"
                                    />
                                ) : (
                                    <div style={{
                                        position: 'absolute', inset: 0,
                                        background: 'linear-gradient(to bottom right, var(--primary-color), var(--secondary-color))',
                                        opacity: 0.1
                                    }} />
                                )}
                            </div>

                            <div style={{ flex: 1 }}>
                                {post.practiceArea && (
                                    <span style={{
                                        fontSize: '0.75rem',
                                        color: 'var(--secondary-color)',
                                        fontWeight: 700,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.05em'
                                    }}>
                                        {post.practiceArea.name}
                                    </span>
                                )}
                                <h2 style={{
                                    fontSize: '1.25rem',
                                    margin: '0.5rem 0 1rem',
                                    fontFamily: 'var(--font-heading)',
                                    lineHeight: '1.4'
                                }}>
                                    <Link href={`/blog/${post.slug}`} style={{ color: 'var(--primary-color)' }}>
                                        {post.title}
                                    </Link>
                                </h2>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6' }}>
                                    {post.excerpt && post.excerpt.length > 100 ? `${post.excerpt.substring(0, 100)}...` : post.excerpt}
                                </p>
                            </div>

                            <div style={{
                                marginTop: '1.5rem',
                                paddingTop: '1.25rem',
                                borderTop: '1px solid var(--border-color)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                    {new Date(post.createdAt).toLocaleDateString('tr-TR')}
                                </span>
                                <Link
                                    href={`/blog/${post.slug}`}
                                    style={{
                                        fontWeight: 600,
                                        color: 'var(--secondary-color)',
                                        fontSize: '0.9rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.25rem'
                                    }}
                                >
                                    Devamı <span style={{ fontSize: '1.2em' }}>&rsaquo;</span>
                                </Link>
                            </div>
                        </article>
                    ))}
                </div>

                {posts.length === 0 && (
                    <div style={{ padding: '4rem', textAlign: 'center', background: 'var(--white)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Henüz yayında makale bulunmamaktadır.</p>
                    </div>
                )}

                {/* Downward Pagination */}
                {totalPages > 1 && (
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '0.5rem',
                        marginTop: '4rem',
                        paddingTop: '2rem',
                        borderTop: '1px solid var(--border-color)'
                    }}>
                        {currentPage > 1 && (
                            <Link
                                href={`/blog?page=${currentPage - 1}`}
                                className="btn btn-secondary"
                                style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                            >
                                &laquo; Önceki
                            </Link>
                        )}

                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            {Array.from({ length: totalPages }).map((_, i) => {
                                const pageNum = i + 1;
                                return (
                                    <Link
                                        key={pageNum}
                                        href={`/blog?page=${pageNum}`}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            width: '36px',
                                            height: '36px',
                                            borderRadius: '4px',
                                            backgroundColor: currentPage === pageNum ? 'var(--primary-color)' : 'transparent',
                                            color: currentPage === pageNum ? 'white' : 'var(--text-primary)',
                                            border: `1px solid ${currentPage === pageNum ? 'var(--primary-color)' : 'var(--border-color)'}`,
                                            fontWeight: currentPage === pageNum ? 'bold' : 'normal',
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        {pageNum}
                                    </Link>
                                );
                            })}
                        </div>

                        {currentPage < totalPages && (
                            <Link
                                href={`/blog?page=${currentPage + 1}`}
                                className="btn btn-secondary"
                                style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                            >
                                Sonraki &raquo;
                            </Link>
                        )}
                    </div>
                )}
            </div>
        </section>
    );
}
