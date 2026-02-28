import { prisma } from '@/lib/db/prisma';

export const revalidate = 3600; // ISR Support

export const metadata = {
    title: 'Hukuk Blogu | Diyarbakır Avukatlık Bürosu',
    description: 'Hukuki gelişmeler, emsal kararlar ve makaleler.'
};

export default async function BlogPage() {
    let posts: any[] = [];
    try {
        posts = await prisma.blogPost.findMany({
            take: 20,
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

    return (
        <section className="section-padding" style={{ minHeight: '80vh' }}>
            <div className="container">
                <h1 style={{ marginBottom: '1rem' }}>Hukuk Blogu</h1>
                <p style={{ maxWidth: '800px', fontSize: '1.2rem', marginBottom: '3rem', color: 'var(--text-secondary)' }}>
                    Uzman avukatlarımız tarafından kaleme alınan güncel hukuki makaleler, Yargıtay kararları ve hukuki süreçlerle ilgili faydalı bilgiler.
                </p>

                <div className="grid grid-2">
                    {posts.map(post => (
                        <article key={post.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                            <div style={{ flex: 1 }}>
                                {post.practiceArea && (
                                    <span style={{ fontSize: '0.85rem', color: 'var(--secondary-color)', fontWeight: 600, textTransform: 'uppercase' }}>
                                        {post.practiceArea.name}
                                    </span>
                                )}
                                <h2 style={{ fontSize: '1.5rem', margin: '0.5rem 0' }}>
                                    <a href={`/blog/${post.slug}`} style={{ color: 'var(--text-primary)' }}>{post.title}</a>
                                </h2>
                                <p style={{ color: 'var(--text-secondary)' }}>{post.excerpt}</p>
                            </div>

                            <div style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                    {new Date(post.createdAt).toLocaleDateString('tr-TR')}
                                </span>
                                <a href={`/blog/${post.slug}`} style={{ fontWeight: 600, color: 'var(--secondary-color)' }}>
                                    Devamını Oku &rarr;
                                </a>
                            </div>
                        </article>
                    ))}
                </div>

                {posts.length === 0 && (
                    <div style={{ padding: '3rem', textAlign: 'center', background: 'var(--glass-bg)', borderRadius: '8px' }}>
                        Henüz yayında makale bulunmamaktadır.
                    </div>
                )}
            </div>
        </section>
    );
}
