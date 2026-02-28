import { prisma } from '@/lib/db/prisma';
import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

// Disable caching for preview explicitly
export const revalidate = 0;

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'super-secret-key-12345');

export default async function PreviewBlogPost({ params }: { params: { slug: string } }) {
    // Security Layer (Only Admin/Editor can view previews)
    const token = cookies().get('auth_token')?.value;

    if (!token) {
        return notFound(); // Do not leak that a draft exists to public users
    }

    try {
        await jwtVerify(token, JWT_SECRET);
    } catch (e) {
        return notFound();
    }

    const post = await prisma.blogPost.findUnique({
        where: { slug: params.slug },
        include: { practiceArea: true }
    });

    if (!post) {
        return notFound();
    }

    return (
        <>
            <div style={{ backgroundColor: '#fff3cd', color: '#856404', padding: '1rem', textAlign: 'center', fontWeight: 'bold' }}>
                Canlı Önizleme Modu (Oturumunuz aktif olduğu için görüntülüyorsunuz)
            </div>
            <article className="section-padding">
                <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>

                    <header style={{ marginBottom: '2rem', textAlign: 'center' }}>
                        {post.practiceArea && (
                            <span style={{
                                background: 'var(--primary-color)',
                                color: 'white',
                                padding: '0.25rem 0.75rem',
                                borderRadius: '999px',
                                fontSize: '0.875rem',
                                fontWeight: 600,
                                marginBottom: '1rem',
                                display: 'inline-block'
                            }}>
                                {post.practiceArea.name}
                            </span>
                        )}
                        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                            {post.title}
                        </h1>
                        <p style={{ color: 'var(--text-secondary)' }}>
                            Son Güncelleme: {new Date(post.updatedAt).toLocaleDateString('tr-TR')}
                        </p>
                    </header>

                    <div
                        className="prose prose-lg mx-auto"
                        style={{
                            lineHeight: 1.8,
                            color: 'var(--text-primary)',
                            fontSize: '1.125rem'
                        }}
                        dangerouslySetInnerHTML={{ __html: post.content }}
                    />

                </div>
            </article>
        </>
    );
}
