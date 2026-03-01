import { prisma } from '@/lib/db/prisma';
import { unstable_cache } from 'next/cache';
import { CACHE_TAGS } from '@/lib/cache/tags';

export const getFaqs = unstable_cache(
    async () => {
        try {
            return await prisma.fAQ.findMany({
                orderBy: { order: 'asc' },
                select: {
                    id: true,
                    question: true,
                    answer: true,
                }
            });
        } catch (error) {
            console.error('getFaqs error:', error);
            throw new Error('Failed to load FAQs');
        }
    },
    ['faqs_list'], // Cache key
    {
        tags: [CACHE_TAGS.faqs],
        revalidate: 86400 // Revalidate daily at a minimum, or on-demand
    }
);
