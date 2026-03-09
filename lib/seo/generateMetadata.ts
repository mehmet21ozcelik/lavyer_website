import { Metadata } from 'next';
import { prisma } from '@/lib/db/prisma';
import { getSiteSettings } from '@/lib/services/settings.service';

interface BaseSEOData {
    title: string;
    description: string;
    canonicalUrl?: string | null;
    ogImage?: string | null;
    noIndex: boolean;
}

export const buildMetadata = async (data?: BaseSEOData | null, fallback?: Partial<Metadata>): Promise<Metadata> => {
    const settings = await getSiteSettings();

    if (!data) {
        return {
            title: fallback?.title || settings?.title || 'Diyarbakır Avukatlık Bürosu',
            description: fallback?.description || settings?.description || 'Diyarbakır hukuki danışmanlık ve avukatlık hizmetleri.',
            ...fallback
        }
    }

    const { title, description, canonicalUrl, ogImage, noIndex } = data;

    return {
        title,
        description,
        alternates: {
            canonical: canonicalUrl || undefined,
        },
        robots: {
            index: !noIndex,
            follow: !noIndex,
        },
        openGraph: {
            title,
            description,
            images: ogImage ? [{ url: ogImage }] : undefined,
        }
    };
};

export async function getCityPracticeAreaMetadata(citySlug: string, practiceAreaSlug: string): Promise<Metadata> {
    const data = await prisma.cityPracticeArea.findFirst({
        where: {
            city: { slug: citySlug },
            practiceArea: { slug: practiceAreaSlug }
        },
        include: { seo: true, city: true, practiceArea: true }
    });

    return await buildMetadata(data?.seo, {
        title: `${data?.city.name || 'Diyarbakır'} ${data?.practiceArea.name || 'Avukatı'}`,
        description: `${data?.city.name} bölgesinde ${data?.practiceArea.name} alanında uzman avukatlık hizmeti.`
    });
}

export async function getBlogPostMetadata(slug: string): Promise<Metadata> {
    const data = await prisma.blogPost.findUnique({
        where: { slug },
        include: { seo: true }
    });

    return await buildMetadata(data?.seo, {
        title: data?.title,
        description: data?.excerpt || data?.title
    });
}
