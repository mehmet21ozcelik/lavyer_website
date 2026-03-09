import { prisma } from '@/lib/db/prisma';
import { unstable_cache } from 'next/cache';
import { CACHE_TAGS } from '@/lib/cache/tags';

export const getPracticeAreas = unstable_cache(
    async () => {
        try {
            return await prisma.practiceArea.findMany({
                orderBy: { name: 'asc' },
                include: { seo: true }
            });
        } catch (error) {
            console.error('getPracticeAreas error:', error);
            return [];
        }
    },
    ['practice_areas_list'],
    {
        tags: [CACHE_TAGS.categories],
    }
);

export const getPracticeAreaBySlug = unstable_cache(
    async (slug: string) => {
        try {
            return await prisma.practiceArea.findUnique({
                where: { slug },
                include: {
                    faqs: { orderBy: { order: 'asc' } },
                    blogPosts: {
                        where: { status: 'PUBLISHED' },
                        take: 5,
                        orderBy: { createdAt: 'desc' },
                        include: { practiceArea: true }
                    },
                    seo: true
                }
            });
        } catch (error) {
            console.error('getPracticeAreaBySlug error:', error);
            return null;
        }
    },
    ['practice_area_detail'],
    {
        tags: [CACHE_TAGS.categories],
    }
);
