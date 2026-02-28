import { prisma } from '@/lib/db/prisma';
import EditBlogForm from './EditBlogForm';
import { notFound } from 'next/navigation';

export const revalidate = 0; // Dynamic route

export default async function EditBlogPage({ params }: { params: { id: string } }) {
    const post = await prisma.blogPost.findUnique({
        where: { id: params.id },
        include: { seo: true, versions: { orderBy: { createdAt: 'desc' } } }
    });

    if (!post) {
        return notFound();
    }

    const practiceAreas = await prisma.practiceArea.findMany({ select: { id: true, name: true } });

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <h1>Makale Düzenle: {post.title}</h1>
            <EditBlogForm post={post as any} practiceAreas={practiceAreas} />
        </div>
    );
}
