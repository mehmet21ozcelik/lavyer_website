import { prisma } from '@/lib/db/prisma';
import { unstable_cache } from 'next/cache';
import { CACHE_TAGS } from '@/lib/cache/tags';

export const getLatestPosts = unstable_cache(
    async (limit: number = 3) => {
        try {
            return await prisma.blogPost.findMany({
                take: limit,
                where: { status: 'PUBLISHED' },
                orderBy: { createdAt: 'desc' },
                include: { practiceArea: true, seo: true }
            });
        } catch (error) {
            console.error('getLatestPosts error:', error);
            return [];
        }
    },
    ['latest_posts'],
    {
        tags: [CACHE_TAGS.posts],
    }
);

export const getPostBySlug = unstable_cache(
    async (slug: string) => {
        try {
            return await prisma.blogPost.findUnique({
                where: { slug },
                include: {
                    practiceArea: {
                        include: {
                            cities: { include: { city: true } }
                        }
                    },
                    seo: true
                }
            });
        } catch (error) {
            console.error('getPostBySlug error:', error);
            return null;
        }
    },
    ['post_detail'],
    {
        tags: [CACHE_TAGS.posts],
    }
);

export async function getPaginatedPosts(page: number, limit: number) {
    // We don't use unstable_cache here because page/limit results in too many cache variations
    // usually we only cache the first page or use a different strategy.
    // For now, let's just do a direct query or simple cache.
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
        prisma.blogPost.findMany({
            take: limit,
            skip,
            where: { status: 'PUBLISHED' },
            orderBy: { createdAt: 'desc' },
            include: { practiceArea: true, seo: true }
        }),
        prisma.blogPost.count({
            where: { status: 'PUBLISHED' }
        })
    ]);

    return { posts, total };
}
