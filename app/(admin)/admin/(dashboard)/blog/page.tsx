import { prisma } from '@/lib/db/prisma';
import Link from 'next/link';
import AdminPageHeader from '@/components/admin/AdminPageHeader';

export const revalidate = 0; // Don't cache admin listing

export default async function AdminBlogList() {
    const posts = await prisma.blogPost.findMany({
        orderBy: { createdAt: 'desc' },
        include: { practiceArea: true }
    });

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <AdminPageHeader
                title="Makaleler"
                actions={
                    <Link href="/admin/blog/create" className="btn btn-primary">
                        + Yeni Makale Ekle
                    </Link>
                }
            />

            <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid var(--border-color)' }}>
                            <th style={{ padding: '1rem', fontWeight: 600 }}>Makale Başlığı</th>
                            <th style={{ padding: '1rem', fontWeight: 600 }}>Kategori</th>
                            <th style={{ padding: '1rem', fontWeight: 600 }}>Durum</th>
                            <th style={{ padding: '1rem', fontWeight: 600 }}>Tarih</th>
                            <th style={{ padding: '1rem', fontWeight: 600, textAlign: 'right' }}>İşlemler</th>
                        </tr>
                    </thead>
                    <tbody>
                        {posts.length === 0 ? (
                            <tr>
                                <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'gray' }}>Henüz makale eklenmemiş.</td>
                            </tr>
                        ) : null}

                        {posts.map(post => (
                            <tr key={post.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background-color 0.2s' }}>
                                <td style={{ padding: '1rem', fontWeight: 500 }}>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>{post.title}</span>
                                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>/{post.slug}</span>
                                    </div>
                                </td>
                                <td style={{ padding: '1rem', fontSize: '0.9rem' }}>
                                    {post.practiceArea?.name || '- Bağımsız -'}
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <span style={{
                                        display: 'inline-block',
                                        padding: '0.25rem 0.75rem',
                                        borderRadius: '999px',
                                        fontSize: '0.8rem',
                                        fontWeight: 600,
                                        backgroundColor: post.status === 'PUBLISHED' ? '#dcfce7' : '#fef3c7',
                                        color: post.status === 'PUBLISHED' ? '#166534' : '#92400e'
                                    }}>
                                        {post.status === 'PUBLISHED' ? 'YAYINDA' : 'TASLAK'}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                    {new Date(post.createdAt).toLocaleDateString('tr-TR')}
                                </td>
                                <td style={{ padding: '1rem', textAlign: 'right', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                    <Link href={`/admin/blog/edit/${post.id}`} style={{ padding: '0.4rem 0.8rem', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '0.85rem' }}>Düzenle</Link>
                                    <a href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer" style={{ padding: '0.4rem 0.8rem', backgroundColor: 'var(--primary-color)', color: 'white', borderRadius: '4px', fontSize: '0.85rem' }}>Önizle</a>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
